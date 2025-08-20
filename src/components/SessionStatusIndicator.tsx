import React, { useState, useEffect } from 'react';
import { Shield, Wifi, WifiOff } from 'lucide-react';
import { getSessionState, isSessionExpired } from '../utils/sessionManager';

interface SessionStatusIndicatorProps {
  isLoggedIn: boolean;
}

const SessionStatusIndicator: React.FC<SessionStatusIndicatorProps> = ({ isLoggedIn }) => {
  const [sessionValid, setSessionValid] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkSession = () => {
      const sessionState = getSessionState();
      const isExpired = isSessionExpired(sessionState.lastActivity);
      setSessionValid(!isExpired);

      if (!isExpired && sessionState.lastActivity) {
        const lastActivity = new Date(sessionState.lastActivity).getTime();
        const now = new Date().getTime();
        const elapsed = now - lastActivity;
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes
        const remaining = sessionTimeout - elapsed;
        
        if (remaining > 0) {
          const minutes = Math.floor(remaining / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeRemaining('Expired');
        }
      }
    };

    // Check session status every 30 seconds
    const interval = setInterval(checkSession, 30000);
    checkSession(); // Initial check

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-all duration-300
        ${sessionValid 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
        }
      `}>
        <div className="flex items-center space-x-2">
          {sessionValid ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Session Active</span>
              <span className="text-green-600">({timeRemaining})</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Session Expired</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionStatusIndicator;
