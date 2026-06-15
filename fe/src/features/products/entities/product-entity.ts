import { ConvertResponseModelToEntityFieldsFunc } from "@/shared/core/helpers/type-helper";
import { ProductResponseModel } from "../models/product-response.model";

export default interface ProductEntity {
  ProductID: number;
  Name: string;
  Description: string;
  ProductType: string;
  SubType: string;
  MainImage: string;
  Price: number;
}

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
  };
};
