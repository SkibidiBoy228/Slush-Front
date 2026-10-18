export interface LibraryGame{
    gameId: string;
    title: string;
    coverImage: string;
    headerImage: string | null;
    developer: string;
    releaseDate: string;
    diskSize: number;
    isFavorite: boolean;
    collectionId: string | null;
    isInstalled: boolean | null;
    acquiredAt: string;
}
export interface LibraryCollection{
    id: string;
    name: string;
    gamesCount: number;
    createdAt: string;
}
export interface CommunityPost{
    id: string;
    gameId: string | null;
    authorUsername: string;
    authorAvatarUrl: string | null;
    postType: string;
    isLiked: boolean;
    title: string;
    content: string;
    shortDescription: string | null;
    mediaUrl: string | null;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

export interface PagedResult<T>{
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}
export interface LibraryHome{
    recentGames: LibraryGame[];
    favoriteGames: LibraryGame[];
    collections: LibraryCollection[];
    latestNews: CommunityPost[];
    communityHighlights: CommunityPost[];
}
export interface GameLibraryContext{
    gameId: string;
    isOwned: boolean;
    isFavorite: boolean;
    isInWishlist: boolean;
    isInCart: boolean;
    collectionId: string | null;
    diskSize: number;
    isInstalled: boolean | null;
    myReview: UserGameReview | null;
    friendsWhoOwn: unknown[];
    friendsWhoWant: unknown[];
}
export interface UserGameReview {
    id: string;
    gameId: string;
    username: string;
    avatarUrl: string | null;
    score: number;
    text: string;
    createdAt: string;
}
export interface SaveGameReviewRequest{
    gameTitle: string;
    gameBannerUrl: string;
    score: number;
    text: string;
}
export interface CreateLibraryCollectionRequest{
    name: string;
}
export interface UpdateLibraryCollectionRequest{
    name: string;
}
export interface LibraryQueryParams{
    sort?: string;
    page?: string;
    pageSize?: number;
}
export interface LibraryFeedParams{
    source?: "subscriptions" | "library" | "recommended";
    type?: "all" | "discussions" | "screenshots" | "videos" | "guides" | "news";
    sort?: "newest" | "popular";
    page?: number;
    pageSize?: number;
}