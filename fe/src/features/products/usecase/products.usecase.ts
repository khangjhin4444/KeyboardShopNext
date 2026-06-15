import { ProductService } from "../services/products.service";

export const ProductUsecase = {
  getProducts: ({ type, page }: { type: string; page: number }) => {
    return ProductService.getProducts({ type, page });
  },
};
