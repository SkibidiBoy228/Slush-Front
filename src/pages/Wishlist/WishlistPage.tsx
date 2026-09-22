import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSearch from "../../components/GameSearch/GameSearch";
import{
    addToCart,
    getWishlist,
    removeFromWishlist,
    type StoreItem,
} from "../../api/store";
import { formatPrice } from "../../utils/price";
import "./WishlistPage.css"

function WishlistPage(){
    const [games,setGames] = useState<StoreItem[]>([]);
    const [loading,setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [maxPrice, setMaxPrice] = useState("all");
    const [sort, setSort] = useState("discount");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(()=>{
        const loadWishlist = async () =>{
            try{
                const data = await getWishlist();
                setGames(data);
            }catch(error){
                console.error("Не вдалося завантажити обране:", error);
            }finally{
                setLoading(false);
            }
        };
        loadWishlist();
    }, []);

    const filteredGames = useMemo(()=>{
        let result = [...games];

        if(search.trim()){
            result = result.filter((game)=>game.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        if(maxPrice !== "all"){
            const priceLimit = Number(maxPrice);
            result = result.filter((game)=>game.price <=priceLimit);
        }
        if(sort === "priceAsc"){
            result.sort((a,b) => a.price - b.price);
        }
        if(sort === "priceDesc"){
            result.sort((a,b)=>b.price - a.price);
        }
        if(sort==="name"){
            result.sort((a,b) => a.title.localeCompare(b.title));
        }
        return result;
    }, [games,search,maxPrice,sort]);

    const resetFilters = () =>{
        setSearch("");
        setMaxPrice("all");
        setSort("discount");
    };

    const handleRemove = async(gameId:string) =>{
        setProcessingId(gameId);
        try{
            await removeFromWishlist(gameId);
            setGames((previous)=>previous.filter((game)=> game.gameId !==gameId));
        }catch(error){
            console.error("Не вдалося видалити гру:", error);
            alert("Не вдалося видалити гру з обраного.");
        }finally{
            setProcessingId(null);
        }
    };
    const handleAddToCart = async(game:StoreItem)=>{
        setProcessingId(game.gameId);
        try{
            await addToCart({
                gameId: game.gameId,
                title: game.title,
                imageUrl: game.imageUrl,
                price: game.price,
            });
            alert("Гру додано до кошика.");
        }catch(error){
            console.error("Не вдалося додати гру до кошика:", error);
            alert("Не вдалося додати гру до кошика");
        }finally{
            setProcessingId(null);
        }
    };
    return(
        <div className="wishlist-layout">
            <Header/>
            <div className="store-search-wrapper">
                    <GameSearch />
            </div>

            <main className="wishlist-page">
                <h1>Мій список бажаного</h1>
                <div className="wishlist-content">
                    <aside className="wishlist-filters">
                        <div className="filters-heading">
                            <h2>Фільтри</h2>
                            <button onClick={resetFilters}>Скинути</button>
                        </div>
                        <div className="filter-group">
                            <label>Пошук тегів</label>
                            <button className="filter-select">Будь-які теги ⌄</button>
                        </div>
                        <div className="filter-group">
                            <label>Жанр</label>
                            <button className="filter-select">Усі жанри ⌄</button>
                        </div>
                        <div className="filter-group">
                            <label>Ціна</label>
                            {[
                                ["0", "Безкоштовно"],
                                ["100", "До 100 гривень"],
                                ["300", "До 300 гривень"],
                                ["600", "До 600 гривень"],
                                ["900", "До 900 гривень"],
                                ["all", "Без обмежень"],
                            ].map(([value,label])=>(
                                <label className="radio-option" key = {value}>
                                    <input type="radio"
                                    name="price"
                                    checked = {maxPrice === value}
                                    onChange={()=> setMaxPrice(value)}/>
                                    {label}
                                </label>
                            ))}
                        </div>
                        {[
                        ["Знижки", "Усі знижки⌄"],
                        ["Тип", "Усі типи⌄"],
                        ["Особливості", "Усі особливості⌄"],
                        ["Платформа", "Усі платформи⌄"],
                        ["Івенти", "Усі івенти⌄"],
                        ].map(([label, value])=>(
                            <div className="filter-group" key={label}>
                                <label>{label}</label>
                                <button className="filter-select">{value}</button>
                            </div>
                        ))}
                    </aside>
                    <section className="wishlist-results">
                        <div className="wishlisht-toolbar">
                            <input type="text"
                            placeholder="Пошук у бажаному..."
                            value={search}
                            onChange={(event)=> setSearch(event.target.value)}
                            />
                            <label>
                                Сортування:
                                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                                    <option value="discount">Спочатку знижки</option>
                                    <option value = "priceAsc">Спочатку дешевші</option>
                                    <option value= "priceDesc">Спочатку дорожчі</option>
                                    <option value = "name">За назвою</option>
                                </select>
                            </label>
                        </div>
                        {loading ? (
                            <p className="wishlist-message">Завантаження...</p>
                        ): filteredGames.length === 0 ? (
                            <p className="wishlist-message">У списку бажаного поки немає ігор.</p>
                        ):(
                            <div className="wishlist-list">
                                {filteredGames.map((game)=>(
                                    <article className="wishlist-card" key={game.gameId}>
                                        <img src = {game.imageUrl} alt = {game.title} className="wishlist-card-image"/>
                                        <div className="wishlist-card-details">
                                            <h2>{game.title}</h2>
                                            <div className="wishlist-card-rating">
                                                ★ <span>—</span>
                                            </div>
                                            <div className="wishlist-card-bottom">
                                                <strong>{formatPrice(game.price)}</strong>
                                                <button className="wishlist-cart-button"
                                                    onClick={()=>handleAddToCart(game)}
                                                    disabled = {processingId === game.gameId}
                                                >
                                                    {processingId === game.gameId ? "Зачекайте..." : "У кошик"} 
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            className="wishlist-remove-button"
                                            onClick={() => handleRemove(game.gameId)}
                                            disabled={processingId === game.gameId}
                                            aria-label={`Видалити ${game.title} з обраного`}
                                            >
                                            ×
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <Footer />

        </div>
    )
}
export default WishlistPage;