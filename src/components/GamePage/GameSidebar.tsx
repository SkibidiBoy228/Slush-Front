
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GameDetails } from "../../types/game";
import {
    convertUsdToUah,
    formatPrice,
} from "../../utils/price";

import {
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
} from "../../api/store";

interface GameSidebarProps {
    game: GameDetails;
}

function GameSideBar({ game }: GameSidebarProps) {
    const { t } = useTranslation();

    const [isInCart, setIsInCart] = useState(game.isInCart);
    const [isInWishlist, setIsInWishlist] = useState(
        game.isInWishlist
    );
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setIsInCart(game.isInCart);
        setIsInWishlist(game.isInWishlist);
    }, [
        game.id,
        game.isInCart,
        game.isInWishlist,
    ]);

    const formattedPrice = formatPrice(game.price);
    const formattedOldPrice = formatPrice(game.oldPrice);

    const gamePayload = {
        gameId: game.id,
        title: game.title,
        imageUrl: game.thumbnail,
        price: convertUsdToUah(game.price),
        oldPrice: convertUsdToUah(game.oldPrice),
        discountPercent: game.discountPercent,
    };

    const handleCartClick = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            if (isInCart) {
                await removeFromCart(game.id);
                setIsInCart(false);
            } else {
                await addToCart(gamePayload);
                setIsInCart(true);
            }
        } catch (error) {
            console.error(
                "Помилка роботи з кошиком:",
                error
            );

            alert(t("gameSidebar.cartError"));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWishlistClick = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            if (isInWishlist) {
                await removeFromWishlist(game.id);
                setIsInWishlist(false);
            } else {
                await addToWishlist(gamePayload);
                setIsInWishlist(true);
            }
        } catch (error) {
            console.error(
                "Помилка роботи з обраним:",
                error
            );

            alert(t("gameSidebar.wishlistError"));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBuyClick = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            if (!isInCart) {
                await addToCart(gamePayload);
                setIsInCart(true);
            }

            window.location.href = "/cart";
        } catch (error) {
            console.error("Помилка переходу до покупки:", error);
            alert(t("gameSidebar.buyError"));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <aside className="game-sidebar">
            <div className="game-rating">
                {game.averageRating > 0 ? (
                    <>
                        <strong>
                            {game.averageRating.toFixed(1)}
                        </strong>

                        <div className="rating-stars">
                            {Array.from({ length: 5 }).map(
                                (_, index) => (
                                    <span
                                        key={index}
                                        className={
                                            index <
                                            Math.round(game.averageRating)
                                                ? "filled"
                                                : ""
                                        }
                                    >
                                        ★
                                    </span>
                                )
                            )}
                        </div>
                    </>
                ) : (
                    <span className="no-rating">
                        {t("gameSidebar.noRating")}
                    </span>
                )}
            </div>

            <img
                className="sidebar-cover"
                src={game.thumbnail}
                alt={game.title}
            />

            <div className="sidebar-price">
                {game.discountPercent > 0 && (
                    <span className="sidebar-discount">
                        -{game.discountPercent}%
                    </span>
                )}

                <strong>{formattedPrice}</strong>

                {game.oldPrice > game.price && (
                    <del>{formattedOldPrice}</del>
                )}
            </div>

            <button
                className="buy-button"
                onClick={handleBuyClick}
                disabled={isProcessing}
            >
                {isProcessing
                    ? t("gameSidebar.wait")
                    : t("gameSidebar.buy")}
            </button>

            <div className="sidebar-actions">
                <button
                    className="cart-button"
                    onClick={handleCartClick}
                    disabled={isProcessing}
                >
                    {isProcessing
                        ? t("gameSidebar.wait")
                        : isInCart
                        ? t("gameSidebar.inCart")
                        : t("gameSidebar.addToCart")}
                </button>

                <button
                    className={`wishlist-button ${
                        isInWishlist ? "active" : ""
                    }`}
                    onClick={handleWishlistClick}
                    disabled={isProcessing}
                    aria-label={
                        isInWishlist
                            ? t("gameSidebar.removeFromWishlist")
                            : t("gameSidebar.addToWishlist")
                    }
                >
                    {isInWishlist ? "♥" : "♡"}
                </button>
            </div>

            <div className="game-secondary-actions">
                <button>↗ {t("gameSidebar.repost")}</button>
                <button>⚑ {t("gameSidebar.report")}</button>
            </div>

            <div className="game-metadata">
                <div>
                    <span>{t("gameSidebar.releaseDate")}</span>
                    <strong>
                        {game.releaseDate || t("gameSidebar.unknown")}
                    </strong>
                </div>

                <div>
                    <span>{t("gameSidebar.developer")}</span>
                    <strong>
                        {game.developer || t("gameSidebar.unknown")}
                    </strong>
                </div>

                <div>
                    <span>{t("gameSidebar.publisher")}</span>
                    <strong>
                        {game.publisher || t("gameSidebar.unknown")}
                    </strong>
                </div>

                <div>
                    <span>{t("gameSidebar.platforms")}</span>
                    <strong>Windows</strong>
                </div>
            </div>

            <div className="frined-block">
                <h3>{t("gameSidebar.friendsPlaying")}</h3>

                {game.friendsPlaying.length > 0 ? (
                    game.friendsPlaying.map((friend) => (
                        <div
                            className="friend-row"
                            key={friend.username}
                        >
                            <div className="friend-avatar">
                                {friend.username
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    {friend.username}
                                </strong>

                                <span>
                                    {friend.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="empty-sidebar-text">
                        {t("gameSidebar.noFriendsPlaying")}
                    </p>
                )}
            </div>
        </aside>
    );
}

export default GameSideBar;
