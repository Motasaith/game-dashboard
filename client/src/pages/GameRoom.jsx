import { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import RotaBoard from '../games/rota/RotaBoard';
import RotaLobby from '../games/rota/RotaLobby';
import { Loader, Copy, Check, LogOut } from 'lucide-react';

const GameRoom = () => {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    
    const [gameMode, setGameMode] = useState(null); // null, 'cpu', 'online'
    const [status, setStatus] = useState('idle'); // idle, searching, playing, game_over, waiting_private
    const [roomId, setRoomId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [players, setPlayers] = useState({});
    const [winner, setWinner] = useState(null);
    const [privateRoomCode, setPrivateRoomCode] = useState(null);
    const [notification, setNotification] = useState(null); // { message, type: 'info' | 'error' | 'success' }
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!socket) return;

        // Listeners
        socket.on('game_start', (data) => {
            setRoomId(data.roomId);
            setPlayers(data.players);
            setGameState(data.gameState);
            setStatus('playing');
        });

        socket.on('game_update', (newState) => {
            setGameState(newState);
        });

        socket.on('game_over', (data) => {
            setWinner(data.winner);
            setStatus('game_over');
        });

        socket.on('opponent_disconnected', () => {
            setNotification({ message: 'Opponent disconnected! You win by default.', type: 'success' });
            setStatus('idle');
            setRoomId(null);
            setGameState(null);
            setGameMode(null);
        });

        socket.on('move_error', (err) => {
            console.error("Move Error:", err);
            setNotification({ message: err, type: 'error' });
        });

        socket.on('room_created', ({ roomId }) => {
            setPrivateRoomCode(roomId);
            setStatus('waiting_private');
        });

        socket.on('join_error', (msg) => {
            setNotification({ message: msg, type: 'error' });
            setStatus('idle');
        });

        // Cleanup
        return () => {
            socket.off('game_start');
            socket.off('game_update');
            socket.off('game_over');
            socket.off('opponent_disconnected');
            socket.off('move_error');
            socket.off('room_created');
            socket.off('join_error');
        };
    }, [socket]);

    const handleSelectMode = (mode) => {
        if (mode === 'cpu') {
            setGameMode('cpu');
            setStatus('playing');
        } else if (mode === 'online') {
            setGameMode('online');
            setStatus('searching');
            socket.emit('join_rota_queue', { username: user.username });
        } else if (mode === 'create_private') {
            setGameMode('online');
            setStatus('creating');
            socket.emit('create_private_room', { username: user.username });
        }
    };

    const handleJoinPrivate = (code) => {
        setGameMode('online');
        setStatus('searching'); // Temporary state while joining
        socket.emit('join_private_room', { roomId: code, user: { username: user.username } });
    };

    const handleMove = (move) => {
        if (gameMode === 'online' && socket && roomId) {
            socket.emit('rota_move', { roomId, move });
        }
    };

    const handleLeaveMatchClick = () => {
        if (status === 'game_over') {
            confirmLeaveMatch(); // No confirmation needed if game is already over
        } else {
            setShowLeaveConfirm(true);
        }
    };

    const confirmLeaveMatch = () => {
        if (gameMode === 'online' && socket && roomId) {
            socket.emit('leave_match', { roomId });
        }
        setStatus('idle');
        setGameMode(null);
        setRoomId(null);
        setGameState(null);
        setWinner(null);
        setShowLeaveConfirm(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(privateRoomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Render Logic ---

    // Notification Popup
    const renderNotification = () => {
        if (!notification) return null;
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200">
                    <h3 className={`text-xl font-bold mb-2 ${notification.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                        {notification.type === 'error' ? 'System Alert' : 'Notification'}
                    </h3>
                    <p className="text-slate-300 mb-6">{notification.message}</p>
                    <button 
                        onClick={() => setNotification(null)}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        );
    };

    // Leave Confirmation Modal
    const renderLeaveConfirmation = () => {
        if (!showLeaveConfirm) return null;
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl transform scale-100 animate-in fade-in zoom-in duration-200">
                    <h3 className="text-xl font-bold text-white mb-2">Leave Match?</h3>
                    <p className="text-slate-300 mb-6">Are you sure you want to leave? This will forfeit the match.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowLeaveConfirm(false)}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmLeaveMatch}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
                        >
                            Yes, Leave
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 1. Lobby
    if (!gameMode) {
        return (
            <>
                {renderNotification()}
                <RotaLobby onSelectMode={handleSelectMode} onJoinPrivate={handleJoinPrivate} />
            </>
        );
    }

    // 2. Searching / Waiting States
    if (status === 'searching' || status === 'creating') {
        return (
            <div className="h-full flex flex-col items-center justify-center relative text-center px-4">
                {renderNotification()}
                <div className="relative">
                    <div className="w-16 h-16 md:w-24 md:h-24 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
                </div>
                <h2 className="mt-6 md:mt-8 text-xl md:text-2xl font-bold text-white tracking-widest animate-pulse">
                    {status === 'searching' ? 'SEARCHING FOR OPPONENT...' : 'CREATING SECURE ROOM...'}
                </h2>
                <p className="text-sm md:text-base text-slate-500 mt-2">
                    {status === 'searching' ? 'Scanning network for agents' : 'Encrypting connection'}
                </p>
                <button 
                    onClick={() => { setStatus('idle'); setGameMode(null); }}
                    className="mt-6 md:mt-8 text-slate-500 hover:text-white underline text-sm md:text-base"
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (status === 'waiting_private') {
        return (
            <div className="h-full flex flex-col items-center justify-center relative px-4">
                {renderNotification()}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">Waiting for Opponent</h2>
                
                <div className="bg-slate-900 p-4 md:p-8 rounded-2xl border border-slate-800 text-center w-full max-w-md">
                    <p className="text-slate-400 mb-2 md:mb-4 uppercase tracking-widest text-xs md:text-sm">Room Code</p>
                    <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-6">
                        <span className="text-3xl md:text-5xl font-mono font-bold text-cyan-400 tracking-widest truncate">
                            {privateRoomCode}
                        </span>
                        <button 
                            onClick={handleCopyCode}
                            className="p-2 md:p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex-shrink-0"
                        >
                            {copied ? <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500" /> : <Copy className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />}
                        </button>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm">
                        Share this code with your friend to start the match.
                    </p>
                </div>

                <button 
                    onClick={() => { setStatus('idle'); setGameMode(null); }}
                    className="mt-8 md:mt-12 text-slate-500 hover:text-white underline text-sm md:text-base"
                >
                    Cancel
                </button>
            </div>
        );
    }

    // 3. Game Board (CPU or Online)
    const isMyTurn = gameMode === 'online' 
        ? gameState?.turn === socket.id 
        : gameState?.turn === 'player';

    return (
        <div className="min-h-full flex flex-col p-2 md:p-4 overflow-y-auto relative">
            {renderNotification()}
            {renderLeaveConfirmation()}
            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:mb-8 bg-slate-900/50 p-2 md:p-4 rounded-xl border border-slate-800 text-sm md:text-base">
                <div className={`flex items-center gap-2 md:gap-3 transition-opacity ${isMyTurn ? 'opacity-100' : 'opacity-50'} flex-1 min-w-0`}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${isMyTurn ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_15px_#06b6d4]' : 'bg-cyan-900/50 text-cyan-400 border-cyan-500/30'}`}>
                        <span className="font-bold text-[10px] md:text-base">YOU</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white truncate text-xs md:text-base">{user.username}</p>
                        <p className="text-[10px] md:text-xs text-slate-400 truncate">
                            {gameMode === 'online' ? gameState?.players[socket.id] : 'X'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center px-2 md:px-4 flex-shrink-0">
                    <div className="text-lg md:text-2xl font-black text-slate-700">VS</div>
                    {status === 'playing' && !winner && (
                        <div className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-full mt-1 whitespace-nowrap ${isMyTurn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isMyTurn ? "YOUR TURN" : "OPPONENT"}
                        </div>
                    )}
                </div>

                <div className={`flex items-center justify-end gap-2 md:gap-3 text-right transition-opacity ${!isMyTurn ? 'opacity-100' : 'opacity-50'} flex-1 min-w-0`}>
                    <div className="min-w-0">
                        <p className="font-bold text-white truncate text-xs md:text-base">
                            {gameMode === 'online' 
                                ? (Object.entries(players).find(([id]) => id !== socket.id)?.[1] || 'Opponent')
                                : 'System AI'
                            }
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 truncate">
                            {gameMode === 'online' ? 'Enemy' : 'Lvl 1'}
                        </p>
                    </div>
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${!isMyTurn ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_#a855f7]' : 'bg-purple-900/50 text-purple-400 border-purple-500/30'}`}>
                        <span className="font-bold text-[10px] md:text-base">OPP</span>
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="flex-1 flex items-center justify-center w-full relative">
                <RotaBoard 
                    key={gameMode} // Force reset when mode changes
                    mode={gameMode}
                    gameState={gameState} 
                    playerId={gameMode === 'online' ? socket.id : user._id} 
                    onMove={handleMove}
                    onStateChange={(localState) => {
                        if (gameMode === 'cpu') {
                            setGameState(localState);
                        }
                    }}
                    onGameOver={(w) => {
                        setWinner(w);
                        setStatus('game_over');
                    }}
                />
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-center">
                {(status === 'playing' || status === 'game_over') && (
                    <button 
                        onClick={handleLeaveMatchClick}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-bold"
                    >
                        <LogOut className="w-4 h-4" />
                        {status === 'game_over' ? 'Return to Lobby' : 'Leave Match'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameRoom;
