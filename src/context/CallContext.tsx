import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "./UserContext";
import { toast } from "sonner";

interface Call {
  id: string;
  caller_id: string;
  receiver_id: string;
  call_type: "voice" | "video";
  call_status: "ringing" | "accepted" | "declined" | "missed" | "completed" | "busy";
  channel_name: string;
}

interface CallContextType {
  activeCall: Call | null;
  incomingCall: Call | null;
  isRinging: boolean;
  startCall: (receiverId: string, type: "voice" | "video") => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: () => Promise<void>;
  getToken: (roomName: string, participantName: string) => Promise<string | null>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const receiverChannel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_logs',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newCall = payload.new as Call;
          if (payload.eventType === 'INSERT' && newCall.call_status === 'ringing') {
            setIncomingCall(newCall);
            setIsRinging(true);
          } else if (payload.eventType === 'UPDATE') {
            if (['completed', 'declined', 'missed'].includes(newCall.call_status)) {
              if (incomingCall?.id === newCall.id) {
                setIncomingCall(null);
                setIsRinging(false);
              }
              if (activeCall?.id === newCall.id) {
                setActiveCall(null);
              }
            }
          }
        }
      )
      .subscribe();

    const callerChannel = supabase
      .channel('outgoing-calls')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_logs',
          filter: `caller_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedCall = payload.new as Call;
          if (activeCall?.id === updatedCall.id) {
            if (updatedCall.call_status === 'accepted') {
              setActiveCall(updatedCall);
            } else if (['completed', 'declined', 'busy', 'missed'].includes(updatedCall.call_status)) {
              setActiveCall(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(receiverChannel);
      supabase.removeChannel(callerChannel);
    };
  }, [user?.id, incomingCall?.id, activeCall?.id]);

  const getToken = async (roomName: string, participantName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.functions.invoke('get-agora-token', {
        body: { channelName: roomName, userAccount: participantName },
      });

      if (error) throw error;
      return { token: data.token, appId: data.appId };
    } catch (error: any) {
      console.error("Error getting Agora token:", error);
      return null;
    }
  };

  const startCall = async (receiverId: string, type: "voice" | "video") => {
    if (!user?.id) return;

    const roomName = `room-${Math.random().toString(36).substring(7)}`;
    
    const { data: newCall, error } = await supabase
      .from('call_logs')
      .insert({
        caller_id: user.id,
        receiver_id: receiverId,
        call_type: type,
        call_status: 'ringing',
        channel_name: roomName,
      })
      .select()
      .single();

    if (error) {
      toast.error("Could not start call");
      return;
    }

    setActiveCall(newCall as Call);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    const { error } = await supabase
      .from('call_logs')
      .update({ call_status: 'accepted', started_at: new Date().toISOString() })
      .eq('id', incomingCall.id);

    if (error) {
      toast.error("Failed to accept call");
      return;
    }

    setActiveCall({ ...incomingCall, call_status: 'accepted' });
    setIncomingCall(null);
    setIsRinging(false);
  };

  const declineCall = async () => {
    if (!incomingCall) return;

    await supabase
      .from('call_logs')
      .update({ call_status: 'declined', ended_at: new Date().toISOString() })
      .eq('id', incomingCall.id);

    setIncomingCall(null);
    setIsRinging(false);
  };

  const endCall = async () => {
    const callToEnd = activeCall || incomingCall;
    if (!callToEnd) return;

    // If the call was never accepted, mark it as missed
    const finalStatus = callToEnd.call_status === 'ringing' ? 'missed' : 'completed';

    await supabase
      .from('call_logs')
      .update({ call_status: finalStatus, ended_at: new Date().toISOString() })
      .eq('id', callToEnd.id);

    setActiveCall(null);
    setIncomingCall(null);
    setIsRinging(false);
  };

  return (
    <CallContext.Provider value={{ 
      activeCall, 
      incomingCall, 
      isRinging, 
      startCall, 
      acceptCall, 
      declineCall, 
      endCall,
      getToken 
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCalls = () => {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error("useCalls must be used within a CallProvider");
  }
  return context;
};
