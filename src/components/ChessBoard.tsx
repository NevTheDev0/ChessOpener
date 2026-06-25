import { useEffect, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import type { PieceDropHandlerArgs } from 'react-chessboard';
import { Chess } from 'chess.js'
import MoveList from './MoveList';

function Board(){
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current

    const [chessPosition, setChessPosition] = useState(chessGame.fen());
    const [loading, setLoading] = useState(false);
    const [opening, setOpening] = useState(null)
    const [moves, setMoves] = useState<any[]>([])

    function pickOpeningMove(movesList: any[]) {
        if (!movesList.length) return null;

        const sorted = [...movesList].sort(
            (a, b) => (b.white + b.black + b.draws) - (a.white + a.black + a.draws)
        );

        return sorted[0]?.uci || null;
    }

    useEffect(() => {
        async function fetchOpening() {
            const token = import.meta.env.VITE_LICHESS_TOKEN;
            setLoading(true)

            try{
                const res = await fetch(
                    `https://explorer.lichess.org/lichess?fen=${encodeURIComponent(chessPosition)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await res.json();

                console.log("Lichess Explorer response:", data);

                setOpening(data.opening);
                setMoves(data.moves || []);

              
                if (chessGame.turn() === 'b') {
                    const botMove = pickOpeningMove(data.moves || []);

                    if (botMove) {
                        setTimeout(() => {
                            chessGame.move(botMove);
                            setChessPosition(chessGame.fen());
                        }, 400);
                    }
                }

            }
            finally{
                setLoading(false)
            }
        }

        fetchOpening();
    }, [chessPosition]);

    function onPieceDrop({sourceSquare, targetSquare}: PieceDropHandlerArgs){
        if (!targetSquare){
            return false
        }

        try{
            const move = chessGame.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            if (!move) return false;

            setChessPosition(chessGame.fen());

            return true;
        }

        catch{
            return false
        }
    }

    return(
        <div className="flex gap-4 items-start"> 
            <Chessboard
                options={{
                    position: chessPosition,
                    onPieceDrop,
                    id: 'play-vs-random'
                }}
            />

            <MoveList moves={chessGame.history()}/>
        </div>
    )
}

export default Board