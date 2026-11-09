import type { NewsResponse } from "../types/news";

const API_URL = import.meta.env.VITE_API_URL;

export async function getAggregatedNews(params?:{
    page?: number;
    pageSize: number;
}): Promise<NewsResponse> {
    const searchParams = new URLSearchParams();

    searchParams.set("page", String(params?.page ?? 1));
    searchParams.set("pageSize", String(params?.pageSize ?? 12));

    const response = await fetch(
        `${API_URL}/api/GameCatalog/news?${searchParams.toString()}`,
        {
            method:"GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    const data = await response.json();

    if(!response.ok){
        throw new Error(data?.message || "Не вдалося завантажити новини");
    }

    return data as NewsResponse;
}