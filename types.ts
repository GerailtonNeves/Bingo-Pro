export interface Ball {
  number: number;
  letter: 'B' | 'I' | 'N' | 'G' | 'O';
  color: string;
}

export enum GameMode {
  FullCard = 'FULL_CARD',
  Quina = 'QUINA',
}

export enum GameState {
  Idle = 'IDLE',
  Running = 'RUNNING',
  Checking = 'CHECKING',
}
