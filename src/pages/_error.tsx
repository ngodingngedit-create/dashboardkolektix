// import type { NextPage } from 'next';
// import Logo from '@/assets/images/kolektix logo tansparant-blue.png';
// import Link from 'next/link';
// import Image from 'next/image';

// const Error: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
//   console.log({ statusCode });
//   return (
//     <div className='min-h-screen text-dark flex flex-col gap-2 items-center justify-center'>
//       <Image src={Logo} alt='Logo' className='w-20' />
//       <h1 className='font-bold text-5xl'>{statusCode ? `${statusCode}` : '404'}</h1>
//       <p className=''>
//         {statusCode
//           ? `We have an internal server error`
//           : 'Sorry, this page does’nt exist or a client side error occured'}
//       </p>
//       <Link href='/' className='text-primary-base text-sm'>
//         Back to Home
//       </Link>
//     </div>
//   );
// };

// // various log checks
// Error.getInitialProps = ({ res, err }) => {
//   console.log('err', err);
//   console.log('res', res);
//   const clientSideError = res ? res.statusCode : Boolean(err);
//   console.log({ clientSideError });
//   console.log('server', Boolean(res));
//   const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
//   return { statusCode };
// };

// export default Error;

// import type { NextPage } from 'next';
// import Logo from '@/assets/images/kolektix logo tansparant-blue.png';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useEffect, useState } from 'react';

// const Error: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
//   const [dots, setDots] = useState('');
  
//   // Animasi loading dots
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setDots(prev => prev.length >= 3 ? '' : prev + '.');
//     }, 500);
    
//     return () => clearInterval(interval);
//   }, []);

//   // Kalo bukan maintenance mode, tampilkan error biasa
//   if (statusCode && statusCode !== 503) {
//     return (
//       <div className='min-h-screen text-dark flex flex-col gap-2 items-center justify-center'>
//         <Image src={Logo} alt='Logo' className='w-20' />
//         <h1 className='font-bold text-5xl'>{statusCode}</h1>
//         <p className=''>
//           {statusCode === 404 
//             ? 'Sorry, this page doesn’t exist'
//             : 'We have an internal server error'}
//         </p>
//         <Link href='/' className='text-primary-base text-sm'>
//           Back to Home
//         </Link>
//       </div>
//     );
//   }

//   // Tampilan Under Maintenance
//   return (
//     <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white text-dark flex flex-col gap-4 items-center justify-center p-4'>
//       <Image src={Logo} alt='Logo' className='w-20 md:w-24' />
      
//       {/* Orang main game */}
//       <div className='relative my-4'>
//         <div className='text-8xl animate-bounce'>
//           👨‍💻
//         </div>
//       </div>
      
//       <h1 className='font-bold text-4xl text-center'>
//         Under Maintenance
//       </h1>
      
//       <p className='text-gray-600 text-center max-w-md'>
//         Lagi ada rutinitas dulu bentar{dots}
//       </p>
      
//       <Link href='/' className='mt-6 text-primary-base hover:text-primary-dark transition-colors font-medium'>
//         ← Back to Home
//       </Link>
//     </div>
//   );
// };

// // Tambahin CSS custom untuk spin lambat
// const styles = `
//   @keyframes spin-slow {
//     from {
//       transform: rotate(0deg);
//     }
//     to {
//       transform: rotate(360deg);
//     }
//   }
//   .animate-spin-slow {
//     animation: spin-slow 3s linear infinite;
//   }
// `;

// // Inject styles
// if (typeof document !== 'undefined') {
//   const style = document.createElement('style');
//   style.innerHTML = styles;
//   document.head.appendChild(style);
// }

// Error.getInitialProps = ({ res, err }) => {
//   console.log('err', err);
//   console.log('res', res);
  
//   // Set status code 503 untuk maintenance mode
//   // Atau bisa juga pake logic tertentu buat nentuin kapan maintenance
//   const isMaintenanceMode = true; // Ganti jadi logic sesuai kebutuhan
  
//   if (isMaintenanceMode) {
//     if (res) {
//       res.statusCode = 503;
//     }
//     return { statusCode: 503 };
//   }
  
//   const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
//   return { statusCode };
// };

// export default Error;

import type { NextPage } from 'next';
import Logo from '@/assets/images/kolektix logo tansparant-blue.png';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';

