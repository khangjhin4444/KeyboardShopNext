import { ProductService } from "../services/products.service";

export const ProductUsecase = {
  getProducts: ({
    type,
    cursor,
    sort,
  }: {
    type: string;
    cursor: string | null;
    sort: string;
  }) => {
    return ProductService.getProducts({ type, cursor, sort });
  },
  getProductDetail: (id: number) => {
    return ProductService.getProductDetail({ id });
  },
  getRelevantProducts: (id: number, type: string) => {
    return ProductService.getRelevantProducts({ id, type });
  },
  getProductsCategory: ({
    type,
    page,
    sort,
    sub,
  }: {
    type: string;
    page: number;
    sort: string;
    sub: string;
  }) => {
    return ProductService.getProductsCategory({ type, page, sort, sub });
  },
  getSearchProduct: (keyword: string, page: number) => {
    return ProductService.getSearchProducts(keyword, page);
  },
};
