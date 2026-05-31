"use client";

import React, { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
    PhoneOff, 
    Mic, 
    MicOff, 
    Volume2, 
    VolumeX,
    Pause,
    Play,
    Minimize2,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioCallUIProps {
    recipient: any;
    onEnd: () => void;
    onMinimize: () => void;
}

const AudioCallUI: React.FC<AudioCallUIProps> = ({ recipient, onEnd, onMinimize }) => {
    const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);

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

    const togglePause = () => {
        setIsPaused(!isPaused);
        localParticipant.setMicrophoneEnabled(isPaused);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-8 py-16 md:py-24 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 z-0">
                <img 
                    src={recipient?.avatar_url} 
                    className="w-full h-full object-cover opacity-20 blur-[100px] scale-150"
                    alt=""
                />
                <div className="absolute inset-0 bg-slate-950/40" />
            </div>

            <div className="relative z-10 text-center space-y-2">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        {recipient?.name || "Contact"}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-black text-white/60 tabular-nums tracking-widest">
                            {formatTime(seconds)}
                        </span>
                    </div>
                </motion.div>
            </div>

            <div className="relative z-10 flex items-center justify-center">
                <motion.div
                    animate={{ 
                        scale: isPaused ? 1 : [1, 1.05, 1],
                        boxShadow: isPaused ? "none" : [
                            "0 0 0 0px rgba(255, 140, 0, 0)",
                            "0 0 0 40px rgba(255, 140, 0, 0.1)",
                            "0 0 0 0px rgba(255, 140, 0, 0)"
                        ]
                    }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="relative rounded-full p-1.5 bg-gradient-to-tr from-accent/50 to-orange-400/50"
                >
                    <Avatar className="w-48 h-48 md:w-64 md:h-64 border-8 border-slate-950 shadow-2xl">
                        <AvatarImage src={recipient?.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-slate-900 text-6xl font-black text-white">
                            {recipient?.name?.[0] || <User size={64} />}
                        </AvatarFallback>
                    </Avatar>
                    
                    {isPaused && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 rounded-full backdrop-blur-sm">
                            <Pause size={48} className="text-white fill-white" />
                        </div>
                    )}
                </motion.div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-6 md:p-8 shadow-2xl"
                >
                    <div className="grid grid-cols-3 gap-4 md:gap-8 items-center">
                        <div className="flex flex-col items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className={cn(
                                    "h-16 w-16 rounded-3xl transition-all duration-300",
                                    !isMicrophoneEnabled ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                {!isMicrophoneEnabled ? <MicOff size={24} /> : <Mic size={24} />}
                            </Button>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mute</span>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <Button 
                                size="icon" 
                                variant="destructive" 
                                className="h-20 w-20 md:h-24 md:w-24 rounded-[2.5rem] shadow-2xl shadow-red-500/40 bg-red-500 hover:bg-red-600 transition-all hover:scale-110 active:scale-95 border-4 border-white/10"
                                onClick={onEnd}
                            >
                                <PhoneOff size={32} className="rotate-[135deg]" />
                            </Button>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                className={cn(
                                    "h-16 w-16 rounded-3xl transition-all duration-300",
                                    isSpeakerOn ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                            </Button>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Speaker</span>
                        </div>

                        <div className="col-span-3 flex justify-center gap-12 mt-4 pt-6 border-t border-white/5">
                            <button onClick={togglePause} className="flex flex-col items-center gap-2 group">
                                <div className={cn("p-3 rounded-2xl transition-colors", isPaused ? "bg-white text-slate-950" : "bg-white/5 text-white group-hover:bg-white/10")}>
                                    {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                                </div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{isPaused ? 'Resume' : 'Hold'}</span>
                            </button>
                            <button onClick={onMinimize} className="flex flex-col items-center gap-2 group">
                                <div className="p-3 rounded-2xl bg-white/5 text-white group-hover:bg-white/10 transition-colors">
                                    <Minimize2 size={18} />
                                </div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Minimize</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AudioCallUI;