import { ProductEntity } from "../entities/product.entity";

export interface ProductResponseModel {
  ProductID: number;
  Name: string;
  Description: string;
  ProductType: string;
  SubType: string;
  MainImage: string;
  Price: number;
}

export interface Variant {
  VariantID: number;
  Color: string;
  Price: number;
  Stock: number;
  MainImage: string;
}

export interface ProductDetailResponseModel {
  ProductID: number;
  Name: string;
  ProductType: string;
  Description: string;
  SubType: string;
  images: string[];
  variants: Variant[];
}

export interface SearchProductResponseModel {
  success: boolean;
  products: ProductEntity[];
}
