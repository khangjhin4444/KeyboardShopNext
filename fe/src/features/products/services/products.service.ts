import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  ProductEntity,
  ProductDetailEntity,
  convertToProductEntity,
  convertToProductDetailEntity,
} from "../entities/product.entity";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

type GetProducts = ({
  type,
  page,
  sort,
}: {
  type: string;
  page: number;
  sort: string;
}) => Promise<ProductEntity[]>;

type GetProductsCategory = ({
  type,
  page,
  sort,
  sub,
}: {
  type: string;
  page: number;
  sort: string;
  sub: string;
}) => Promise<ProductEntity[]>;

type GetProductDetail = ({
  id,
}: {
  id: number;
}) => Promise<ProductDetailEntity>;

type GetRelevantProducts = ({
  id,
  type,
}: {
  id: number;
  type: string;
}) => Promise<ProductEntity[]>;

type GetSearchProducts = (
  keyword: string,
  page: number,
) => Promise<ProductEntity[]>;

type ProductServiceType = {
  getProducts: GetProducts;
  getProductDetail: GetProductDetail;
  getRelevantProducts: GetRelevantProducts;
  getProductsCategory: GetProductsCategory;
  getSearchProducts: GetSearchProducts;
};

export const ProductService: ProductServiceType = {
  getProducts: async function ({
    type,
    page,
    sort,
  }: {
    type: string;
    page: number;
    sort: string;
  }) {
    try {
      const response = await fetch(
        `${API_URL}/api/products?type=${type}&page=${page}&limit=8&sort=${sort}`,
      );

      if (!response.ok) {
        throw new Error("Lỗi tải dữ liệu");
      }

      const result = await response.json();
      const data = result.data.map((item: ProductEntity) =>
        convertToProductEntity(item),
      );
      // Sau khi lấy dữ liệu thành công, return về đúng kiểu dữ liệu đã hứa (Product[])
      return data;
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      // Nếu có lỗi, Promise chuyển sang trạng thái Thất bại (Rejected)
      throw error;
    }
  },
  getProductDetail: async function ({ id }: { id: number }) {
    try {
      const result = await fetchWithAuth(`${API_URL}/api/products/${id}`);
      const data = convertToProductDetailEntity(result.data);
      return data;
    } catch (err) {
      console.log("Loi khi call api: ", err);
      throw err;
    }
  },
  getRelevantProducts: async function ({
    id,
    type,
  }: {
    id: number;
    type: string;
  }) {
    try {
      const result = await fetchWithAuth(
        `${API_URL}/api/products/relevant?id=${id}&type=${type}`,
      );
      const data = result.data.map((item: ProductEntity) =>
        convertToProductEntity(item),
      );
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getProductsCategory: async function ({
    type,
    page,
    sort,
    sub,
  }: {
    type: string;
    page: number;
    sort: string;
    sub: string;
  }) {
    try {
      const response = await fetch(
        `${API_URL}/api/products?type=${type}&page=${page}&limit=8&sort=${sort}&sub=${sub}`,
      );

      if (!response.ok) {
        throw new Error("Lỗi tải dữ liệu");
      }

      const result = await response.json();

      const data = result.data.map((item: ProductEntity) =>
        convertToProductEntity(item),
      );
      // Sau khi lấy dữ liệu thành công, return về đúng kiểu dữ liệu đã hứa (Product[])
      return data;
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      // Nếu có lỗi, Promise chuyển sang trạng thái Thất bại (Rejected)
      throw error;
    }
  },
  getSearchProducts: async function (keyword: string, page: number) {
    try {
      const response = await fetch(
        `${API_URL}/api/products/search?keyword=${keyword}&page=${page}`,
      );
      const result = await response.json();
      console.log("result ", result);
      const data = result.products.map((item: ProductEntity) =>
        convertToProductEntity(item),
      );
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
