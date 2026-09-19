export const USD_TO_UAH = 45;

export function formatPrice(price:number) : string{
    if(price <= 0){
        return "Безкоштовно";
    }
    const uahPrice = price * USD_TO_UAH;

    return `${uahPrice.toLocaleString("uk-UA", {
        maximumFractionDigits: 0,
    })}₴`
}