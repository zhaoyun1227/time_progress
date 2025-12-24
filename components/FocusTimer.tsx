import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface FocusTimerProps {
  durationMinutes: number;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ durationMinutes }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  // Ref to store the interval ID
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update timeLeft when prop changes, but only if not currently active
  useEffect(() => {
    if (!isActive && !isFinished) {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, isActive, isFinished]);

  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.value = 440; // A4
      
      // Beep sequence
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const sendNotification = () => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification("专注结束！", {
        body: "干得漂亮！休息一下吧。",
        icon: "/vite.svg" // Fallback icon
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
           new Notification("专注结束！", {
            body: "干得漂亮！休息一下吧。"
          });
        }
      });
    }
  };

  const handleFinish = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    playSound();
    sendNotification();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, handleFinish]);

  const toggleTimer = () => {
    if (timeLeft === 0) return;
    
    // Request notification permission on first start
    if (!isActive && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    setIsActive(!isActive);
    setIsFinished(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(durationMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate percentage for circular progress
  const totalSeconds = durationMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-700">
         <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mb-6">专注计时器</h3>
      
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="text-6xl font-mono font-bold text-white tracking-wider mb-2">
          {formatTime(timeLeft)}
        </div>
        <p className="text-slate-400">
          {isActive ? `专注进行中：剩余${Math.floor(timeLeft / 60)}分${timeLeft % 60}秒。保持专注！` : isFinished ? "专注结束！休息一下。" : "准备好开始专注了吗？"}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isActive 
              ? 'bg-amber-600 hover:bg-amber-700 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isActive ? <><Pause size={20} /> 暂停</> : <><Play size={20} /> 开始专注</>}
        </button>
        
        <button 
          onClick={resetTimer}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
        >
          <RotateCcw size={20} /> 重置
        </button>
      </div>
    </div>
  );
};