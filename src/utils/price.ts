export const USD_TO_UAH = 45;

export function convertUsdToUah(price: number): number {
    if (price <= 0) {
        return 0;
    }

    return price * USD_TO_UAH;
}

export function formatPrice(price: number): string {
    if (price <= 0) {
        return "Безкоштовно";
    }

    const uahPrice = convertUsdToUah(price);

    return `${uahPrice.toLocaleString("uk-UA", {
        maximumFractionDigits: 0,
    })}₴`;
}