import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ball as BallType, GameMode, GameState } from './types';
import { initializeBalls } from './constants';
import Ball from './components/Ball';
import VerificationBoard from './components/VerificationBoard';
import WinnerModal from './components/WinnerModal';
import GameModeModal from './components/GameModeModal';
import TieBreakerModal from './components/TieBreakerModal';

const DRAW_SOUND_B64 = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSsHAAAAAAAACAcADAf/D/4PAA8E/wsACQAF/wP/BAACABYAHgA2AD4AQQBHAEgAQwA8ACYAFQANAAcABQADAAIAAwAGAAwADgASABMAFwAXABQADwALAAcABQACAAEAAv8B/wT/Bv8G/wX/A/8B/wIAAAAAA/8H/xP/Iv8u/zH/Lv8n/yH/G/8V/xX/GP8c/yM/Jv8n/yb/Jv8m/yY/Jj8l/yT/Iv8h/x0/Gj8Y/xQ=';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.FullCard);
  const [series, setSeries] = useState<string>('A');
  const [currentGameSeries, setCurrentGameSeries] = useState<string>('A');

  const [showGameModeModal, setShowGameModeModal] = useState<boolean>(false);
  
  const [allBalls] = useState<BallType[]>(initializeBalls());
  const [availableBalls, setAvailableBalls] = useState<BallType[]>([]);
  const [drawnBalls, setDrawnBalls] = useState<BallType[]>([]);
  const [lastDrawnBall, setLastDrawnBall] = useState<BallType | null>(null);
  const [drawnBallNumbers, setDrawnBallNumbers] = useState<Set<number>>(new Set());

  const [checkedBalls, setCheckedBalls] = useState<Set<number>>(new Set());
  const [isJokerChecked, setIsJokerChecked] = useState<boolean>(false);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [winType, setWinType] = useState<string>('');
  
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [shufflingBall, setShufflingBall] = useState<BallType | null>(null);
  const shuffleIntervalRef = useRef<number | null>(null);

  const [showTieBreakerModal, setShowTieBreakerModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const drawAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    drawAudioRef.current = new Audio(DRAW_SOUND_B64);
    drawAudioRef.current.preload = 'auto';
  }, []);

  const startNewGame = useCallback(() => {
    setAvailableBalls(initializeBalls());
    setDrawnBalls([]);
    setLastDrawnBall(null);
    setGameState(GameState.Running);
    setCheckedBalls(new Set());
    setIsJokerChecked(false);
    setShowWinnerModal(false);
    setDrawnBallNumbers(new Set());
    setIsShuffling(false);
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
    }
  }, []);

  const handleSelectGameMode = (selectedMode: GameMode, selectedSeries: string) => {
    const finalSeries = selectedSeries.toUpperCase() || 'A';
    setGameMode(selectedMode);
    setCurrentGameSeries(finalSeries);
    startNewGame();
    
    const nextCharCode = finalSeries.charCodeAt(0) + 1;
    const nextSeriesLetter = nextCharCode > 'Z'.charCodeAt(0) ? 'A' : String.fromCharCode(nextCharCode);
    setSeries(nextSeriesLetter);

    setShowGameModeModal(false);
  };

  const drawBall = () => {
    if (availableBalls.length === 0 || isShuffling) return;

    setIsShuffling(true);
    setLastDrawnBall(null);
    
    shuffleIntervalRef.current = window.setInterval(() => {
        const randomIndex = Math.floor(Math.random() * allBalls.length);
        setShufflingBall(allBalls[randomIndex]);
    }, 50);

    setTimeout(() => {
        if (shuffleIntervalRef.current) {
            clearInterval(shuffleIntervalRef.current);
            shuffleIntervalRef.current = null;
        }

        setAvailableBalls(currentAvailableBalls => {
            if (currentAvailableBalls.length === 0) {
                setIsShuffling(false);
                return currentAvailableBalls;
            }

            const randomIndex = Math.floor(Math.random() * currentAvailableBalls.length);
            const drawn = currentAvailableBalls[randomIndex];
            
            setLastDrawnBall(drawn);
            setDrawnBalls(prev => [...prev, drawn]);
            setDrawnBallNumbers(prev => new Set(prev).add(drawn.number));
            
            if (!isMuted && drawAudioRef.current) {
              drawAudioRef.current.currentTime = 0;
              drawAudioRef.current.play().catch(error => {
                console.error("Audio playback failed:", error);
              });
            }

            setIsShuffling(false);

            return currentAvailableBalls.filter(b => b.number !== drawn.number);
        });
    }, 2000);
  };

  const handleBallCheck = (ballNumber: number) => {
    setCheckedBalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ballNumber)) {
        newSet.delete(ballNumber);
      } else {
        newSet.add(ballNumber);
      }
      return newSet;
    });
  };

  const handleJokerCheck = () => {
    setIsJokerChecked(prev => !prev);
  };
  
  const toggleCheckMode = () => {
    if (gameState === GameState.Checking) {
      setGameState(drawnBalls.length > 0 ? GameState.Running : GameState.Idle);
    } else {
      setGameState(GameState.Checking);
    }
  }

  useEffect(() => {
    if (gameState !== GameState.Checking) {
      setShowWinnerModal(false);
      return;
    }

    let isWinner = false;
    let typeOfWin = '';
    const checkedCount = checkedBalls.size;

    if (gameMode === GameMode.FullCard) {
      if (checkedCount === 24) {
        isWinner = true;
        typeOfWin = 'Cartela Cheia';
      }
    } else if (gameMode === GameMode.Quina) {
      if (checkedCount === 5) {
        isWinner = true;
        typeOfWin = 'Quina (5 números)';
      } else if (checkedCount === 4 && isJokerChecked) {
        isWinner = true;
        typeOfWin = 'Quina (4 números + coringa)';
      }
    }

    if (isWinner) {
      setWinType(typeOfWin);
      setShowWinnerModal(true);
    }
  }, [gameState, checkedBalls, isJokerChecked, gameMode]);


  useEffect(() => {
    return () => {
        if (shuffleIntervalRef.current) {
            clearInterval(shuffleIntervalRef.current);
        }
    }
  }, []);
  
  const renderDrawnHistory = () => {
    const secondLastDrawnBallNumber = drawnBalls.length > 1 ? drawnBalls[drawnBalls.length - 2].number : null;

    return (
      <div className="w-full h-full bg-sky-950/40 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-white/10 max-h-[20rem] sm:max-h-[24rem] lg:max-h-[32rem] overflow-y-auto">
        <h3 className="text-lg font-bold text-center mb-4 text-slate-300 sticky top-0 bg-sky-950/40 py-2 -mt-4 z-10">Bolas Sorteadas ({drawnBalls.length})</h3>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {drawnBalls.map(ball => (
            <Ball 
              key={ball.number} 
              {...ball} 
              size="md" 
              className={ball.number === secondLastDrawnBallNumber ? 'animate-pulse-glow' : ''}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="container mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
            Bingo Master Pro
          </h1>
        </header>

        {/* Controls */}
        <div className="mb-6 p-3 bg-sky-950/40 backdrop-blur-lg rounded-xl shadow-lg border border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <button
            onClick={() => setShowGameModeModal(true)}
            className="px-5 py-2.5 font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200"
          >
            Novo Jogo
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Série:</span>
            <div 
              id="series"
              className="w-16 p-2 bg-slate-700/50 border border-slate-500 rounded-lg text-center font-bold text-slate-100"
            >
              {currentGameSeries}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Modo:</span>
            <span className="font-bold text-slate-100 bg-slate-700/70 px-3 py-1 rounded-md">
                {gameMode === GameMode.Quina ? 'Quina' : 'Cartela Cheia'}
            </span>
          </div>
          <button
            onClick={toggleCheckMode}
            className="px-5 py-2.5 font-semibold bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg shadow-md transition-all duration-200"
          >
            {gameState === GameState.Checking ? 'Voltar ao Jogo' : 'Conferir Cartela'}
          </button>
          <button
            onClick={() => setShowTieBreakerModal(true)}
            className="px-5 py-2.5 font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shadow-md transition-all duration-200"
          >
            Desempate
          </button>
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className="p-2.5 font-semibold bg-slate-700 text-white hover:bg-slate-600 rounded-lg shadow-md transition-all duration-200"
            aria-label={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2L17 10" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            )}
          </button>
        </div>

        {/* Main Area */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {gameState === GameState.Checking ? (
               <VerificationBoard
                  allBalls={allBalls}
                  drawnBalls={drawnBallNumbers}
                  checkedBalls={checkedBalls}
                  isJokerChecked={isJokerChecked}
                  onBallClick={handleBallCheck}
                  onJokerClick={handleJokerCheck}
                  lastDrawnBallNumber={lastDrawnBall?.number ?? null}
               />
            ) : (
              <div className="flex flex-col items-center justify-between gap-6 bg-gradient-to-br from-slate-800 via-sky-950 to-slate-900 backdrop-blur-lg rounded-xl p-6 min-h-[300px] border border-white/10 shadow-lg">
                <div className="flex-grow flex items-center justify-center">
                  {isShuffling && shufflingBall ? (
                    <Ball {...shufflingBall} size="lg" />
                  ) : lastDrawnBall ? (
                    <Ball {...lastDrawnBall} size="xl" className="animate-pulse-zoom-large" />
                  ) : (
                    <div className="text-center p-4">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-300/80">
                            {gameState === GameState.Idle ? 'Novo Jogo' : 'Pronto?'}
                        </h2>
                        {gameState === GameState.Running && (
                            <p className="text-slate-400 mt-2 text-sm md:text-base">Clique para sortear a próxima bola!</p>
                        )}
                    </div>
                  )}
                </div>
                <button
                  onClick={drawBall}
                  disabled={gameState !== GameState.Running || availableBalls.length === 0 || isShuffling}
                  className="px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  {isShuffling ? 'Sorteando...' : availableBalls.length > 0 ? 'Sortear Bola' : 'Fim de Jogo'}
                </button>
              </div>
            )}
          </div>
          <aside className="lg:col-span-1">
            {renderDrawnHistory()}
          </aside>
        </main>
      </div>

      <GameModeModal 
        show={showGameModeModal}
        series={series}
        onSelect={handleSelectGameMode}
        onClose={() => setShowGameModeModal(false)}
      />
      <WinnerModal 
        show={showWinnerModal} 
        onClose={() => setShowWinnerModal(false)}
        winType={winType} 
      />
      <TieBreakerModal 
        show={showTieBreakerModal}
        onClose={() => setShowTieBreakerModal(false)}
        allBalls={allBalls}
      />
    </div>
  );
};

export default App;