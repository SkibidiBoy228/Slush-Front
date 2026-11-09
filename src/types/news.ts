export interface SteamNewsItem{
    id: string;
    title: string;
    url: string;
    author: string;
    contents: string;
    feedLabel: string;
    date: string;
    dateFormatted: string;
    gameId: string;
    gameTitle: string;
    gameImage: string;
}

export interface NewsResponse{
    items: SteamNewsItem[];
    totalCount: number;
    page: number;
    pageSize: number;
}