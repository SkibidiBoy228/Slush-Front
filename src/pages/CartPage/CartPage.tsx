import { useEffect, useMemo, useState } from "react";
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
import "./CartPage.css";

export default function CartPage() {
    const [cart, setCart] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    async function loadCart() {
        try {
            setLoading(true);

            const data = await getCart();

            setCart(data);
        } catch (error) {
            console.error("Помилка завантаження кошика:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(gameId: string) {
        try {
            await removeFromCart(gameId);

            setCart((prev) =>
                prev.filter((game) => game.gameId !== gameId)
            );
        } catch (error) {
            console.error("Помилка видалення з кошика:", error);
        }
    }

    async function handleMoveToWishlist(game: StoreItem) {
        try {
            await addToWishlist({
                gameId: game.gameId,
                title: game.title,
                imageUrl: game.imageUrl,
                price: game.price,
            });

            await removeFromCart(game.gameId);

            setCart((prev) =>
                prev.filter((item) => item.gameId !== game.gameId)
            );
        } catch (error) {
            console.error(
                "Помилка переміщення в обране:",
                error
            );
        }
    }

    async function handleClearCart() {
        try {
            await clearCart();

            setCart([]);
        } catch (error) {
            console.error("Помилка очищення кошика:", error);
        }
    }

    const total = useMemo(() => {
        return cart.reduce(
            (sum, game) => sum + game.price,
            0
        );
    }, [cart]);



    const savings = 0;

    return (
        <div className="cart-page">
            <Header />
                <div className="store-panel">
                    <GameSearch />
                </div>


            <main className="cart-content">
                <h1>Мій кошик</h1>

                <div className="cart-layout">
                    <section className="cart-items">
                        {loading ? (
                            <div className="cart-empty">
                                Завантаження...
                            </div>
                        ) : cart.length === 0 ? (
                            <div className="cart-empty">
                                Ваш кошик порожній...
                            </div>
                        ) : (
                            cart.map((game) => (
                                <article
                                    className="cart-item"
                                    key={game.gameId}
                                >
                                    <img
                                        src={game.imageUrl}
                                        alt={game.title}
                                    />

                                    <div className="cart-item-info">
                                        <h3>{game.title}</h3>

                                        <strong>
                                            {game.price.toLocaleString(
                                                "uk-UA"
                                            )}{" "}
                                            ₴
                                        </strong>
                                    </div>

                                    <div className="cart-item-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMoveToWishlist(
                                                    game
                                                )
                                            }
                                        >
                                            ♡
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(
                                                    game.gameId
                                                )
                                            }
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>

                    <aside className="cart-summary">
                        <div className="summary-row">
                            <span>Ви заощадите</span>

                            <strong>
                                {savings.toLocaleString("uk-UA")} ₴
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>Усього</span>

                            <strong>
                                {cart.length === 0
                                    ? "Безкоштовно"
                                    : `${total.toLocaleString(
                                          "uk-UA"
                                      )} ₴`}
                            </strong>
                        </div>

                        <p className="summary-note">
                            Якщо застосовано, податок і продажу буде
                            розраховано в процесі оплати.
                        </p>

                        <button
                            className="checkout-button"
                            type="button"
                            disabled={cart.length === 0}
                        >
                            Перейти до оплати
                        </button>

                        <button
                            className="continue-button"
                            type="button"
                            onClick={() => {
                                window.location.href = "/";
                            }}
                        >
                            Продовжити покупки
                        </button>

                        <button
                            className="clear-cart-button"
                            type="button"
                            disabled={cart.length === 0}
                            onClick={handleClearCart}
                        >
                            Очистити кошик
                        </button>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}