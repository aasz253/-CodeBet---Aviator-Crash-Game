import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import soundManager from '../utils/soundManager';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { user, updateBalance } = useAuth();
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState({
    status: 'waiting',
    currentMultiplier: 1.0,
    roundId: null,
    crashPoint: null,
    history: []
  });
  const [bets, setBets] = useState([]);
  const [myBet, setMyBet] = useState(null);
  const [connected, setConnected] = useState(false);
  const soundReadyRef = useRef(false);
  const statusRef = useRef('waiting');

  useEffect(() => {
    const initSound = async () => {
      if (!soundReadyRef.current) {
        await soundManager.init();
        soundReadyRef.current = true;
      }
    };
    initSound();
  }, []);

  useEffect(() => {
    statusRef.current = gameState.status;
  }, [gameState.status]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        auth: { token }
      });

      socketRef.current.on('connect', () => {
        setConnected(true);
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        setConnected(false);
        console.log('Socket disconnected');
      });

      socketRef.current.on('gameState', (state) => {
        setGameState(state);
      });

      socketRef.current.on('gameStart', async (data) => {
        if (!soundReadyRef.current) {
          await soundManager.init();
          soundReadyRef.current = true;
        }
        
        setGameState(prev => ({
          ...prev,
          status: 'flying',
          roundId: data.roundId,
          crashPoint: data.crashPoint,
          currentMultiplier: 1.0
        }));
        setBets([]);
        setMyBet(null);
        
        if (soundReadyRef.current) {
          soundManager.startEngineSound(1);
        }
      });

      socketRef.current.on('multiplierUpdate', (data) => {
        setGameState(prev => ({
          ...prev,
          currentMultiplier: data.multiplier
        }));
        
        if (soundReadyRef.current && statusRef.current === 'flying') {
          soundManager.updateEngineSound(data.multiplier);
        }
      });

      socketRef.current.on('gameCrash', (data) => {
        setGameState(prev => ({
          ...prev,
          status: 'crashed',
          currentMultiplier: data.multiplier
        }));
        
        if (soundReadyRef.current) {
          soundManager.stopEngineSound();
          soundManager.playCrashSound();
        }
      });

      socketRef.current.on('gameWaiting', (data) => {
        setGameState(prev => ({
          ...prev,
          status: 'waiting',
          currentMultiplier: 1.0,
          roundId: null,
          crashPoint: null
        }));
        
        if (soundReadyRef.current) {
          soundManager.stopEngineSound();
        }
      });

      socketRef.current.on('roundBets', (roundBets) => {
        setBets(roundBets);
      });

      socketRef.current.on('betPlaced', (data) => {
        if (data.success) {
          fetchGameState();
          if (soundReadyRef.current) {
            soundManager.playBetSound();
          }
        }
      });

      socketRef.current.on('autoCashout', (data) => {
        updateBalance(prev => prev + data.winnings);
        if (soundReadyRef.current) {
          soundManager.playCashoutSound();
        }
      });

      fetchGameState();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const fetchGameState = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/game/state');
      setGameState(prev => ({
        ...prev,
        ...res.data,
        history: res.data.history || []
      }));
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  const placeBet = async (amount, autoCashout = null) => {
    try {
      const res = await axios.post('http://localhost:5000/api/game/bet', {
        amount,
        autoCashout
      });
      setMyBet({
        amount,
        autoCashoutAt: autoCashout,
        cashedOut: false
      });
      updateBalance(res.data.balance);
      if (soundReadyRef.current) {
        soundManager.playBetSound();
      }
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error placing bet';
    }
  };

  const cashOut = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/game/cashout', {
        multiplier: gameState.currentMultiplier
      });
      if (myBet) {
        setMyBet(prev => ({
          ...prev,
          cashedOut: true,
          winnings: res.data.winnings
        }));
      }
      updateBalance(res.data.balance);
      if (soundReadyRef.current) {
        soundManager.playCashoutSound();
      }
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Error cashing out';
    }
  };

  return (
    <GameContext.Provider value={{
      gameState,
      bets,
      myBet,
      connected,
      placeBet,
      cashOut,
      socket: socketRef.current
    }}>
      {children}
    </GameContext.Provider>
  );
};
