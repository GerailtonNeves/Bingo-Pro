import React from 'react';
import { COLORS } from '../constants';

type BallState = 'base' | 'drawn' | 'checked';

interface BallProps {
  number: number | string;
  letter: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  state?: BallState;
}

const Ball: React.FC<BallProps> = ({ number, letter, color, size = 'md', onClick, className = '', state = 'base' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-40 h-40 text-8xl',
  };

  const letterSizeClasses = {
    sm: 'text-sm leading-none -mb-1 opacity-80',
    md: 'text-base leading-none -mb-1 opacity-80',
    lg: 'text-2xl leading-none -mb-2 opacity-80',
    xl: 'text-4xl leading-none -mb-3 opacity-80',
  };

  const colorKey = color as keyof typeof COLORS;
  const stateKey = state as keyof typeof COLORS[typeof colorKey];
  const colorClass = COLORS[colorKey]?.[stateKey] || COLORS[colorKey]?.base || '';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        ${onClick ? 'cursor-pointer transform hover:scale-110 active:scale-95 transition-transform duration-200' : ''}
        rounded-full flex flex-col items-center justify-center 
        text-white font-bold shadow-lg border-2 border-white/50
        select-none
        ${className}
      `}
      aria-label={`Bingo ball ${letter} ${number}`}
    >
      <span className={letterSizeClasses[size]}>{letter}</span>
      <span style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{number}</span>
    </Tag>
  );
};

export default Ball;