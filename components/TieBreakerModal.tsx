import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Ball as BallType } from '../types';
import Ball from './Ball';

interface TieBreakerModalProps {
  show: boolean;
  onClose: () => void;
  allBalls: BallType[];
}

const TieBreakerModal: React.FC<TieBreakerModalProps> = ({ show, onClose, allBalls }) => {
  const [phase, setPhase] = useState<'setup' | 'drawing' | 'results'>('setup');
  const [numberOfWinners, setNumberOfWinners] = useState<string>('2');
  const [winnerNames, setWinnerNames] = useState<string[]>(['', '']);
  const [results, setResults] = useState<{ winnerName: string; ball: BallType }[]>([]);
  const [availableTieBalls, setAvailableTieBalls] = useState<BallType[]>([]);
  const [currentDrawingWinnerIndex, setCurrentDrawingWinnerIndex] = useState<number | null>(null);

  const winnersCount = useMemo(() => parseInt(numberOfWinners, 10), [numberOfWinners]);

  const resetState = useCallback(() => {
    setPhase('setup');
    setNumberOfWinners('2');
    setWinnerNames(['', '']);
    setResults([]);
    setAvailableTieBalls([...allBalls]);
    setCurrentDrawingWinnerIndex(null);
  }, [allBalls]);

  useEffect(() => {
    if (show) {
      resetState();
    }
  }, [show, resetState]);
  
  useEffect(() => {
    const count = parseInt(numberOfWinners, 10);
    if (!isNaN(count) && count >= 2 && count <= 75) {
      setWinnerNames(currentNames => {
        const newNames = Array(count).fill('');
        for (let i = 0; i < Math.min(count, currentNames.length); i++) {
          newNames[i] = currentNames[i];
        }
        return newNames;
      });
    }
  }, [numberOfWinners]);

  useEffect(() => {
    if (phase !== 'drawing') {
      return;
    }

    if (results.length === winnersCount) {
      const timer = setTimeout(() => {
        setPhase('results');
        setCurrentDrawingWinnerIndex(null);
      }, 1500);
      return () => clearTimeout(timer);
    }

    const nextWinnerIndex = results.length;
    setCurrentDrawingWinnerIndex(nextWinnerIndex);

    const drawTimer = setTimeout(() => {
      setAvailableTieBalls(currentAvailable => {
        if (currentAvailable.length === 0) return [];

        const randomIndex = Math.floor(Math.random() * currentAvailable.length);
        const drawnBall = currentAvailable[randomIndex];

        setResults(prevResults => [...prevResults, { winnerName: winnerNames[nextWinnerIndex] || `Ganhador ${nextWinnerIndex + 1}`, ball: drawnBall }]);

        return currentAvailable.filter(b => b.number !== drawnBall.number);
      });
    }, 1800);

    return () => clearTimeout(drawTimer);

  }, [phase, results, winnersCount, winnerNames]);

  const handleStartDraw = () => {
    const namesAreValid = winnerNames.every(name => name.trim() !== '');
    if (!namesAreValid) {
        alert("Por favor, preencha o nome de todos os ganhadores.");
        return;
    }
    if (!isNaN(winnersCount) && winnersCount >= 2 && winnersCount <= 75) {
      setResults([]);
      setAvailableTieBalls([...allBalls]);
      setPhase('drawing');
    } else {
      alert("Por favor, insira um número válido de ganhadores (entre 2 e 75).");
    }
  };
  
  const handleNameChange = (index: number, name: string) => {
    setWinnerNames(currentNames => {
        const newNames = [...currentNames];
        newNames[index] = name;
        return newNames;
    });
  };

  const highestBallValue = useMemo(() => {
    if (phase !== 'results' || results.length === 0) return -1;
    return Math.max(...results.map(r => r.ball.number));
  }, [phase, results]);

  const isTieAgain = useMemo(() => {
    if (phase !== 'results' || results.length < 2) return false;
    const winners = results.filter(r => r.ball.number === highestBallValue);
    return winners.length > 1;
  }, [phase, results, highestBallValue]);

  if (!show) {
    return null;
  }

  const renderSetupView = () => (
    <>
      <h2 id="tiebreaker-title" className="text-3xl font-bold text-slate-100 mb-4">
        Sorteio de Desempate
      </h2>
      <p className="text-slate-400 mb-6">
        Insira o número e os nomes dos ganhadores. Uma bola será sorteada para cada um.
      </p>
      <div className="mb-6 flex flex-col items-center gap-6">
        <div>
          <label htmlFor="winners-input" className="block text-slate-400 mb-2 font-semibold">
            Número de Ganhadores
          </label>
          <input
            id="winners-input"
            type="number"
            value={numberOfWinners}
            onChange={(e) => setNumberOfWinners(e.target.value)}
            className="w-32 mx-auto p-2 text-2xl bg-slate-700/50 border-2 border-slate-500 rounded-lg text-center font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            min="2"
            max="75"
          />
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {winnerNames.map((name, index) => (
             <div key={index}>
              <label htmlFor={`winner-name-${index}`} className="block text-slate-400 text-sm mb-1">Ganhador {index + 1}</label>
              <input
                id={`winner-name-${index}`}
                type="text"
                placeholder="Nome..."
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="w-full p-2 bg-slate-700/50 border border-slate-500 rounded-lg text-center font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleStartDraw}
        className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50"
        disabled={winnerNames.some(name => name.trim() === '')}
      >
        Iniciar Desempate
      </button>
    </>
  );

  const renderDrawingAndResultsView = () => {
    let statusText = '';
    if (phase === 'drawing') {
      if (currentDrawingWinnerIndex !== null && winnerNames[currentDrawingWinnerIndex]) {
        statusText = `Sorteando para ${winnerNames[currentDrawingWinnerIndex]}...`;
      } else {
        statusText = 'Preparando sorteio...';
      }
    } else if (phase === 'results') {
      if (isTieAgain) {
        statusText = 'Houve um novo empate!';
      } else {
        statusText = 'A bola com o número mais alto vence!';
      }
    }

    return (
      <>
        <h2 id="tiebreaker-title" className="text-3xl font-bold text-slate-100 mb-4">
          {phase === 'drawing' ? 'Sorteio em Andamento' : 'Resultado do Desempate'}
        </h2>
        <p className="text-slate-400 mb-4 h-6 transition-opacity duration-300">
          {statusText}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[150px] max-h-80 overflow-y-auto p-4 bg-slate-900/50 rounded-lg">
          {results.map(({ winnerName, ball }) => {
              const isHighest = phase === 'results' && ball.number === highestBallValue;
              return (
                <div key={winnerName} className={`flex flex-col items-center p-2 rounded-lg transition-all duration-500 ${isHighest ? 'bg-yellow-400/30' : ''} animate-scale-in`}>
                  <p className={`text-sm font-semibold mb-2 truncate max-w-full ${isHighest ? 'text-yellow-300' : 'text-slate-400'}`}>{winnerName}</p>
                  <Ball 
                    {...ball} 
                    size="md" 
                    className={isHighest ? 'animate-pulse-glow' : ''}
                  />
                </div>
              )
          })}
        </div>
        {isTieAgain && (
          <p className="text-yellow-400 mt-4 animate-fade-in-subtle">
            Jogue novamente para definir um único ganhador.
          </p>
        )}
        <div className="mt-6 flex justify-center gap-4 h-[54px]">
          {phase === 'drawing' && (
             <button
                onClick={onClose}
                className="px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-lg shadow-lg transition-all hover:scale-105 animate-fade-in-subtle"
              >
                Cancelar Sorteio
              </button>
          )}
          {phase === 'results' && (
            <>
              <button
                onClick={resetState}
                className="flex-1 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg shadow-lg transition-all hover:scale-105 animate-fade-in-subtle"
              >
                Novo Desempate
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-lg transition-all hover:scale-105 animate-fade-in-subtle"
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </>
    );
  };


  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tiebreaker-title"
    >
      <div
        className="relative bg-gradient-to-br from-slate-900 to-blue-950 border border-white/10 p-8 rounded-xl shadow-2xl animate-scale-in text-center w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {phase === 'setup' ? renderSetupView() : renderDrawingAndResultsView()}
      </div>
    </div>
  );
};

export default TieBreakerModal;