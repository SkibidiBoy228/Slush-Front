
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import GameSearch from "../../components/GameSearch/GameSearch";

import {
    addToCart,
    getWishlist,
    removeFromWishlist,
    type StoreItem,
} from "../../api/store";

import "./WishlistPage.css";

type SortOption =
    | "discount"
    | "price-asc"
    | "price-desc"
    | "name";

export default function WishlistPage() {
    const { t, i18n } = useTranslation();

    const [wishlist, setWishlist] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<SortOption>("discount");

    const localeMap: Record<string, string> = {
        uk: "uk-UA",
        en: "en-US",
        sk: "sk-SK",
        ru: "ru-RU",
    };

    const locale =
        localeMap[i18n.resolvedLanguage ?? "uk"] ?? "uk-UA";

    useEffect(() => {
        void loadWishlist();
    }, []);

    async function loadWishlist() {
        try {
            setLoading(true);

            const data = await getWishlist();

            setWishlist(data);
        } catch (error) {
            console.error(
                "Помилка завантаження обраного:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(gameId: string) {
        try {
            await removeFromWishlist(gameId);

            setWishlist((prev) =>
                prev.filter(
                    (game) => game.gameId !== gameId
                )
            );
        } catch (error) {
            console.error(
                "Помилка видалення з обраного:",
                error
            );
        }
    }

    async function handleAddToCart(game: StoreItem) {
        try {
            await addToCart({
                gameId: game.gameId,
                title: game.title,
                imageUrl: game.imageUrl,
                price: game.price,
                oldPrice: game.oldPrice,
                discountPercent: game.discountPercent,
            });

            await removeFromWishlist(game.gameId);

            setWishlist((prev) =>
                prev.filter(
                    (item) => item.gameId !== game.gameId
                )
            );
        } catch (error) {
            console.error(
                "Помилка додавання в кошик:",
                error
            );
        }
    }

    const filteredWishlist = useMemo(() => {
        let result = [...wishlist];

        if (search.trim()) {
            const query = search.trim().toLowerCase();

            result = result.filter((game) =>
                game.title.toLowerCase().includes(query)
            );
        }

        if (sort === "discount") {
            result.sort(
                (a, b) =>
                    b.discountPercent - a.discountPercent
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
                a.title.localeCompare(b.title, locale)
            );
        }

        return result;
    }, [wishlist, search, sort, locale]);

    function formatMoney(value: number) {
        return `${value.toLocaleString(locale)} ₴`;
    }

    return (
        <div className="wishlist-page">
            <GameSearch />

            <main className="wishlist-content">
                <h1>{t("wishlist.title")}</h1>

                <div className="wishlist-layout">
                    <aside className="wishlist-filters">
                        <div className="filters-header">
                            <strong>{t("wishlist.filters")}</strong>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSort("discount");
                                }}
                            >
                                {t("wishlist.reset")}
                            </button>
                        </div>

                        <label>{t("wishlist.tagSearch")}</label>

                        <select>
                            <option>
                                {t("wishlist.anyTags")}
                            </option>
                        </select>

                        <div className="filter-divider" />

                        <label>{t("wishlist.genre")}</label>

                        <select>
                            <option>
                                {t("wishlist.allGenres")}
                            </option>
                        </select>

                        <div className="filter-divider" />

                        <label>{t("wishlist.price")}</label>

                        <div className="price-options">
                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                />
                                {t("wishlist.free")}
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                />
                                {t("wishlist.price100")}
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                />
                                {t("wishlist.price300")}
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                />
                                {t("wishlist.price600")}
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                />
                                {t("wishlist.price900")}
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="price"
                                    defaultChecked
                                />
                                {t("wishlist.noLimits")}
                            </label>
                        </div>

                        <div className="filter-divider" />

                        <label>{t("wishlist.discounts")}</label>

                        <select>
                            <option>
                                {t("wishlist.allDiscounts")}
                            </option>
                        </select>

                        <div className="filter-divider" />

                        <label>{t("wishlist.type")}</label>

                        <select>
                            <option>
                                {t("wishlist.allTypes")}
                            </option>
                        </select>

                        <div className="filter-divider" />

                        <label>{t("wishlist.features")}</label>

                        <select>
                            <option>
                                {t("wishlist.allFeatures")}
                            </option>
                        </select>

                        <div className="filter-divider" />

                        <label>{t("wishlist.platform")}</label>

                        <select>
                            <option>
                                {t("wishlist.allPlatforms")}
                            </option>
                        </select>
                    </aside>

                    <section className="wishlist-results">
                        <div className="wishlist-toolbar">
                            <input
                                type="text"
                                placeholder={t("wishlist.searchPlaceholder")}
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            <label>
                                {t("wishlist.sorting")}

                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        setSort(
                                            e.target.value as SortOption
                                        )
                                    }
                                >
                                    <option value="discount">
                                        {t("wishlist.sortDiscount")}
                                    </option>

                                    <option value="price-asc">
                                        {t("wishlist.sortPriceAsc")}
                                    </option>

                                    <option value="price-desc">
                                        {t("wishlist.sortPriceDesc")}
                                    </option>

                                    <option value="name">
                                        {t("wishlist.sortName")}
                                    </option>
                                </select>
                            </label>
                        </div>

                        {loading ? (
                            <div className="wishlist-empty">
                                {t("wishlist.loading")}
                            </div>
                        ) : filteredWishlist.length === 0 ? (
                            <div className="wishlist-empty">
                                {t("wishlist.empty")}
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

                                            <div className="wishlist-price">
                                                {game.oldPrice > game.price && (
                                                    <span className="wishlist-old-price">
                                                        {formatMoney(game.oldPrice)}
                                                    </span>
                                                )}

                                                <strong>
                                                    {formatMoney(game.price)}
                                                </strong>

                                                {game.discountPercent > 0 && (
                                                    <span className="wishlist-discount">
                                                        -{game.discountPercent}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="wishlist-game-actions">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAddToCart(game)
                                                }
                                            >
                                                {t("wishlist.addToCart")}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemove(game.gameId)
                                                }
                                            >
                                                {t("wishlist.remove")}
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
