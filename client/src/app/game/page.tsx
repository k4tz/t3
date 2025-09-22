'use client';

import { useEffect, useRef, useState } from 'react';
import { SquareProps } from "@/types/ttt"
import useGameState from "@/store/gameState";
import socket from "@/lib/socket";
import { useRouter } from 'next/navigation';

export default function Board() {
  const { 
    gameMode, 
    arenaId, 
    opponent, 
    playerMark, 
    currentPlayer, 
    winner, 
    gameStatus,
    winnerPlacements: onlineWinnerPlacements,
    makeMove, 
    updateGameState,
    resetGame,
    exitMatch,
    calculateWinnerPlacements
  } = useGameState();
  const router = useRouter();
  
  // State for confirmation modal
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);
  
  // Local state for offline mode
  const [localBoardState, setLocalBoardState] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);

  const [gameSteps, setGameSteps] = useState<string[][][]>([]);
  const [xMoveSet, setXMoveSet] = useState<number[]>([]);
  const [oMoveSet, setOMoveSet] = useState<number[]>([]);
  const [lastMove, setLastMove] = useState('');
  const [currentStep, setCurrentStep] = useState(9);
  const [leadingMark, setLeadingMark] = useState<string>('');
  const [winnerPlacements, setWinnerPlacements] = useState<number[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [localWinner, setLocalWinner] = useState<string>('');
  const replayProgress = useRef(0);
  
  // Replay state - same as offline mode
  const [replaySteps, setReplaySteps] = useState<string[][][]>([]);

  // Use online state if in online mode, local state otherwise
  const boardState = gameMode === 'online' ? useGameState.getState().boardState : localBoardState;
  const currentWinner = gameMode === 'online' ? winner : localWinner;
  
  // Use replay board state when replaying in offline mode, otherwise use normal board state
  const displayBoardState = isReplaying && replaySteps.length > 0 && gameMode === 'offline' ? 
    replaySteps[Math.min(replayProgress.current / 100 * replaySteps.length, replaySteps.length - 1)] : 
    boardState;
  
  // Use online winner placements if in online mode, local otherwise
  // For offline mode, don't show winner placements during replay
  const currentWinnerPlacements = gameMode === 'online' ? 
    (onlineWinnerPlacements.length > 0 ? onlineWinnerPlacements : calculateWinnerPlacements(boardState, currentWinner || '')) : 
    (isReplaying ? [] : winnerPlacements);

  // Socket event handlers for online mode
  useEffect(() => {
    if (gameMode === 'online' && arenaId) {
      // Handle game state updates from server
      const handleGameStateUpdate = (data: { Ledger: { board: string[][]; currentPlayer: 'X' | 'O'; winner?: string } }) => {
        console.log(`[Game] Received game state update:`, data);
        // Convert server game state to our format
        const serverBoard = data.Ledger.board;
        const currentPlayer = data.Ledger.currentPlayer;
        const winner = data.Ledger.winner;
        
        console.log(`[Game] Updating game state:`, { serverBoard, currentPlayer, winner });
        updateGameState(serverBoard, currentPlayer, winner);
      };

      // Handle player mark assignment
      const handlePlayerMark = (mark: 'X' | 'O') => {
        console.log(`[Game] Received player mark: ${mark}`);
        useGameState.setState({ playerMark: mark });
      };

      // Handle invalid move
      const handleInvalidMove = (data: { message: string }) => {
        console.error('Invalid move:', data.message);
      };

      // Handle game state restoration after reconnection
      const handleGameStateRestore = (data: { 
        arenaId: string; 
        players: string[]; 
        gameState: { 
          board: string[][]; 
          currentPlayer: 'X' | 'O'; 
          winner?: string; 
          lastMove?: string 
        } 
      }) => {
        console.log(`[Game] Received game state restoration:`, data);
        
        // Restore the game state
        useGameState.getState().restoreGameState({
          arenaId: data.arenaId,
          players: data.players,
          gameState: data.gameState
        });
        
        // Navigate to game if not already there
        if (router.pathname !== '/game') {
          router.push('/game');
        }
      };

      // Handle player disconnected with reconnection grace period
      const handlePlayerDisconnected = (data: { disconnectedPlayer: string; message: string }) => {
        console.log(`[Game] Player disconnected:`, data);
        // Show a temporary message instead of immediately ending the game
        // The game will only end if reconnection fails after timeout
      };

      // Handle game ended due to failed reconnection
      const handleGameEnded = (data: { reason: string; message: string }) => {
        console.log(`[Game] Game ended:`, data);
        alert(data.message);
        useGameState.getState().exitMatch();
        router.push('/select-mode');
      };

      // Handle opponent surrendered
      const handleOpponentSurrendered = (data: { message: string }) => {
        alert(data.message);
        exitMatch();
        router.push('/select-mode');
      };

      // Handle surrender success
      const handleSurrenderSuccess = (data: { message: string }) => {
        console.log(`[Game] Surrender successful: ${data.message}`);
        // The game state will be reset and navigation handled in handleConfirmEndMatch
      };

      socket.on('game_state_update', handleGameStateUpdate);
      socket.on('player_mark', handlePlayerMark);
      socket.on('invalid_move', handleInvalidMove);
      socket.on('player_disconnected', handlePlayerDisconnected);
      socket.on('opponent_surrendered', handleOpponentSurrendered);
      socket.on('surrender_success', handleSurrenderSuccess);
      socket.on('game_state_restore', handleGameStateRestore);
      socket.on('game_ended', handleGameEnded);

      return () => {
        socket.off('game_state_update', handleGameStateUpdate);
        socket.off('player_mark', handlePlayerMark);
        socket.off('invalid_move', handleInvalidMove);
        socket.off('player_disconnected', handlePlayerDisconnected);
        socket.off('opponent_surrendered', handleOpponentSurrendered);
        socket.off('surrender_success', handleSurrenderSuccess);
        socket.off('game_state_restore', handleGameStateRestore);
        socket.off('game_ended', handleGameEnded);
      };
    }
  }, [gameMode, arenaId, updateGameState, resetGame]);

  useEffect(() => {
    if(gameSteps.length >= 5 && gameMode === 'offline'){
      checkVictoryCondition();
    }
  }, [boardState, gameSteps, gameMode]);

  // Redirect to match-end page when online game ends
  useEffect(() => {
    if (winner && gameStatus === 'finished' && gameMode === 'online') {
      // Small delay to let the final move animation play
      setTimeout(() => {
        // Redirect to match-end page (data will be read from game state)
        router.push('/match-end');
      }, 1000);
    }
  }, [winner, gameStatus, gameMode, router]);

  const syncMoveSetsWithHistoryRevision = () => {
    if(currentStep === 0){
        if(leadingMark == 'X'){
            setXMoveSet(() => {
                return xMoveSet.slice(0,1);
            });
            setOMoveSet(() => {
                return [];
            });
        }else{
            setXMoveSet(() => {
                return [];
            });
            setOMoveSet(() => {
                return oMoveSet.slice(0,1);
            });
        }
    }else if(currentStep % 2 != 0){
        //slice equally  
        const elements = (currentStep + 1)/2

        setXMoveSet(() => {
            return xMoveSet.slice(0, elements);
        });

        setOMoveSet(() => {
            return oMoveSet.slice(0, elements);
        });
    }else if(currentStep % 2 == 0){
        const leadingSlice = currentStep/2 + 1;
        const followingSlice = currentStep/2;

        if(leadingMark == 'X'){
            setXMoveSet(() => {
                return xMoveSet.slice(0, leadingSlice);
            });

            setOMoveSet(() => {
                return oMoveSet.slice(0, followingSlice);
            });
        }else{
            setXMoveSet(() => {
                return xMoveSet.slice(0, followingSlice);
            });

            setOMoveSet(() => {
                return oMoveSet.slice(0, leadingSlice);
            });
        }
    }
  }
  const placeMarker = (rowIdx: number, colIdx: number) => {
    // Check if spot is already taken
    if(boardState[rowIdx][colIdx]) return;
    
    // Check if game is finished
    if(currentWinner) return;

    if (gameMode === 'online') {
      // Online mode - send move to server
      console.log(`[Game] Attempting to place marker at (${rowIdx}, ${colIdx})`);
      console.log(`[Game] Current state:`, { currentPlayer, playerMark, gameStatus, arenaId });
      
      if (currentPlayer === playerMark && gameStatus === 'playing' && arenaId) {
        console.log(`[Game] Sending move to server`);
        makeMove(rowIdx, colIdx);
      } else {
        console.log(`[Game] Move blocked:`, {
          currentPlayerMatch: currentPlayer === playerMark,
          gamePlaying: gameStatus === 'playing',
          hasArena: !!arenaId
        });
      }
      return;
    }

    // Offline mode - local game logic
    let lm = lastMove;

    if(currentStep < gameSteps.length -1){
      //invalidate the history  after this step
      setGameSteps((prev) => {
        return prev.slice(0, currentStep + 1);
      });

      syncMoveSetsWithHistoryRevision();

      //reset current set since we now want to build new history
      setCurrentStep(9);

      //reset last move for that step
      const followUpMark = leadingMark == 'X' ? 'O' : 'X';

      if(currentStep % 2 == 0){
        setLastMove(leadingMark);
        lm = leadingMark;
      }else{
        setLastMove(followUpMark);
        lm = followUpMark;
      }
    }

    const currMove = lm == 'X' ? 'O' : 'X'; 
    
    if(!gameSteps.length) setLeadingMark(currMove);

    if(currMove == 'X'){
      setXMoveSet((prev) => {
        return [...prev, 3*rowIdx + colIdx];
      });
    }else{
      setOMoveSet((prev) => {
        return [...prev, 3*rowIdx + colIdx];
      });
    }
    
    setLocalBoardState((prev) => {
      const board = [...prev]
      board[rowIdx][colIdx] = currMove
      return board;
    });

    setLastMove(currMove)

    setGameSteps((prev) => {
      const currState = structuredClone(localBoardState);
      return [...prev, currState];
    })
}

  const resetBoard = () => {
    if(isReplaying && gameMode === 'offline'){
      alert("Cannot reset during replay");
      return;
    }

    if (gameMode === 'online') {
      // Online mode - reset through game state
      resetGame();
      return;
    }

    // Offline mode - reset local state
    setLocalBoardState(() => {
      return [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    });

    //reset game history
    setGameSteps(() => {
      return [];
    });

    //reset move sets
    setXMoveSet(() => {
      return [];
    });

    setOMoveSet(() => {
      return [];
    })

    //reset last move
    setLastMove('');

    setCurrentStep(9);

    setLeadingMark('');

    setLocalWinner('');

    setWinnerPlacements(() => {
      return [];
    });
  }

  const jumpToStep = (step: number) => {
    setLocalBoardState(() => {
      return structuredClone(gameSteps[step]);
    });

    setCurrentStep(step);
  }

  const currentTurn = () => {
    if (gameMode === 'online') {
      return currentPlayer;
    }
    return lastMove == 'X' ? 'O' : 'X';
  }
  const checkVictoryCondition = () => {
    //check rows
    for(let i = 0; i < 3; i++){
      if(boardState[i][0] && boardState[i][0] == boardState[i][1] && boardState[i][0] == boardState[i][2]){
        setLocalWinner(boardState[i][0]);
        setWinnerPlacements(() => {
          return [
            3*i + 0,
            3*i + 1,
            3*i + 2
          ];
        });
        return;
      }
    }

    //check columns
    for(let i = 0; i < 3; i++){
        if(boardState[0][i] && boardState[0][i] == boardState[1][i] && boardState[0][i] == boardState[2][i]){
          setLocalWinner(boardState[0][i]);
          setWinnerPlacements(() => {
            return [
              3*0 + i,
              3*1 + i,
              3*2 + i
            ];
          });
          return;
        }
    }

    //checks diagonals
    //left diagonal
    
    if(boardState[0][0] && boardState[0][0] == boardState[1][1] && boardState[0][0] == boardState[2][2]){
        setLocalWinner(boardState[0][0]);
        setWinnerPlacements(() => {
          return [0, 4, 8];
        });
        return;
    }
    
    //right diagonal
    if(boardState[0][2] && boardState[0][2] == boardState[1][1] && boardState[0][2] == boardState[2][0]){
        setLocalWinner(boardState[0][2]);
        setWinnerPlacements(() => {
          return [2, 4, 6];
        });
        return;
    }
  }

  const replay = () => {
    if (isReplaying) {
      alert("Cannot replay during replay");
      return;
    }

    // Only allow replay in offline mode
    if (gameMode !== 'offline') {
      return;
    }

    // For offline mode, use existing gameSteps
    if (gameSteps.length === 0) {
      alert("No moves to replay");
      return;
    }
    
    setIsReplaying(true);
    setReplaySteps(structuredClone(gameSteps));
    
    // Store original winner placements
    const wps = structuredClone(winnerPlacements);
    setWinnerPlacements([]);
    
    // Replay each step
    for (let i = 0; i < gameSteps.length; i++) {
      setTimeout(() => {
        replayProgress.current = 100 / gameSteps.length * (i + 1);
        if (i === gameSteps.length - 1) {
          setIsReplaying(false);
          replayProgress.current = 0;
          setWinnerPlacements(wps);
        }
      }, 1000 + i * 1000);
    }
  };

  // Handle exit/end match button click
  const handleExitButton = () => {
    if (gameMode === 'offline') {
      // For offline mode, just navigate back to select mode
      router.push('/select-mode');
    } else {
      // For online mode, check if game is finished
      if (currentWinner || gameStatus === 'finished') {
        // Game is finished, navigate back
        router.push('/select-mode');
      } else {
        // Game is still ongoing, show confirmation modal
        setShowEndMatchModal(true);
      }
    }
  };

  // Handle confirming end match (surrender)
  const handleConfirmEndMatch = () => {
    console.log(`[Game] ===== SURRENDER INITIATED =====`);
    console.log(`[Game] Arena ID: ${arenaId}`);
    console.log(`[Game] Socket connected: ${socket.connected}`);
    console.log(`[Game] Socket ID: ${socket.id}`);
    
    if (arenaId) {
      // Emit surrender event to server
      console.log(`[Game] Emitting surrender event with arenaId: ${arenaId}`);
      socket.emit('surrender', { arenaId });
      console.log(`[Game] Surrender event emitted successfully`);
    } else {
      console.error(`[Game] No arenaId available for surrender`);
    }
    
    // Reset game state and navigate back
    exitMatch();
    setShowEndMatchModal(false);
    router.push('/select-mode');
  };

  // Handle canceling end match
  const handleCancelEndMatch = () => {
    setShowEndMatchModal(false);
  };

  return <>
    <div id="game_screen" className="h-screen flex flex-col md:flex-row items-center justify-center">
      {/* Exit/End Match Button */}
      <div className="fixed left-4 md:left-10 top-6 z-40">
        
      </div>
      <div className="w-fit board relative">
        <h1 className={`text-4xl font-bold absolute top-[-30%] md:top-[-20%] transition-all duration-500 ${
          isReplaying && gameMode === 'offline' ? 'text-purple-400 animate-pulse drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]' :
          gameMode === 'online' && gameStatus === 'playing' && currentPlayer === playerMark ? 'text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]' :
          gameMode === 'online' && gameStatus === 'playing' && currentPlayer !== playerMark ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]' :
          'text-white'
        }`}>
          {isReplaying && gameMode === 'offline' ? (
            <span className="flex items-center gap-2">
              <span className="text-3xl animate-spin">🔄</span>
              <span>Replaying Game...</span>
            </span>
          ) : gameMode === 'online' ? (
            gameStatus === 'playing' ? (
              currentPlayer === playerMark ? (
                <span className="flex items-center gap-2">
                  <span className="text-3xl animate-bounce">🎯</span>
                  <span>Your Turn ({playerMark})</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-3xl animate-pulse">⏳</span>
                  <span>Opponent's Turn ({currentPlayer})</span>
                </span>
              )
            ) : 
            gameStatus === 'waiting' ? (
              <span className="flex items-center gap-2">
                <span className="text-3xl animate-spin">⏳</span>
                <span>Waiting for opponent...</span>
              </span>
            ) : 'Game over'
          ) : (
            gameSteps.length < 9 ? (
              <span className="flex items-center gap-2">
                <span className="text-3xl animate-bounce">🎯</span>
                <span>Player {currentTurn()}'s Turn</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-3xl">🤝</span>
                <span>It's a Draw!</span>
              </span>
            )
          )}
        </h1>
        {gameMode === 'online' && opponent && (
          <div className="text-lg text-blue-400 absolute top-[-15%] md:top-[-10%] text-center">
            vs {opponent}
          </div>
        )}
        <div className="">
          {displayBoardState.map((row, rowIdx) => {
              return (
              <div className="board-row" key={rowIdx}>
              {row.map((cell, colIdx) => {
                  return <Square 
                    value={cell} 
                    key={colIdx} 
                    handleClick={() => !(isReplaying && gameMode === 'offline') && placeMarker(rowIdx, colIdx)} 
                    isWinnerPlacement={!(isReplaying && gameMode === 'offline') && currentWinnerPlacements.includes(3*rowIdx + colIdx)}
                  />
              })}
              </div>
              );
          })}
        </div>
        <div className={"w-full absolute bottom-[-30%] md:bottom-[-20%] z-10 flex flex-col gap-3"}>
          {isReplaying && gameMode === 'offline' && (
            <div className="flex flex-col items-center gap-2">
              <progress value={replayProgress.current} max="100" className="w-full h-3"></progress>
              <span className="text-sm text-gray-300">
                Replaying moves...
              </span>
            </div>
          )}
          <div className="flex gap-2">
            {gameMode === 'offline' && (
              <button onClick={resetBoard} className="bg-black text-white p-2 rounded-md reset-btn">Reset</button>
            )}
            {(currentWinner || (gameMode === 'offline' && gameSteps.length == 9)) && !isReplaying && gameMode === 'offline' && (
              <button 
                onClick={replay} 
                className="bg-black text-white p-2 rounded-md reset-btn flex items-center gap-2"
                disabled={isReplaying}
              >
                <span>🔄</span>
                <span>Replay</span>
              </button>
            )}
            <button
              onClick={handleExitButton}
              className={`flex items-center backdrop-blur-md rounded-lg px-4 py-1 transition-colors ${
                gameMode === 'offline' || currentWinner || gameStatus === 'finished' || (gameMode === 'offline' && gameSteps.length === 9) ?
                'bg-green-600/80 hover:bg-green-700/80 border border-green-500/50' :
                'bg-red-600/80 hover:bg-red-700/80 border border-red-500/50'
              }`}
            >
              <span className="text-xl mr-2">
                {gameMode === 'offline' || currentWinner || gameStatus === 'finished' || (gameMode === 'offline' && gameSteps.length === 9) ? '🚪' : '🏳️'}
              </span>
              <span className="font-bold text-lg md:text-xl text-white hidden sm:block">
                {gameMode === 'offline' ? 'Exit' : 
                 (currentWinner || gameStatus === 'finished') ? 'Exit Game' : 'Surrender'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-[300px] min-h-[300px] lg:min-w-[500px] lg:min-h-[500px] relative lg:left-10">
          
          
          {/* <div className="border m-2 px-10 py-3 min-h-[200px]">
            <h1 className="text-2xl font-bold text-white underline">Game Ladder</h1>
            <div className="my-5">
              {gameSteps.map((step, idx) => {
                return <p key={idx} onClick={()=> jumpToStep(idx)} className={"cursor-pointer text-lg text-white underline" + ` ml-${idx+1}`}>Move {idx + 1}</p>
              })}
            </div>
          </div> */}
      </div>
    </div>

    {/* End Match Confirmation Modal */}
    {showEndMatchModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🏳️</span>
            Surrender Match
          </h2>
          <p className="text-gray-300 mb-6">
            Are you sure you want to surrender this match? This will count as a loss and end the game immediately.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelEndMatch}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEndMatch}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <span>🏳️</span>
              <span>Surrender</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </>;
}


function Square({value, handleClick, isWinnerPlacement} : SquareProps) {
  return <button className={"square w-[75px] h-[75px] md:w-[100px] md:h-[100px] m-[4px] md:m-[10px]" + (isWinnerPlacement ? " winner-placement" : "")} onClick={handleClick}>
    <span className={value?"opacity-100":"opacity-0"}>{value ?value: 'H'}</span>
  </button>
}
