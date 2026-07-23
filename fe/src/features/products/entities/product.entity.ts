import { ConvertResponseModelToEntityFieldsFunc } from "@/shared/core/helpers/type-helper";
import {
  ProductDetailResponseModel,
  ProductResponseModel,
} from "../models/product-response.model";

export interface ProductEntity {
  ProductID: number;
  Name: string;
  Description: string;
  ProductType: string;
  SubType: string;
  MainImage: string;
  Price: number;
  variants: SimpleVariant[];
}

export interface SimpleVariant {
  colorText: string;
  image: string;
  price: number;
}

export interface Variant {
  VariantID: number;
  Color: string;
  Price: number;
  Stock: number;
  MainImage: string;
}

export interface ProductDetailEntity {
  ProductID: number;
  Name: string;
  ProductType: string;
  Description: string;
  SubType: string;
  images: string[];
  variants: Variant[];
}

export const convertToProductDetailEntity: ConvertResponseModelToEntityFieldsFunc<
  ProductDetailEntity,
  ProductDetailResponseModel
> = (
  productDetailResponse: ProductDetailResponseModel,
): ProductDetailEntity => {
  return {
    ProductID: productDetailResponse.ProductID,
    Name: productDetailResponse.Name,
    ProductType: productDetailResponse.ProductType,
    Description: productDetailResponse.Description,
    SubType: productDetailResponse.SubType,
    images: productDetailResponse.images,
    variants: productDetailResponse.variants,
  };
};

export const convertToProductEntity: ConvertResponseModelToEntityFieldsFunc<
  ProductEntity,
  ProductResponseModel
> = (productResponse: ProductResponseModel): ProductEntity => {
  return {
    ProductID: productResponse.ProductID,
    Name: productResponse.Name,
    Description: productResponse.Description,
    ProductType: productResponse.ProductType,
    SubType: productResponse.SubType,
    MainImage: productResponse.MainImage,
    Price: productResponse.Price,
    variants: productResponse.variants,
  };
};
