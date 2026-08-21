const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T>(
    endPoint: string,
    options: RequestInit = {}

) : Promise<T> {
    const response = await fetch(`${API_URL}${endPoint}`,{...options, headers: {"Content-Type" : "application/json", ...options.headers,},});

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json") ? await response.json() : await response.text();

    if(!response.ok){
        throw new Error(typeof data === "string" ? data : data?.message || "Something went wrong");
    }

    return data as T;

}

