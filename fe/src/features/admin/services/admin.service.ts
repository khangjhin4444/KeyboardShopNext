import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ProductDetailEntity } from "../entities/admin.entity";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { convertToProductDetailEntity } from "../entities/admin.entity";

type GetProductDetail = ({
  page,
}: {
  page: number;
}) => Promise<ProductDetailEntity[]>;

type AdminServiceType = {
  getProductDetail: GetProductDetail;
};

export const AdminService: AdminServiceType = {
  getProductDetail: async function ({ page }: { page: number }) {
    try {
      const response = await fetch(
        `${API_URL}/api/products/admin?page=${page}`,
      );

      if (!response.ok) {
        throw new Error("Lỗi tải dữ liệu");
      }

      const result = await response.json();
      console.log(result);
      // Sau khi lấy dữ liệu thành công, return về đúng kiểu dữ liệu đã hứa (Product[])
      return convertToProductDetailEntity(result.data);
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      // Nếu có lỗi, Promise chuyển sang trạng thái Thất bại (Rejected)
      throw error;
    }
  },
};
