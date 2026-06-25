import type { MoveListProps } from "../types/moves"

function MoveList({ moves }: MoveListProps){

    console.log(moves)
    return(<div className="p-4 min-w-64">
        <ul className="flex flex-wrap gap-2">
            {moves.map((move, index) =>(
                <li key={index}>{move}</li>
            ))}
        </ul>
        
    </div>)

}

export default MoveList