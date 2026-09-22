import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GameSearch from "../../components/GameSearch/GameSearch";
import {
    addToCart,
    getWishlist,
    removeFromWishlist,
    type StoreItem,
} from "../../api/store";
import "./WishlistPage.css";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("discount");

    useEffect(() => {
        loadWishlist();
    }, []);

    async function loadWishlist() {
        try {
            setLoading(true);

            const data = await getWishlist();

            setWishlist(data);
        } catch (error) {
            console.error("Помилка завантаження обраного:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(gameId: string) {
        try {
            await removeFromWishlist(gameId);

            setWishlist((prev) =>
                prev.filter((game) => game.gameId !== gameId)
            );
        } catch (error) {
            console.error("Помилка видалення з обраного:", error);
        }
    }

    async function handleAddToCart(game: StoreItem) {
        try {
            await addToCart({
                gameId: game.gameId,
                title: game.title,
                imageUrl: game.imageUrl,
                price: game.price,
            });

            await removeFromWishlist(game.gameId);

            setWishlist((prev) =>
                prev.filter((item) => item.gameId !== game.gameId)
            );
        } catch (error) {
            console.error("Помилка додавання в кошик:", error);
        }
    }

    const filteredWishlist = useMemo(() => {
        let result = [...wishlist];

        if (search.trim()) {
            const query = search.toLowerCase();

            result = result.filter((game) =>
                game.title.toLowerCase().includes(query)
            );
        }

        if (sort === "price-asc") {
            result.sort((a, b) => a.price - b.price);
        }

        if (sort === "price-desc") {
            result.sort((a, b) => b.price - a.price);
        }

        if (sort === "name") {
            result.sort((a, b) =>
                a.title.localeCompare(b.title)
            );
        }

        return result;
    }, [wishlist, search, sort]);

    return (
        <div className="wishlist-page">
            <Header />

                <div className="store-panel">
                    <GameSearch />
                </div>

            <main className="wishlist-content">
                <h1>Мій список бажаного</h1>

                <div className="wishlist-layout">
                    <aside className="wishlist-filters">
                        <div className="filters-header">
                            <strong>Фільтри</strong>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSort("discount");
                                }}
                            >
                                Скинути
                            </button>
                        </div>

                        <label>Пошук тегів</label>

                        <select>
                            <option>Будь-які теги</option>
                        </select>

                        <div className="filter-divider" />

                        <label>Жанр</label>

                        <select>
                            <option>Усі жанри</option>
                        </select>

                        <div className="filter-divider" />

                        <label>Ціна</label>

                        <div className="price-options">
                            <label>
                                <input type="radio" name="price" />
                                Безкоштовно
                            </label>

                            <label>
                                <input type="radio" name="price" />
                                До 100 гривень
                            </label>

                            <label>
                                <input type="radio" name="price" />
                                До 300 гривень
                            </label>

                            <label>
                                <input type="radio" name="price" />
                                До 600 гривень
                            </label>

                            <label>
                                <input type="radio" name="price" />
                                До 900 гривень
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    defaultChecked
                                />
                                Без обмежень
                            </label>
                        </div>

                        <div className="filter-divider" />

                        <label>Знижки</label>

                        <select>
                            <option>Усі знижки</option>
                        </select>

                        <div className="filter-divider" />

                        <label>Тип</label>

                        <select>
                            <option>Усі типи</option>
                        </select>

                        <div className="filter-divider" />

                        <label>Особливості</label>

                        <select>
                            <option>Усі особливості</option>
                        </select>

                        <div className="filter-divider" />

                        <label>Платформа</label>

                        <select>
                            <option>Усі платформи</option>
                        </select>
                    </aside>

                    <section className="wishlist-results">
                        <div className="wishlist-toolbar">
                            <input
                                type="text"
                                placeholder="Пошук у бажаному..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            <label>
                                Сортування:

                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        setSort(e.target.value)
                                    }
                                >
                                    <option value="discount">
                                        Спочатку знижки
                                    </option>

                                    <option value="price-asc">
                                        Ціна: від низької
                                    </option>

                                    <option value="price-desc">
                                        Ціна: від високої
                                    </option>

                                    <option value="name">
                                        За назвою
                                    </option>
                                </select>
                            </label>
                        </div>

                        {loading ? (
                            <div className="wishlist-empty">
                                Завантаження...
                            </div>
                        ) : filteredWishlist.length === 0 ? (
                            <div className="wishlist-empty">
                                У списку бажаного поки немає ігор.
                            </div>
                        ) : (
                            <div className="wishlist-games">
                                {filteredWishlist.map((game) => (
                                    <article
                                        className="wishlist-game"
                                        key={game.gameId}
                                    >
                                        <img
                                            src={game.imageUrl}
                                            alt={game.title}
                                        />

                                        <div className="wishlist-game-info">
                                            <h3>{game.title}</h3>

                                            <strong>
                                                {game.price.toLocaleString(
                                                    "uk-UA"
                                                )}{" "}
                                                ₴
                                            </strong>
                                        </div>

                                        <div className="wishlist-game-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAddToCart(game)
                                                }
                                            >
                                                Додати в кошик
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
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}