import { useEffect, useState } from "react";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSearch from "../../components/GameSearch/GameSearch";

import {
  addToWishlist,
  clearCart,
  getCart,
  removeFromCart,
  type StoreItem,
} from "../../api/store";

import { formatPrice } from "../../utils/price";
import "./CartPage.css";

function CartPage(){
    const [games, setGames] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(()=>{
        const loadCart = async ()=>{
            try{
                const data = await getCart();
                setGames(data);
            }catch(error){
                console.error("Не вдалося заванатажити кошик:", error);
            }finally{
                setLoading(false);
            }
        };
        loadCart();
    }, []);

    const handleRemove = async(gameId: string) =>{
        setProcessingId(gameId);
        try{
            await removeFromCart(gameId);
            setGames((previous)=>previous.filter((game)=>game.gameId !== gameId));
        }catch(error){
            console.error("НЕ вдалося видалити гру:", error);
            alert("Не вдалося видалити гру з кошика");
        }finally{
            setProcessingId(null);
        }
    };
    const handleMoveToWishlish = async (game: StoreItem) =>{
        setProcessingId(game.gameId);
        try{
            await addToWishlist({
                gameId: game.gameId,
                title: game.title,
                imageUrl: game.imageUrl,
                price: game.price,
            });
            await removeFromCart(game.gameId);
            setGames((previous)=>previous.filter((item)=>item.gameId !==game.gameId));
        }catch(error){
            console.error("Не вдалося перемістити гру:",error);
            alert("Не вдалося перемістити гру до бажаного.");
        }finally{
            setProcessingId(null);
        };
    }

    const handleClearCart = async() =>{
        if (games.length === 0) return;
        setIsClearing(true);
        try{
            await clearCart();
            setGames([]);
        }catch(error){
            console.error("Не вдалося очистити кошик:", error);
            alert("Не вдалося очистити кошик.");
        }finally{
            setIsClearing(false);
        }
    }
    const totalPrice = games.reduce((sum,game)=>sum + game.price, 0);

    return (
        <div className="cart-layout">
            <Header/>
            <div className="store-search-wrapper">
                <GameSearch/>
            </div>
            <main className="cart-page">
                <h1>Мій кошик</h1>
                {loading ? (
                    <p className="cart-message">Завантаження...</p>
                ): (
                    <div className="cart-content">
                        <section className="cart-products">
                            {games.length === 0 ? (
                                <p className="cart-message">Ваш кошик порожній...</p>
                            ): (
                                games.map((game)=>(
                                    <article className="cart-card" key = {game.gameId}>
                                        <img src = {game.imageUrl}
                                            alt= {game.title}
                                            className="cart-card-image"/>
                                            <div className="cart-card-info">
                                                <h2>{game.title}</h2>
                                                <button className="move-to-wishlist"
                                                    onClick={()=>handleMoveToWishlish(game)}
                                                    disabled = {processingId === game.gameId}
                                                    >
                                                        Перемістити до Бажаного
                                                    </button>
                                            </div>
                                            <strong className="cart-card-price">
                                                {formatPrice(game.price)}
                                            </strong>
                                            <button className="cart-remove-button"
                                                onClick={()=>handleRemove(game.gameId)}
                                                disabled={processingId === game.gameId}
                                                aria-label = {`Видалити ${game.title} з кошика`}>
                                                     ×
                                                </button>
                                    </article>
                                ))
                            )}
                        </section>
                        <aside className="cart-summary">
                            <div className="summary-row">
                                <span>Ви заощадите</span>
                                <strong>0 ₴</strong>
                            </div>
                            <div className="summary-row summary-total">
                                <span>Усього</span>
                                <strong>{formatPrice(totalPrice)}</strong>
                            </div>

                            <p className="summary-note">
                                Якщо застосовно, податок із продажу буде розраховано в процесі
                                оплати.
                            </p>
                             <button
                                className="checkout-button"
                                disabled={games.length === 0}
                            >
                                Перейти до оплати
                            </button>

                            <button
                                className="continue-button"
                                onClick={() => {
                                window.location.href = "/catalog";
                                }}
                            >
                                Продовжити покупки
                            </button>
                            <button className="clear-cart-button"
                                onClick={handleClearCart}
                                disabled = {isClearing || games.length === 0}>
                                    {isClearing ? "Очищення..." : "Очистити кошик"}
                                </button>
                        </aside>
                    </div>
                )}
            </main>
            <Footer/>
        </div>
    )
}
export default CartPage;