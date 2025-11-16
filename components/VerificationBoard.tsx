import React from 'react';
import { Ball as BallType } from '../types';
import Ball from './Ball';

interface VerificationBoardProps {
  allBalls: BallType[];
  drawnBalls: Set<number>;
  checkedBalls: Set<number>;
  isJokerChecked: boolean;
  onBallClick: (ballNumber: number) => void;
  onJokerClick: () => void;
  lastDrawnBallNumber: number | null;
}

const VerificationBoard: React.FC<VerificationBoardProps> = ({
  allBalls,
  drawnBalls,
  checkedBalls,
  isJokerChecked,
  onBallClick,
  onJokerClick,
  lastDrawnBallNumber,
}) => {
  const ballsByLetter = (['B', 'I', 'N', 'G', 'O'] as const).reduce((acc, letter) => {
    acc[letter] = allBalls.filter(b => b.letter === letter);
    return acc;
  }, {} as Record<'B' | 'I' | 'N' | 'G' | 'O', BallType[]>);

  const renderLetterColumn = (letter: 'B' | 'I' | 'N' | 'G' | 'O') => (
    <div key={letter} className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="text-2xl sm:text-3xl md:text-5xl font-black text-cyan-300/80 tracking-widest mb-2">{letter}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-1 sm:gap-2 md:gap-3">
        {ballsByLetter[letter].map(ball => (
          <Ball
            key={ball.number}
            number={ball.number}
            letter={ball.letter}
            color={ball.color}
            size="sm"
            onClick={drawnBalls.has(ball.number) ? () => onBallClick(ball.number) : undefined}
            state={checkedBalls.has(ball.number) ? 'checked' : drawnBalls.has(ball.number) ? 'base' : 'drawn'}
            className={`
              ${!drawnBalls.has(ball.number) ? 'opacity-30' : 'opacity-100'}
              ${ball.number === lastDrawnBallNumber ? 'animate-pulse-glow' : ''}
            `}
          />
        ))}
      </div>
    </div>
  );


  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10">
      <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-4">
        {(['B', 'I', 'N', 'G', 'O'] as const).map(renderLetterColumn)}
      </div>
       <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col items-center gap-6">
         <div className="flex flex-col items-center">
           <p className="text-slate-400 mb-2">Bola Coringa</p>
          <Ball
            number="★"
            letter="JOKER"
            color="joker"
            size="md"
            onClick={onJokerClick}
            state={isJokerChecked ? 'checked' : 'base'}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationBoard;