import { useEffect, useState } from "react";
import { getLibrary } from "../../../api/library";
import type { LibraryGame } from "../../../types/library";
import "./LibrarySidebar.css";

function LibrarySidebar(){
    const [games, setGames] = useState<LibraryGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(()=>{
        let isActive = true;
        async function loadGames() {
            try{
                setIsLoading(true);
                setError(null);

                const result = await getLibrary({
                    sort: "recent",
                    page: "1",
                    pageSize: 100,
                });
                if(isActive){
                    setGames(result.items);
                }
            }catch(err){
                if(isActive){
                    console.error("Не вдалося завантажити бібліотеку:", err);
                    setError("Не вдалося завантажити ігри.");
                }
            }finally{
                if(isActive){
                    setIsLoading(false);
                }
            }
        }
        void loadGames();
        return () =>{
            isActive = false;
        };
    }, []);
    return(
        <aside className="library-sidebar">
            <div className="library-sidebar__heading">
                <span>Усі ігри</span>
                <span className="library-sidebar__count" aria-label={`Кількість ігор: ${games.length}`}>{games.length}</span>
            </div>
            {isLoading ? (
                <p className="library-sidebar__message">
                    Завантаження...
                </p>
            ): error ? (
                <p className="library-sidebar__message library-sidebar__message--error">
                    {error}
                </p>
            ) : games.length === 0 ? (
                <p className="library-sidebar__message">
                    Бібліотека поки порожня.
                </p>
            ) : (
                <ul className="library-sidebar__list">
                    {games.map((game)=>(
                        <li key={game.gameId}>
                            <a className="library-sidebar__game"
                            href={`/library/game/${encodeURIComponent(game.gameId)}`}
                            title={game.title}>
                                <img className="library-sidebar__cover"
                                    src={game.coverImage}
                                    alt=""
                                    loading="lazy"
                                />
                                <span className="library-sidebar__game-title">
                                    {game.title}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    )
}
export default LibrarySidebar;