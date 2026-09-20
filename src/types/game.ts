export interface Screenshot {
    id: number;
    image: string;
}

export interface GameReview {
    username: string;
    score: number;
    text: string;
    date: string;
}

export interface FriendPlaying{
    username: string;
    status: string;

}

export interface GameExtra{
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
}

export interface PcRequirements {
  minimum: string;
  recommended: string;
}

export interface GameDetails{
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    developer: string;
    publisher: string;
    releaseDate: string;
    screenshots: Screenshot[];
    price: number;
    oldPrice: number;
    discountPercent: number;
    tags: string[];
    dLcs: GameExtra[];
    bundles: GameExtra[];
    pcRequirements: PcRequirements;
    averageRating: number;
    reviews: GameReview[];
    friendsPlaying: FriendPlaying[];
    isInWishlist: boolean;
    isInCart:boolean;
}