import {
  DeleteProductResponseModel,
  ProductDetailResponseModel,
} from "../models/admin.response";

export interface Variant {
  VariantID: number;
  Color: string;
  Price: number;
  Stock: number;
  MainImage: string;
}

export interface ProductDetailEntity {
  ProductID: number;
  VariantID: number;
  Name: string;
  ProductType: string;
  SubType: string;
  Color: string;
  Price: number;
  Stock: number;
}

export interface DeleteProductEntity {
  success: boolean;
  message: string;
  type: string;
}

export const convertToProductDetailEntity = (
  responseModel: ProductDetailResponseModel[],
): ProductDetailEntity[] => {
  const data: ProductDetailEntity[] = responseModel.flatMap((product) =>
    product.variants.map((variant) => ({
      ProductID: product.ProductID,
      VariantID: variant.VariantID,
      Name: product.Name,
      ProductType: product.ProductType,
      SubType: product.SubType,
      Color: variant.Color,
      Price: variant.Price,
      Stock: variant.Stock,
    })),
  );
  return data;
};

export const convertToDeleteProductEntity = (
  responseModel: DeleteProductResponseModel,
): DeleteProductEntity => {
  return {
    success: responseModel.success,
    message: responseModel.message,
    type: responseModel.type,
  };
};
