'use client';

import { useEffect, useRef, useState } from 'react';
import { SquareProps } from "@/types/ttt"

export default function Board() {
  
  const [boardState, setBoardState] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);

  const [gameSteps, setGameSteps] = useState<string[][][]>([]);

  const [xMoveSet, setXMoveSet] = useState<number[]>([]);
  const [oMoveSet, setOMoveSet] = useState<number[]>([]);

  const [lastMove, setLastMove] = useState('');

  const [winner, setWinner] = useState('');

  const [currentStep, setCurrentStep] = useState(9);

  const [leadingMark, setLeadingMark] = useState<string>('');

  const [winnerPlacements, setWinnerPlacements] = useState<number[]>([]);

  const [isReplaying, setIsReplaying] = useState(false);

  const replayProgress = useRef(0);

  useEffect(() => {
    if(gameSteps.length >= 5){
      checkVictoryCondition();
    }
  }, [boardState, gameSteps]);

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
        let elements = (currentStep + 1)/2

        setXMoveSet(() => {
            return xMoveSet.slice(0, elements);
        });

        setOMoveSet(() => {
            return oMoveSet.slice(0, elements);
        });
    }else if(currentStep % 2 == 0){
        let leadingSlice = currentStep/2 + 1;
        let followingSlice = currentStep/2;

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

    let lm = lastMove;

    if(winner) return;

    if(currentStep < gameSteps.length -1){
      //invalidate the history  after this step
      setGameSteps((prev) => {
        return prev.slice(0, currentStep + 1);
      });

      syncMoveSetsWithHistoryRevision();

      //reset current set since we now want to build new history
      setCurrentStep(9);

      //reset last move for that step
      let followUpMark = leadingMark == 'X' ? 'O' : 'X';

      if(currentStep % 2 == 0){
        setLastMove(leadingMark);
        lm = leadingMark;
      }else{
        setLastMove(followUpMark);
        lm = followUpMark;
      }
    }
    //check if a spot has already been marked, and if so, we don't do any further change
    if(boardState[rowIdx][colIdx]) return;

    let currMove = lm == 'X' ? 'O' : 'X'; 
    
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
    
    setBoardState((prev) => {
      const board = [...prev]

    //   const row = board[rowIdx]

    //   row[colIdx] = currMove

      board[rowIdx][colIdx] = currMove

      return board;
    });

    setLastMove(currMove)

    setGameSteps((prev) => {
      const currState = structuredClone(boardState);
      return [...prev, currState];
    })
}

  const resetBoard = () => {

    if(isReplaying){
      alert("Cannot reset during replay");
      return;
    }
    setBoardState(() => {
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

    setWinner('');

    setWinnerPlacements(() => {
      return [];
    });
  }

  const jumpToStep = (step: number) => {
    setBoardState(() => {
      return structuredClone(gameSteps[step]);
    });

    setCurrentStep(step);
  }

  const currentTurn = () => {
    return lastMove == 'X' ? 'O' : 'X';
  }
  const checkVictoryCondition = () => {
    //check rows
    for(let i = 0; i < 3; i++){
      if(boardState[i][0] && boardState[i][0] == boardState[i][1] && boardState[i][0] == boardState[i][2]){
        setWinner(boardState[i][0]);
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
          setWinner(boardState[0][i]);
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
        setWinner(boardState[0][0]);
        setWinnerPlacements(() => {
          return [0, 4, 8];
        });
        return;
    }
    
    //right diagonal
    if(boardState[0][2] && boardState[0][2] == boardState[1][1] && boardState[0][2] == boardState[2][0]){
        setWinner(boardState[0][2]);
        setWinnerPlacements(() => {
          return [2, 4, 6];
        });
        return;
    }
  }

  const replay = () => {
    setIsReplaying(true);
    setBoardState(() => {
      return [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    });
    let wps = structuredClone(winnerPlacements);
    setWinnerPlacements(() => {
      return [];
    });
    for(let i = 0; i < gameSteps.length; i++){
      setTimeout(() => {
        replayProgress.current = 100/gameSteps.length * (i + 1);
        jumpToStep(i);
        if(i == gameSteps.length - 1) {
          setIsReplaying(false);
          replayProgress.current = 0;
          setWinnerPlacements(() => {
            return wps;
          });
        }
      }, 1000 + i * 1000);
    }    
  }

  return <>
    <div id="game_screen" className="h-screen flex flex-col md:flex-row items-center justify-center">
      
      <div className="w-fit board relative">
        <h1 className="text-4xl font-bold absolute top-[-30%] md:top-[-20%] text-white">
            {winner ? `Winner: ${winner}` : gameSteps.length < 9 ? `Player: ${currentTurn()}` : 'Game over'}
        </h1>
        <div className="">
          {boardState.map((row, rowIdx) => {
              return (
              <div className="board-row" key={rowIdx}>
              {row.map((cell, colIdx) => {
                  return <Square value={cell} key={colIdx} handleClick={() => placeMarker(rowIdx, colIdx)} isWinnerPlacement={winnerPlacements.includes(3*rowIdx + colIdx)}/>
              })}
              </div>
              );
          })}
        </div>
        <div className={"w-full absolute bottom-[-30%] md:bottom-[-20%] z-10 flex flex-col gap-3"}>
          {isReplaying && <progress value={replayProgress.current} max="100"></progress>}
          <div className="flex gap-2">
            <button onClick={resetBoard} className="border bg-black text-white p-2 rounded-md reset-btn">Reset</button>
            {(winner || gameSteps.length == 9 ) && <button onClick={replay} className={"border bg-black text-white p-2 rounded-md reset-btn"}>Replay</button>}
          </div>
        </div>
      </div>

      <div className="w-[300px] min-h-[300px] lg:min-w-[500px] lg:min-h-[500px] relative lg:left-10">
          
          
          {/* <div className="border border m-2 px-10 py-3 min-h-[200px]">
            <h1 className="text-2xl font-bold text-white underline">Game Ladder</h1>
            <div className="my-5">
              {gameSteps.map((step, idx) => {
                return <p key={idx} onClick={()=> jumpToStep(idx)} className={"cursor-pointer text-lg text-white underline" + ` ml-${idx+1}`}>Move {idx + 1}</p>
              })}
            </div>
          </div> */}
      </div>
    </div>
  </>;
}


function Square({value, handleClick, isWinnerPlacement} : SquareProps) {
  return <button className={"square w-[75px] h-[75px] md:w-[100px] md:h-[100px] m-[4px] md:m-[10px]" + (isWinnerPlacement ? " winner-placement" : "")} onClick={handleClick}>
    <span className={value?"opacity-100":"opacity-0"}>{value ?value: 'H'}</span>
  </button>
}
