import { useEffect, useState, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import RotaBoard from '../games/rota/RotaBoard';
import RotaLobby from '../games/rota/RotaLobby';
import { Loader, Copy, Check } from 'lucide-react';

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
            alert('Opponent disconnected! You win by default.');
            setStatus('idle');
            setRoomId(null);
            setGameState(null);
            setGameMode(null);
        });

        socket.on('move_error', (err) => {
            console.error("Move Error:", err);
        });

        socket.on('room_created', ({ roomId }) => {
            setPrivateRoomCode(roomId);
            setStatus('waiting_private');
        });

        socket.on('join_error', (msg) => {
            alert(msg);
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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(privateRoomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Render Logic ---

    // 1. Lobby
    if (!gameMode) {
        return <RotaLobby onSelectMode={handleSelectMode} onJoinPrivate={handleJoinPrivate} />;
    }

    // 2. Searching / Waiting States
    if (status === 'searching' || status === 'creating') {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader className="w-8 h-8 text-cyan-500 animate-pulse" />
                    </div>
                </div>
                <h2 className="mt-8 text-2xl font-bold text-white tracking-widest animate-pulse">
                    {status === 'searching' ? 'SEARCHING FOR OPPONENT...' : 'CREATING SECURE ROOM...'}
                </h2>
                <p className="text-slate-500 mt-2">
                    {status === 'searching' ? 'Scanning network for agents' : 'Encrypting connection'}
                </p>
                <button 
                    onClick={() => { setStatus('idle'); setGameMode(null); }}
                    className="mt-8 text-slate-500 hover:text-white underline"
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (status === 'waiting_private') {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-white mb-8">Waiting for Opponent</h2>
                
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
                    <p className="text-slate-400 mb-4 uppercase tracking-widest text-sm">Room Code</p>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-5xl font-mono font-bold text-cyan-400 tracking-widest">
                            {privateRoomCode}
                        </span>
                        <button 
                            onClick={handleCopyCode}
                            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-slate-400" />}
                        </button>
                    </div>
                    <p className="text-slate-500 text-sm">
                        Share this code with your friend to start the match.
                    </p>
                </div>

                <button 
                    onClick={() => { setStatus('idle'); setGameMode(null); }}
                    className="mt-12 text-slate-500 hover:text-white underline"
                >
                    Cancel
                </button>
            </div>
        );
    }

    // 3. Game Board (CPU or Online)
    return (
        <div className="h-full flex flex-col p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-900/50 rounded-lg flex items-center justify-center border border-cyan-500/30">
                        <span className="text-cyan-400 font-bold">YOU</span>
                    </div>
                    <div>
                        <p className="font-bold text-white">{user.username}</p>
                        <p className="text-xs text-slate-400">
                            Playing as {gameMode === 'online' ? gameState?.players[socket.id] : 'X'}
                        </p>
                    </div>
                </div>

                <div className="text-2xl font-black text-slate-700">VS</div>

                <div className="flex items-center gap-3 text-right">
                    <div>
                        <p className="font-bold text-white">
                            {gameMode === 'online' 
                                ? (Object.entries(players).find(([id]) => id !== socket.id)?.[1] || 'Opponent')
                                : 'System AI'
                            }
                        </p>
                        <p className="text-xs text-slate-400">
                            {gameMode === 'online' ? 'Enemy Agent' : 'Level 1'}
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <span className="text-purple-400 font-bold">OPP</span>
                    </div>
                </div>
            </div>

            {/* Game Board */}
            <div className="flex-1 flex items-center justify-center">
                <RotaBoard 
                    mode={gameMode}
                    gameState={gameState} 
                    playerId={gameMode === 'online' ? socket.id : user._id} 
                    onMove={handleMove}
                    onGameOver={(w) => {
                        setWinner(w);
                        setStatus('game_over');
                    }}
                />
            </div>

            {/* Game Over Actions */}
            {(status === 'game_over' || winner) && (
                <div className="text-center mt-8">
                    <button 
                        onClick={() => {
                            setStatus('idle');
                            setGameMode(null);
                            setWinner(null);
                            setGameState(null);
                            setRoomId(null);
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Return to Lobby
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameRoom;
