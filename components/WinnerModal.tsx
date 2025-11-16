import React, { useEffect, useMemo } from 'react';

interface WinnerModalProps {
  show: boolean;
  onClose: () => void;
  winType: string;
}

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return <div className="confetti" style={style} />;
};

const Firework: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  const particles = useMemo(() => {
    const particleCount = 70;
    const colors = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800', '#9c27b0', '#00bcd4', '#ffffff'];
    return Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 50;
      return {
        '--x-end': `${Math.cos(angle) * distance}px`,
        '--y-end': `${Math.sin(angle) * distance}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: `${Math.random() * 3 + 3}px`,
        height: `${Math.random() * 3 + 3}px`,
      };
    });
  }, []);

  return (
    <div className="firework" style={style}>
      {particles.map((particleStyle, i) => (
        <div key={i} className="firework-particle" style={particleStyle as React.CSSProperties} />
      ))}
    </div>
  );
};

const WinnerModal: React.FC<WinnerModalProps> = ({ show, onClose, winType }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const confettiStyles = useMemo(() => {
    if (!show) return [];
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return Array.from({ length: 150 }).map((_, i) => ({
      left: `${Math.random() * 100}vw`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 4}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${Math.random() * 6 + 8}px`,
      height: `${Math.random() * 4 + 6}px`,
    }));
  }, [show]);
  
  const fireworks = useMemo(() => {
    if (!show) return [];
    // A single, large firework explosion in the center, delayed to occur after the text animation.
    return [{
      top: `50%`,
      left: `50%`,
      transform: 'translate(-50%, -50%)',
      animationDelay: `1.7s`,
    }];
  }, [show]);

  if (!show) {
    return null;
  }
  
  const fullMessage = "PARABÉNS GANHOU O PRÊMIO!";

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-title"
    >
      {confettiStyles.map((style, i) => (
        <ConfettiPiece key={i} style={style} />
      ))}
      {fireworks.map((style, i) => (
        <Firework key={i} style={style as React.CSSProperties} />
      ))}
      <div 
        className="relative animate-scale-in text-center flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          id="winner-title" 
          className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 leading-tight animate-gradient-shift animate-text-pulse-grow"
          style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}
        >
          {fullMessage}
        </h2>

        <button 
          onClick={onClose} 
          className="mt-12 px-6 py-3 bg-slate-700/50 text-slate-300 font-semibold text-lg rounded-lg shadow-md transition-all hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 animate-fade-in-subtle"
          style={{ animationDelay: '0.5s' }}
          aria-label="Fechar modal de vencedor"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;