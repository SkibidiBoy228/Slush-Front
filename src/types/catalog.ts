export interface CatalogGame {
  id: string;
  title: string;
  source: number;
  price: number;
  oldPrice: number;
  discountPercent: number;
  thumbnail: string;
  dealUrl: string;
  releaseDate: string;
}

export interface CatalogResponse {
  items: CatalogGame[];
  totalCount: number;
  page: number;
  pageSize: number;
}