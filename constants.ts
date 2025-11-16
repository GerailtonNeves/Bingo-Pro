import { Ball } from './types';

export const BALL_LETTERS = {
  B: { range: [1, 15], color: 'blue' },
  I: { range: [16, 30], color: 'red' },
  N: { range: [31, 45], color: 'green' },
  G: { range: [46, 60], color: 'yellow' },
  O: { range: [61, 75], color: 'purple' },
} as const;

export const COLORS: { [key: string]: { base: string; checked: string; drawn: string } } = {
  blue: {
    base: 'bg-gradient-to-br from-sky-400 to-blue-600',
    checked: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    drawn: 'bg-gradient-to-br from-slate-600 to-slate-700',
  },
  red: {
    base: 'bg-gradient-to-br from-rose-400 to-red-600',
    checked: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    drawn: 'bg-gradient-to-br from-slate-600 to-slate-700',
  },
  green: {
    base: 'bg-gradient-to-br from-lime-400 to-green-600',
    checked: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    drawn: 'bg-gradient-to-br from-slate-600 to-slate-700',
  },
  yellow: {
    base: 'bg-gradient-to-br from-amber-300 to-yellow-500',
    checked: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    drawn: 'bg-gradient-to-br from-slate-600 to-slate-700',
  },
  purple: {
    base: 'bg-gradient-to-br from-violet-400 to-purple-600',
    checked: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    drawn: 'bg-gradient-to-br from-slate-600 to-slate-700',
  },
  joker: {
    base: 'bg-gradient-to-br from-pink-400 to-orange-400',
    checked: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    drawn: '',
  },
};

export const initializeBalls = (): Ball[] => {
  const balls: Ball[] = [];
  for (const letter in BALL_LETTERS) {
    const config = BALL_LETTERS[letter as keyof typeof BALL_LETTERS];
    for (let i = config.range[0]; i <= config.range[1]; i++) {
      balls.push({
        number: i,
        letter: letter as 'B' | 'I' | 'N' | 'G' | 'O',
        color: config.color,
      });
    }
  }
  return balls;
};