const Error: NextPage<{ statusCode?: number }> = ({ statusCode }) => {
  const [dots, setDots] = useState('');
  
  // Tetris Game State
  const [board, setBoard] = useState(Array(20).fill(0).map(() => Array(10).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Tetris shapes - pake warna item semua
  const SHAPES = [
    { // I
      shape: [[1,1,1,1]],
      color: 'bg-white'
    },
    { // O
      shape: [[1,1],[1,1]],
      color: 'bg-white'
    },
    { // T
      shape: [[0,1,0],[1,1,1]],
      color: 'bg-white'
    },
    { // L
      shape: [[1,0,0],[1,1,1]],
      color: 'bg-white'
    },
    { // J
      shape: [[0,0,1],[1,1,1]],
      color: 'bg-white'
    },
    { // S
      shape: [[0,1,1],[1,1,0]],
      color: 'bg-white'
    },
    { // Z
      shape: [[1,1,0],[0,1,1]],
      color: 'bg-white'
    }
  ];

  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [nextPiece, setNextPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  
  // Ref untuk menghindari race condition
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const positionRef = useRef(position);

  // Update refs ketika state berubah
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    currentPieceRef.current = currentPiece;
  }, [currentPiece]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Random piece generator
  const getRandomPiece = () => {
    const index = Math.floor(Math.random() * SHAPES.length);
    return { ...SHAPES[index], index };
  };

  // Initialize game
  const startGame = () => {
    const newBoard = Array(20).fill(0).map(() => Array(10).fill(0));
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    const firstPiece = getRandomPiece();
    const secondPiece = getRandomPiece();
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setPosition({ x: 3, y: 0 });
  };

  // Check collision
  const checkCollision = useCallback((piece: any, newPos: { x: number, y: number }, boardData: number[][]) => {
    if (!piece) return true;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[0].length; col++) {
        if (piece.shape[row][col] !== 0) {
          const boardRow = newPos.y + row;
          const boardCol = newPos.x + col;
          
          if (boardRow >= 20 || boardCol < 0 || boardCol >= 10 || boardRow < 0) {
            return true;
          }
          
          if (boardRow >= 0 && boardData[boardRow] && boardData[boardRow][boardCol] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Merge piece to board
  const mergePiece = useCallback(() => {
    if (!currentPieceRef.current) return;

    const currentBoard = boardRef.current.map(row => [...row]);
    const piece = currentPieceRef.current;
    const pos = positionRef.current;
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[0].length; col++) {
        if (piece.shape[row][col] !== 0) {
          const boardRow = pos.y + row;
          const boardCol = pos.x + col;
          if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
            currentBoard[boardRow][boardCol] = 1; // Semua jadi 1 karena warna item
          }
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0;
    for (let row = 19; row >= 0; row--) {
      if (currentBoard[row].every(cell => cell !== 0)) {
        currentBoard.splice(row, 1);
        currentBoard.unshift(Array(10).fill(0));
        linesCleared++;
        row++;
      }
    }

    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100);
    }

    setBoard(currentBoard);
    
    const newCurrentPiece = nextPiece;
    const newNextPiece = getRandomPiece();
    setCurrentPiece(newCurrentPiece);
    setNextPiece(newNextPiece);
    setPosition({ x: 3, y: 0 });

    if (checkCollision(newCurrentPiece, { x: 3, y: 0 }, currentBoard)) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, [nextPiece, checkCollision]);

  // Move piece
  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPieceRef.current || !isPlaying || gameOver) return;

    const newPos = { 
      x: positionRef.current.x + dx, 
      y: positionRef.current.y + dy 
    };
    
    if (!checkCollision(currentPieceRef.current, newPos, boardRef.current)) {
      setPosition(newPos);
    } else if (dy === 1) {
      mergePiece();
    }
  }, [isPlaying, gameOver, checkCollision, mergePiece]);

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPieceRef.current || !isPlaying || gameOver) return;

    const rotated = currentPieceRef.current.shape[0].map((_: any, index: number) => 
      currentPieceRef.current.shape.map((row: number[]) => row[index]).reverse()
    );

    const rotatedPiece = { ...currentPieceRef.current, shape: rotated };
    
    if (!checkCollision(rotatedPiece, positionRef.current, boardRef.current)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [isPlaying, gameOver, checkCollision]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current || !isPlaying || gameOver) return;

    let newY = positionRef.current.y;
    
    while (!checkCollision(
      currentPieceRef.current, 
      { x: positionRef.current.x, y: newY + 1 }, 
      boardRef.current
    )) {
      newY++;
    }
    
    setPosition({ x: positionRef.current.x, y: newY });
    
    setTimeout(() => {
      mergePiece();
    }, 10);
  }, [isPlaying, gameOver, checkCollision, mergePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      
      e.preventDefault();
      
      switch(e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotatePiece, hardDrop]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameInterval = setInterval(() => {
      movePiece(0, 1);
    }, 500);

    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver, movePiece]);

  // Animasi loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Kalo bukan maintenance mode, tampilkan error biasa
  if (statusCode && statusCode !== 503) {
    return (
      <div className='min-h-screen bg-white text-dark flex flex-col gap-2 items-center justify-center'>
        <Image src={Logo} alt='Logo' className='w-20' />
        <h1 className='font-bold text-5xl'>{statusCode}</h1>
        <p className=''>
          {statusCode === 404 
            ? 'Sorry, this page doesn’t exist'
            : 'We have an internal server error'}
        </p>
        <Link href='/' className='text-primary-base text-sm'>
          Back to Home
        </Link>
      </div>
    );
  }

  // Tampilan Under Maintenance dengan layout 50:50 - SWAPPED POSITIONS
  return (
    <div className='min-h-screen bg-white flex flex-row'>
      {/* Left side - Under Maintenance (50%) - SEKARANG DI KIRI */}
      <div className='w-1/2 bg-white flex flex-col items-center justify-center p-8'>
        <div className='max-w-md text-center space-y-6'>
          <Image src={Logo} alt='Logo' className='w-24 mx-auto' />
          
          <div className='space-y-4'>
            <h1 className='font-bold text-5xl text-gray-800'>
              Under Maintenance
            </h1>
            
            <p className='text-gray-500'>
              Tim kami sedang meng-upgrade sistem. 
              Sambil nunggu, main Tetris dulu di samping!
            </p>
          </div>
          
          <Link 
            href='/' 
            className='inline-block mt-8 px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium'
          >
            ← Back to Home
          </Link>
          
          <div className='text-sm text-gray-400 pt-4'>
            <span className='inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2'></span>
            Sistem dalam perbaikan
          </div>
        </div>
      </div>

      {/* Right side - Tetris Game (50%) - SEKARANG DI KANAN */}
      <div className='w-1/2 bg-gray-900 flex items-center justify-center p-8'>
        <div className='bg-gray-800 p-6 rounded-xl shadow-2xl'>
          <div className='flex gap-6'>
            {/* Main Board */}
            <div>
              <div className='grid grid-cols-10 gap-0.5 bg-black p-2 rounded'>
                {board.map((row, i) => 
                  row.map((cell: number, j: number) => {
                    let isCurrentPiece = false;
                    if (currentPiece && isPlaying && !gameOver) {
                      for (let r = 0; r < currentPiece.shape.length; r++) {
                        for (let c = 0; c < currentPiece.shape[0].length; c++) {
                          if (currentPiece.shape[r][c] !== 0 && 
                              position.y + r === i && 
                              position.x + c === j) {
                            isCurrentPiece = true;
                          }
                        }
                      }
                    }
                    
                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-sm ${
                          isCurrentPiece || cell
                            ? 'bg-white' 
                            : 'bg-gray-900'
                        } transition-colors duration-150`}
                      ></div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Next Piece & Score */}
            <div className='flex flex-col gap-4'>
              <div className='bg-black p-3 rounded'>
                <div className='text-xs text-gray-400 mb-2'>NEXT</div>
                <div className='grid grid-cols-4 gap-0.5'>
                  {nextPiece && Array(4).fill(0).map((_, row) => 
                    Array(4).fill(0).map((_, col) => (
                      <div
                        key={`next-${row}-${col}`}
                        className={`w-4 h-4 rounded-sm ${
                          nextPiece.shape[row]?.[col] 
                            ? 'bg-white' 
                            : 'bg-gray-900'
                        }`}
                      ></div>
                    ))
                  )}
                </div>
              </div>
              
              <div className='bg-black p-3 rounded text-white'>
                <div className='text-xs text-gray-400'>SCORE</div>
                <div className='text-xl font-bold'>{score}</div>
              </div>
              
              {!isPlaying && !gameOver && (
                <button
                  onClick={startGame}
                  className='bg-white hover:bg-gray-200 text-gray-900 px-4 py-2 rounded text-sm transition-colors font-medium'
                >
                  Main Tetris 🎮
                </button>
              )}
              
              {gameOver && (
                <div className='bg-black p-3 rounded text-center'>
                  <div className='text-white text-sm mb-2'>Game Over!</div>
                  <button
                    onClick={startGame}
                    className='bg-white hover:bg-gray-200 text-gray-900 px-3 py-1 rounded text-xs transition-colors font-medium'
                  >
                    Main Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls Info */}
          {isPlaying && (
            <div className='mt-4 text-xs text-gray-400 flex gap-3 justify-center'>
              <span>← → : Gerak</span>
              <span>↓ : Cepet</span>
              <span>↑ : Putar</span>
              <span>Spasi : Drop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  console.log('err', err);
  console.log('res', res);
  
  const isMaintenanceMode = true; // Ganti sesuai kebutuhan
  
  if (isMaintenanceMode) {
    if (res) {
      res.statusCode = 503;
    }
    return { statusCode: 503 };
  }
  
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;