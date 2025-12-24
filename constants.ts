import { UserSettings, Quote } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  birthDate: '1990-01-01',
  lifeExpectancy: 80,
  workStartTime: '09:00',
  workEndTime: '18:00',
  focusDuration: 45,
  hasOnboarded: false,
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
  semester1Start: '09-01',
  semester1End: '01-31',
  semester2Start: '03-01',
  semester2End: '06-30',
};

export const QUOTES: Quote[] = [
  { text: "时间是我们最想要的东西，却是我们用得最差的东西。", author: "威廉·佩恩" },
  { text: "未来取决于你今天做什么。", author: "圣雄甘地" },
  { text: "逝去的时间永远不会再回来。", author: "本杰明·富兰克林" },
  { text: "你的时间有限，所以不要浪费时间去过别人的生活。", author: "史蒂夫·乔布斯" },
  { text: "时间是创造出来的。说‘我没时间’，就像说‘我不想做’。", author: "老子" },
  { text: "时间有限，专注当下，珍惜每一分钟。", author: "时间罗盘" },
  { text: "一寸光阴一寸金，寸金难买寸光阴。", author: "中国谚语" }
];
