export interface ProfileCounters{
    badges: number;
    games: number;
    wishlist: number;
    discussions: number;
    screenshots: number;
    videos: number;
    guides: number;
    reviews: number;
    friends: number;
}

export interface Badge{
    id: string;
    title: string;
    description: string;
    points: number;
    imageUrl: string;
    earnedAt: string;
}

export interface ProfileFriend{
    id: string;
    username: string;
    avatarUrl: string;
    level: number;
}

export interface UserProfile{
    id: string;
    username: string;
    status: string;
    bio: string;
    avatarUrl: string;
    coverUrl: string;
    level: number;
    currentXp: number;
    maxXp: number;
    counters: ProfileCounters;
    badges: Badge[];
    friends: ProfileFriend[];
    isOnline: boolean;
    lastSeenAt : string | null;
}

export interface ProfileReview{
    gameId: string;
    gameTitle: string;
    gameBannerUrl: string;
    rating: number;
    text: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

export interface ProfileGuide{
    gameTitle: string;
    guideTitle: string;
    textSnippet: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

export interface ProfileComment{
    id:string;
    authorUsername: string;
    authorAvatarUrl: string;
    text: string;
    createdAt: string;   
}

export interface ProfileGame {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
}

export interface ProfilePost{
    id: string;
    title: string;
    text: string;
    imageUrl: string;
    authorUsername: string;
    authorAvatarUrl: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
}

export interface ProfileScreenshot{
    id: string;
    imageUrl: string;
    gameTitle: string;
    gameId: string;
    createdAt: string;
}

export interface ProfileVideo{
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    gameTitle: string;
    gameId: string;
    createdAt: string;
}

export interface PagedResult<T>{
    items: T[];
    totalCount: number;
    page: number;
    pageSize:number;
}