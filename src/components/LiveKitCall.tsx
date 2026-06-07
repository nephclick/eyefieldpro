import React, { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

interface LiveKitCallProps {
  roomName: string;
  token: string;
  isVideoCall: boolean;
  onDisconnected: () => void;
}

export const LiveKitCall: React.FC<LiveKitCallProps> = ({ roomName, token, isVideoCall, onDisconnected }) => {
  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://eyefield-ht55ykro.livekit.cloud';

  if (!token) {
    return <div>Connecting...</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <LiveKitRoom
        video={isVideoCall}
        audio={true}
        token={token}
        serverUrl={livekitUrl}
        data-lk-theme="default"
        onDisconnected={onDisconnected}
      >
        {isVideoCall ? (
            <VideoConference />
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h2>Voice Call Active</h2>
                <p>Room: {roomName}</p>
            </div>
        )}
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
};
