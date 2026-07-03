import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  convertToDeleteProductEntity,
  ProductDetailEntity,
} from "../entities/admin.entity";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { convertToProductDetailEntity } from "../entities/admin.entity";
import { DeleteProductResponseModel } from "../models/admin.response";

type GetProductDetail = ({
  type,
  page,
}: {
  type: string;
  page: number;
}) => Promise<ProductDetailEntity[]>;

type DeleteProductAdmin = ({
  VariantID,
}: {
  VariantID: number;
}) => Promise<DeleteProductResponseModel>;

type AdminServiceType = {
  getProductDetail: GetProductDetail;
  deleteProductAdmin: DeleteProductAdmin;
};

export const AdminService: AdminServiceType = {
  getProductDetail: async function ({
    type,
    page,
  }: {
    type: string;
    page: number;
  }) {
    try {
      const result = await fetchWithAuth(
        `${API_URL}/api/products/admin?type=${type}&page=${page}`,
      );

      return convertToProductDetailEntity(result.data);
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      throw error;
    }
  },
  deleteProductAdmin: async function ({ VariantID }: { VariantID: number }) {
    try {
      const result = await fetchWithAuth(
        `${API_URL}/api/products/admin/${VariantID}`,
        {
          method: "DELETE",
        },
      );
      console.log(result);
      return convertToDeleteProductEntity(result);
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      throw error;
    }
  },
};
