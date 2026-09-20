
import type{
    UserProfile,
    ProfileReview,
    ProfileGuide,
    ProfileComment,
    ProfileGame,
    ProfilePost,
    ProfileScreenshot,
    ProfileVideo,
    PagedResult,

} from "../types/profile";


const API_URL = import.meta.env.VITE_API_URL;

async function profileRequest<T>(url: string): Promise<T>{
    const response = await fetch(`${API_URL}${url}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();

    if(!response.ok){
        throw new Error(
            data?.message || "Не вдалося завантажити дані профілю"
        );
    }

    return data as T;
}

function profilePath(username: string): string{
    return `/api/UserProfile/${encodeURIComponent(username)}`;
}

export async function getUserProfile(
    username:string
): Promise<UserProfile>{
    return profileRequest<UserProfile>(profilePath(username));
}

export async function getProfileGames(
    username:string
): Promise<PagedResult<ProfileGame>>{
    return profileRequest<PagedResult<ProfileGame>>(
        `${profilePath(username)}/games?page=1&pageSize=12`
    );
}

export async function getProfilePosts(
    username:string
):Promise<PagedResult<ProfilePost>>{
    return profileRequest<PagedResult<ProfilePost>>(
        `${profilePath(username)}/posts?page=1&pageSize=10`
    );
}

export async function getProfileScreenshots(
    username:string
):Promise<PagedResult<ProfileScreenshot>>{
    return profileRequest<PagedResult<ProfileScreenshot>>(
        `${profilePath(username)}/screenshots?page=1&pageSize=10`
    );
}

export async function getProfileVideos(
    username: string
): Promise<PagedResult<ProfileVideo>>{
    return profileRequest<PagedResult<ProfileVideo>>(
        `${profilePath(username)}/videos?page=1&pageSize=10`
    );
}

export async function getProfileReviews(
    username:string
): Promise<PagedResult<ProfileReview>>{
    return profileRequest<PagedResult<ProfileReview>>(
        `${profilePath(username)}/reviews?page=1&pageSize=5`
    );
}

export async function getProfileGuides(
    username:string
): Promise<PagedResult<ProfileGuide>>{
    return profileRequest<PagedResult<ProfileGuide>>(
        `${profilePath(username)}/guides?page=1&pageSize=5`
    );
}

export async function getProfileComments(
    username:string
): Promise<PagedResult<ProfileComment>>{
    return profileRequest<PagedResult<ProfileComment>>(
        `${profilePath(username)}/comments?page=1&pageSize=10`
    );
}

