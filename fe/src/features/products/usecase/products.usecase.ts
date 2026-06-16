import { ProductService } from "../services/products.service";

export const ProductUsecase = {
  getProducts: ({
    type,
    page,
    sort,
  }: {
    type: string;
    page: number;
    sort: string;
  }) => {
    return ProductService.getProducts({ type, page, sort });
  },
};
