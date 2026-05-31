"use client";

import React, { useEffect, useState } from "react";
import { 
    useLocalParticipant, 
    useRemoteParticipants,
    VideoTrack,
    useTracks
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
    PhoneOff, 
    Mic, 
    MicOff, 
    Video,
    VideoOff,
    Minimize2,
    SwitchCamera
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCallUIProps {
    recipient: any;
    onEnd: () => void;
    onMinimize: () => void;
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({ recipient, onEnd, onMinimize }) => {
    const { isMicrophoneEnabled, isCameraEnabled, localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const [seconds, setSeconds] = useState(0);

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: false },
        ],
        { onlySubscribed: true }
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    };

    const toggleCamera = () => {
        localParticipant.setCameraEnabled(!isCameraEnabled);
    };

    const remoteVideoTrack = tracks.find(t => t.participant.identity !== localParticipant.identity);
    const localVideoTrack = tracks.find(t => t.participant.identity === localParticipant.identity);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                {remoteVideoTrack && remoteVideoTrack.publication ? (
                    <VideoTrack 
                        trackRef={remoteVideoTrack as any} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                            <VideoOff size={48} className="text-white/20" />
                        </div>
                        <p className="text-white/40 font-black uppercase tracking-widest text-xs">Waiting for video...</p>
                    </div>
                )}
            </div>

            {/* Local Video (PIP) */}
            <motion.div 
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="absolute top-12 right-6 z-20 w-32 h-48 md:w-48 md:h-64 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900"
            >
                {isCameraEnabled && localVideoTrack && localVideoTrack.publication ? (
                    <VideoTrack 
                        trackRef={localVideoTrack as any} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <VideoOff size={24} className="text-white/20" />
                    </div>
                )}
            </motion.div>

            {/* Top Info Overlay */}
            <div className="absolute top-12 left-6 z-10 flex flex-col gap-1">
                <h2 className="text-xl font-black text-white drop-shadow-lg">{recipient?.name || "Contact"}</h2>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs font-black text-white/80 tabular-nums tracking-widest drop-shadow-lg">
                        {formatTime(seconds)}
                    </span>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center px-6">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-4 flex items-center gap-4 md:gap-8 shadow-2xl"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className={cn(
                            "h-14 w-14 rounded-2xl transition-all",
                            !isMicrophoneEnabled ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        {!isMicrophoneEnabled ? <MicOff size={20} /> : <Mic size={20} />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleCamera}
                        className={cn(
                            "h-14 w-14 rounded-2xl transition-all",
                            !isCameraEnabled ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                        )}
                    >
                        {!isCameraEnabled ? <VideoOff size={20} /> : <Video size={20} />}
                    </Button>

                    <Button 
                        size="icon" 
                        variant="destructive" 
                        className="h-16 w-16 md:h-20 md:w-20 rounded-[2rem] shadow-2xl bg-red-500 hover:bg-red-600 transition-all hover:scale-110 active:scale-95 border-4 border-white/10"
                        onClick={onEnd}
                    >
                        <PhoneOff size={28} className="rotate-[135deg]" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-14 w-14 rounded-2xl bg-white/10 text-white hover:bg-white/20"
                    >
                        <SwitchCamera size={20} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMinimize}
                        className="h-14 w-14 rounded-2xl bg-white/10 text-white hover:bg-white/20"
                    >
                        <Minimize2 size={20} />
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

export default VideoCallUI;