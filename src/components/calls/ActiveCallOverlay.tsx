"use client";

import React, { useEffect, useState } from "react";
import { 
    LiveKitRoom, 
    RoomAudioRenderer
} from "@livekit/components-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalls } from "@/context/CallContext";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";
import AudioCallUI from "./AudioCallUI";
import VideoCallUI from "./VideoCallUI";

const ActiveCallOverlay = () => {
    const { activeCall, endCall, getToken } = useCalls();
    const { user } = useUser();
    const [token, setToken] = useState<string | null>(null);
    const [recipientProfile, setRecipientProfile] = useState<any>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        if (activeCall && activeCall.status === 'accepted' && user) {
            getToken(activeCall.room_name, user.name).then(setToken);
            
            const otherId = activeCall.caller_id === user.id ? activeCall.receiver_id : activeCall.caller_id;
            supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('id', otherId)
                .single()
                .then(({ data }) => setRecipientProfile(data));
        }
    }, [activeCall, user, getToken]);

    if (!activeCall || activeCall.status !== 'accepted' || !token) return null;

    if (isMinimized) {
        return (
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-4 right-4 z-[200] flex items-center gap-3 p-2 pr-4 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl cursor-pointer"
                onClick={() => setIsMinimized(false)}
            >
                <Avatar className="w-10 h-10 border-2 border-accent">
                    <AvatarImage src={recipientProfile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-slate-800 text-xs font-black text-white">
                        {recipientProfile?.name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Ongoing Call</span>
                    <span className="text-xs font-bold text-accent">{recipientProfile?.name}</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600"
                        onClick={(e) => { e.stopPropagation(); endCall(); }}
                    >
                        <PhoneOff size={14} />
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
            >
                <LiveKitRoom
                    video={activeCall.type === 'video'}
                    audio={true}
                    token={token}
                    serverUrl={import.meta.env.VITE_LIVEKIT_URL}
                    onDisconnected={endCall}
                    connect={true}
                    className="h-full w-full flex flex-col relative"
                >
                    {activeCall.type === 'video' ? (
                        <VideoCallUI 
                            recipient={recipientProfile} 
                            onEnd={endCall} 
                            onMinimize={() => setIsMinimized(true)}
                        />
                    ) : (
                        <AudioCallUI 
                            recipient={recipientProfile} 
                            onEnd={endCall} 
                            onMinimize={() => setIsMinimized(true)}
                        />
                    )}
                    <RoomAudioRenderer />
                </LiveKitRoom>
            </motion.div>
        </AnimatePresence>
    );
};

export default ActiveCallOverlay;