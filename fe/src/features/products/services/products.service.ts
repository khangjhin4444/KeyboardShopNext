import Product from "../entities/product-entity";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

type GetProducts = ({
  type,
  page,
}: {
  type: string;
  page: number;
}) => Promise<Product[]>;

type ProductServiceType = {
  getProducts: GetProducts;
};

export const ProductService: ProductServiceType = {
  getProducts: async function ({ type, page }: { type: string; page: number }) {
    try {
      const response = await fetch(
        `${API_URL}/api/products?type=${type}&page=${page}&limit=8`,
      );

      if (!response.ok) {
        throw new Error("Lỗi tải dữ liệu");
      }

      const result = await response.json();

      // Sau khi lấy dữ liệu thành công, return về đúng kiểu dữ liệu đã hứa (Product[])
      return result.data as Product[];
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      // Nếu có lỗi, Promise chuyển sang trạng thái Thất bại (Rejected)
      throw error;
    }
  },
};
