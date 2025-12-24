import React, { useState } from 'react';
import { UserSettings } from '../types';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const WEEKDAYS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 0, label: '周日' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentSettings, 
  onSave 
}) => {
  const [formData, setFormData] = useState<UserSettings>(currentSettings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, hasOnboarded: true });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lifeExpectancy' || name === 'focusDuration' ? Number(value) : value
    }));
  };

  const toggleDay = (day: number) => {
    setFormData(prev => {
      const currentDays = prev.workDays || [];
      if (currentDays.includes(day)) {
        return { ...prev, workDays: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, workDays: [...currentDays, day] };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">设置</h2>
          {currentSettings.hasOnboarded && (
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Daily Work Settings */}
          <div className="space-y-3">
            <h3 className="text-blue-400 font-semibold border-b border-slate-700 pb-2">每日工作</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">开始时间</label>
                <input 
                  type="time" 
                  name="workStartTime"
                  required
                  value={formData.workStartTime}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">结束时间</label>
                <input 
                  type="time" 
                  name="workEndTime"
                  required
                  value={formData.workEndTime}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Weekly Settings */}
          <div className="space-y-3">
            <h3 className="text-cyan-400 font-semibold border-b border-slate-700 pb-2">每周工作日</h3>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.workDays?.includes(day.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">选中用于计算每周进度的日子</p>
          </div>

          {/* Semester Settings */}
          <div className="space-y-3">
            <h3 className="text-purple-400 font-semibold border-b border-slate-700 pb-2">学期设置 (月-日)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">第一学期开始</label>
                <input type="text" name="semester1Start" value={formData.semester1Start} onChange={handleChange} placeholder="09-01" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">第一学期结束</label>
                <input type="text" name="semester1End" value={formData.semester1End} onChange={handleChange} placeholder="01-31" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">第二学期开始</label>
                <input type="text" name="semester2Start" value={formData.semester2Start} onChange={handleChange} placeholder="03-01" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">第二学期结束</label>
                <input type="text" name="semester2End" value={formData.semester2End} onChange={handleChange} placeholder="06-30" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" />
              </div>
            </div>
          </div>

          {/* Focus Settings */}
          <div className="space-y-3">
            <h3 className="text-emerald-400 font-semibold border-b border-slate-700 pb-2">专注设置</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">专注时长 (分钟)</label>
              <input 
                type="number" 
                name="focusDuration"
                required
                min="1"
                max="180"
                value={formData.focusDuration}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Life Settings */}
          <div className="space-y-3">
            <h3 className="text-orange-400 font-semibold border-b border-slate-700 pb-2">人生设置</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">出生日期</label>
              <input 
                type="date" 
                name="birthDate"
                required
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">预期寿命 (岁)</label>
              <input 
                type="number" 
                name="lifeExpectancy"
                required
                min="1"
                max="150"
                value={formData.lifeExpectancy}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-slate-800">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
            >
              保存设置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};