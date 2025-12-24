import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Clock } from 'lucide-react';
import { UserSettings, TimeProgress } from './types';
import { DEFAULT_SETTINGS, QUOTES } from './constants';
import { ProgressBar } from './components/ProgressBar';
import { FocusTimer } from './components/FocusTimer';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  // --- State ---
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('timeCompassSettings');
    let parsedSettings = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    // Merge with default to ensure new fields (workDays, semester dates) exist if loading old settings
    return { ...DEFAULT_SETTINGS, ...parsedSettings };
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(!settings.hasOnboarded);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // --- Effects ---
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('timeCompassSettings', JSON.stringify(settings));
  }, [settings]);

  // Update time every second
  useEffect(() => {
    // Initial set to ensure client hydration matches
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Calculations ---

  const calculateLifeProgress = (): TimeProgress => {
    const birth = new Date(settings.birthDate).getTime();
    const now = currentTime.getTime();
    const end = new Date(settings.birthDate);
    end.setFullYear(end.getFullYear() + settings.lifeExpectancy);
    
    const total = end.getTime() - birth;
    const elapsed = now - birth;
    const percentage = (elapsed / total) * 100;

    const yearsPast = (elapsed / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
    const yearsLeft = ((total - elapsed) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

    return {
      percentage,
      label: '人生进度',
      subtext: `您已度过人生${percentage.toFixed(1)}%（已过${yearsPast}年），剩余约${yearsLeft}年。时间有限，请珍惜每一分钟。`,
      colorClass: 'bg-gradient-to-r from-red-500 to-orange-500',
      isActive: true
    };
  };

  const calculateWeekProgress = (): TimeProgress => {
    const now = currentTime;
    const currentDay = now.getDay();
    // Start of the week (Monday)
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    let totalWorkMs = 0;
    let elapsedWorkMs = 0;

    // Loop through the 7 days of this week (Mon-Sun)
    for (let i = 0; i < 7; i++) {
      const loopDay = new Date(startOfWeek);
      loopDay.setDate(startOfWeek.getDate() + i);
      const loopDayIndex = loopDay.getDay();

      // Check if this is a work day
      if (settings.workDays.includes(loopDayIndex)) {
        const dayDuration = 24 * 60 * 60 * 1000;
        totalWorkMs += dayDuration;

        const dayStart = new Date(loopDay).setHours(0,0,0,0);
        const dayEnd = new Date(loopDay).setHours(23,59,59,999);
        const nowMs = now.getTime();

        if (nowMs >= dayEnd) {
          elapsedWorkMs += dayDuration;
        } else if (nowMs > dayStart) {
          elapsedWorkMs += (nowMs - dayStart);
        }
      }
    }

    const percentage = totalWorkMs === 0 ? 0 : (elapsedWorkMs / totalWorkMs) * 100;
    
    // Remaining time in work days
    const remainingMs = totalWorkMs - elapsedWorkMs;
    const daysLeft = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      percentage,
      label: '本周工作日进度',
      subtext: `本周工作日已过${percentage.toFixed(1)}%（剩余${daysLeft}天${hoursLeft}小时）。认真对待每一分钟。`,
      colorClass: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      isActive: true
    };
  };

  const calculateDayProgress = (): TimeProgress => {
    const now = currentTime;
    const nowTime = now.getTime();

    const [startH, startM] = settings.workStartTime.split(':').map(Number);
    const [endH, endM] = settings.workEndTime.split(':').map(Number);

    const start = new Date(now);
    start.setHours(startH, startM, 0, 0);

    const end = new Date(now);
    end.setHours(endH, endM, 0, 0);

    const startTime = start.getTime();
    const endTime = end.getTime();
    
    let percentage = 0;
    let subtext = "非工作时间。";
    let isActive = false;

    if (nowTime < startTime) {
      percentage = 0;
      subtext = `工作将于 ${settings.workStartTime} 开始。`;
    } else if (nowTime > endTime) {
      percentage = 100;
      subtext = "今日工作已结束。";
    } else {
      percentage = ((nowTime - startTime) / (endTime - startTime)) * 100;
      isActive = true;
      const elapsedMs = nowTime - startTime;
      const remainingMs = endTime - nowTime;
      
      const elapsedHrs = Math.floor(elapsedMs / (1000 * 60 * 60));
      const elapsedMins = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const remainHrs = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

      subtext = `已过${elapsedHrs}小时${elapsedMins}分钟，剩余${remainHrs}小时${remainMins}分钟。`;
    }

    return {
      percentage,
      label: '今日工作进度',
      subtext,
      colorClass: 'bg-gradient-to-r from-emerald-500 to-green-400',
      isActive: isActive || percentage === 100
    };
  };

  const calculateSemesterProgress = (): TimeProgress => {
    const now = currentTime;
    const year = now.getFullYear();

    const parseDate = (mmdd: string, yearOffset: number = 0) => {
      const [m, d] = mmdd.split('-').map(Number);
      return new Date(year + yearOffset, m - 1, d); // Month is 0-indexed
    };

    // Construct ranges for the current context.
    // Logic: Try to match "Current Academic Year".
    // Usually Sem 1 is Late Year X to Early Year X+1.
    // Sem 2 is Mid Year X+1.
    
    // Let's find if we are in Sem 1 (approx Sep-Jan)
    // If we are in Jan, Sem 1 started last year.
    // If we are in Sep-Dec, Sem 1 ends next year.
    
    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    // Check Sem 1 (e.g. Sep 1 to Jan 31)
    // Case A: currently Sep-Dec. Start = thisYear-09-01, End = nextYear-01-31
    const s1StartA = parseDate(settings.semester1Start);
    const s1EndA = parseDate(settings.semester1End, 1);
    
    // Case B: currently Jan. Start = lastYear-09-01, End = thisYear-01-31
    const s1StartB = parseDate(settings.semester1Start, -1);
    const s1EndB = parseDate(settings.semester1End);

    // Check Sem 2 (e.g. Mar 1 to Jun 30) - usually within same year
    const s2Start = parseDate(settings.semester2Start);
    const s2End = parseDate(settings.semester2End);

    if (now >= s1StartA && now <= s1EndA) {
      rangeStart = s1StartA;
      rangeEnd = s1EndA;
    } else if (now >= s1StartB && now <= s1EndB) {
      rangeStart = s1StartB;
      rangeEnd = s1EndB;
    } else if (now >= s2Start && now <= s2End) {
      rangeStart = s2Start;
      rangeEnd = s2End;
    }

    if (!rangeStart || !rangeEnd) {
       return {
        percentage: 0,
        label: '学期进度',
        subtext: '当前不在学期内（假期中）。好好休息！',
        colorClass: 'bg-slate-700',
        isActive: false
      };
    }

    const total = rangeEnd.getTime() - rangeStart.getTime();
    const elapsed = now.getTime() - rangeStart.getTime();
    const percentage = (elapsed / total) * 100;

    const elapsedDays = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const elapsedMonths = Math.floor(elapsedDays / 30);
    const elapsedDaysRem = elapsedDays % 30;

    const remainMs = total - elapsed;
    const remainDays = Math.floor(remainMs / (1000 * 60 * 60 * 24));
    const remainMonths = Math.floor(remainDays / 30);
    const remainDaysRem = remainDays % 30;

    return {
      percentage,
      label: '学期进度',
      subtext: `本学期已过${percentage.toFixed(1)}%（已过${elapsedMonths}月${elapsedDaysRem}天，剩余${remainMonths}月${remainDaysRem}天）。学期有限，专注学习！`,
      colorClass: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      isActive: true
    };
  };

  const dayData = calculateDayProgress();
  const weekData = calculateWeekProgress();
  const semesterData = calculateSemesterProgress();
  const lifeData = calculateLifeProgress();

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">时间罗盘</h1>
            <p className="text-slate-400 text-sm font-mono">
              {currentTime.toLocaleString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long',
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: false 
              })}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          title="设置"
        >
          <Settings size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl space-y-6 flex-grow">
        
        {/* Progress Section */}
        <section className="space-y-6">
          <ProgressBar {...dayData} />
          <ProgressBar {...weekData} />
          <ProgressBar {...semesterData} />
        </section>

        {/* Focus Timer Section */}
        <section className="mt-8 mb-8">
          <FocusTimer durationMinutes={settings.focusDuration} />
        </section>

        {/* Life Section (Last) */}
        <section className="space-y-6">
          <ProgressBar {...lifeData} />
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center max-w-lg">
        <blockquote className="italic text-slate-400 text-lg mb-2">
          "{quote.text}"
        </blockquote>
        <cite className="text-slate-500 text-sm not-italic uppercase tracking-wide">
          — {quote.author}
        </cite>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;