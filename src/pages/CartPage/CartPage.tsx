
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import GameSearch from "../../components/GameSearch/GameSearch";

import {
    addToWishlist,
    clearCart,
    getCart,
    removeFromCart,
    type StoreItem,
} from "../../api/store";
import { checkoutCart } from "../../api/purchases";

import "./CartPage.css";

export default function CartPage() {
    const { t, i18n } = useTranslation();

    const [cart, setCart] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState("");

    const localeMap: Record<string, string> = {
        uk: "uk-UA",
        en: "en-US",
        sk: "sk-SK",
        ru: "ru-RU",
    };

    const locale =
        localeMap[i18n.language] || "uk-UA";

    const formatPrice = (price: number) =>
        `${price.toLocaleString(locale)} ₴`;

    useEffect(() => {
        loadCart();
    }, []);

    async function loadCart() {
        try {
            setLoading(true);

            const data = await getCart();

            setCart(data);
        } catch (error) {
            console.error(
                "Помилка завантаження кошика:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove(gameId: string) {
        try {
            await removeFromCart(gameId);

            setCart((prev) =>
                prev.filter(
                    (game) => game.gameId !== gameId
                )
            );
        } catch (error) {
            console.error(
                "Помилка видалення з кошика:",
                error
            );
        }
    }

    async function handleMoveToWishlist(game: StoreItem) {
        try {
            await addToWishlist({
                gameId: game.gameId,
                title: game.title,
                imageUrl: game.imageUrl,
                price: game.price,
                oldPrice: game.oldPrice,
                discountPercent: game.discountPercent,
            });

            await removeFromCart(game.gameId);

            setCart((prev) =>
                prev.filter(
                    (item) => item.gameId !== game.gameId
                )
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
            console.error(
                "Помилка очищення кошика:",
                error
            );
        }
    }

    async function handleCheckout() {
        if (cart.length === 0 || checkoutLoading) return;

        try {
            setCheckoutLoading(true);
            setCheckoutMessage("");

            const result = await checkoutCart();

            await loadCart();

            setCheckoutMessage(
                result.message || t("cart.checkoutSuccess")
            );

            window.dispatchEvent(new Event("wallet-updated"));
            window.dispatchEvent(new Event("library-updated"));
            window.dispatchEvent(new Event("wishlist-updated"));
        } catch (error) {
            setCheckoutMessage(
                error instanceof Error
                    ? error.message
                    : t("cart.checkoutError")
            );
        } finally {
            setCheckoutLoading(false);
        }
    }

    const total = useMemo(() => {
        return cart.reduce(
            (sum, game) => sum + game.price,
            0
        );
    }, [cart]);

    const oldTotal = useMemo(() => {
        return cart.reduce(
            (sum, game) => {
                const oldPrice =
                    game.oldPrice > 0
                        ? game.oldPrice
                        : game.price;

                return sum + oldPrice;
            },
            0
        );
    }, [cart]);

    const savings = useMemo(() => {
        return cart.reduce(
            (sum, game) =>
                sum +
                Math.max(
                    0,
                    game.oldPrice - game.price
                ),
            0
        );
    }, [cart]);

    return (
        <div className="cart-page">
            <GameSearch />

            <main className="cart-content">
                <h1>{t("cart.title")}</h1>

                <div className="cart-layout">
                    <section className="cart-items">
                        {loading ? (
                            <div className="cart-empty">
                                {t("cart.loading")}
                            </div>
                        ) : cart.length === 0 ? (
                            <div className="cart-empty">
                                {t("cart.empty")}
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

                                        <div className="cart-price">
                                            {game.oldPrice > game.price && (
                                                <span className="cart-old-price">
                                                    {formatPrice(game.oldPrice)}
                                                </span>
                                            )}

                                            <strong>
                                                {formatPrice(game.price)}
                                            </strong>

                                            {game.discountPercent > 0 && (
                                                <span className="cart-discount">
                                                    -{game.discountPercent}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="cart-item-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMoveToWishlist(game)
                                            }
                                            aria-label={t("cart.addToWishlist")}
                                            title={t("cart.addToWishlist")}
                                        >
                                            ♡
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(game.gameId)
                                            }
                                        >
                                            {t("cart.remove")}
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </section>

                    <aside className="cart-summary">
                        <div className="summary-row">
                            <span>{t("cart.originalPrice")}</span>

                            <strong>
                                {cart.length === 0
                                    ? formatPrice(0)
                                    : formatPrice(oldTotal)}
                            </strong>
                        </div>

                        <div className="summary-row">
                            <span>{t("cart.savings")}</span>

                            <strong className="summary-savings">
                                {formatPrice(savings)}
                            </strong>
                        </div>

                        <div className="summary-row summary-total">
                            <span>{t("cart.total")}</span>

                            <strong>
                                {cart.length === 0
                                    ? t("cart.free")
                                    : formatPrice(total)}
                            </strong>
                        </div>

                        <p className="summary-note">
                            {t("cart.taxNote")}
                        </p>

                        <button
                            className="checkout-button"
                            type="button"
                            disabled={
                                cart.length === 0 || checkoutLoading
                            }
                            onClick={handleCheckout}
                        >
                            {checkoutLoading
                                ? t("cart.processing")
                                : t("cart.checkout")}
                        </button>

                        {checkoutMessage && (
                            <p role="status" aria-live="polite">
                                {checkoutMessage}
                            </p>
                        )}

                        <button
                            className="continue-button"
                            type="button"
                            onClick={() => {
                                window.location.href = "/";
                            }}
                        >
                            {t("cart.continueShopping")}
                        </button>

                        <button
                            className="clear-cart-button"
                            type="button"
                            disabled={cart.length === 0}
                            onClick={handleClearCart}
                        >
                            {t("cart.clear")}
                        </button>
                    </aside>
                </div>
            </main>
        </div>
    );
}
