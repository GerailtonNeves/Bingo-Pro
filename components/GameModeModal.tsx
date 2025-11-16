import React, { useState, useEffect } from 'react';
import { GameMode } from '../types';

interface GameModeModalProps {
  show: boolean;
  series: string;
  onSelect: (mode: GameMode, series: string) => void;
  onClose: () => void;
}

const GameModeModal: React.FC<GameModeModalProps> = ({ show, series, onSelect, onClose }) => {
  const [editableSeries, setEditableSeries] = useState(series);

  useEffect(() => {
    if(show) {
      setEditableSeries(series);
    }
  }, [show, series]);
  
  const handleSeriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableSeries(e.target.value.slice(0, 1).toUpperCase());
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gamemode-title"
    >
      <div
        className="relative bg-gradient-to-br from-slate-900 to-blue-950 border border-white/10 p-8 rounded-xl shadow-2xl animate-scale-in text-center w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="gamemode-title" className="text-3xl font-bold text-slate-100 mb-4">
          Iniciar Novo Jogo
        </h2>
        
        <div className="mb-6">
          <label htmlFor="series-input" className="block text-slate-400 mb-2 font-semibold">
            Série do Jogo
          </label>
          <input
            id="series-input"
            type="text"
            value={editableSeries}
            onChange={handleSeriesChange}
            className="w-24 mx-auto p-2 text-2xl bg-slate-700/50 border-2 border-slate-500 rounded-lg text-center font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            maxLength={1}
          />
        </div>

        <p className="text-slate-400 mb-4 font-semibold">Escolha o modo de jogo:</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onSelect(GameMode.Quina, editableSeries)}
            className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            Quina
          </button>
          <button
            onClick={() => onSelect(GameMode.FullCard, editableSeries)}
            className="w-full px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            Cartela Cheia
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GameModeModal;