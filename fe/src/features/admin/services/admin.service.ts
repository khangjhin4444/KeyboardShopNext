import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  AddProductEntity,
  convertToAddProductEntity,
  convertToCancelOrderResponseEntity,
  convertToDeleteProductEntity,
  convertToOrdersResponseEntity,
  convertToUpdateProductVariantAdminEntity,
  DeleteProductEntity,
  ProductDetailEntity,
  UpdateProductVariantAdminEntity,
} from "../entities/admin.entity";
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { convertToProductDetailEntity } from "../entities/admin.entity";
import {
  CancelOrderResponseEntity,
  OrdersResponseEntity,
} from "@/shared/entities/orders.entity";

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
}) => Promise<DeleteProductEntity>;

type PayloadVariant = {
  color: string;
  stock: number;
  price: number;
  main_image: string;
};

export type AddProductProps = {
  name: string;
  description: string;
  productType: string;
  subType: string;
  variants: PayloadVariant[];
  extraImages: string[];
};
type AddProductAdmin = (payload: AddProductProps) => Promise<AddProductEntity>;

type UpdateProductVariantAdmin = ({
  VariantID,
  ProductID,
  Color,
  Stock,
  Price,
  ProductType,
  SubType,
}: {
  VariantID: number;
  ProductID: number;
  Color: string;
  Stock: number;
  Price: number;
  ProductType: string;
  SubType: string;
}) => Promise<UpdateProductVariantAdminEntity>;

type GetAdminOrders = (status: string) => Promise<OrdersResponseEntity>;

type CancelAdminOrder = (orderID: number) => Promise<CancelOrderResponseEntity>;

type AdminServiceType = {
  getProductDetail: GetProductDetail;
  deleteProductAdmin: DeleteProductAdmin;
  updateProductVariantAdmin: UpdateProductVariantAdmin;
  addProduct: AddProductAdmin;
  getAdminOrders: GetAdminOrders;
  cancelAdminOrder: CancelAdminOrder;
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
      return convertToDeleteProductEntity(result);
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      throw error;
    }
  },
  updateProductVariantAdmin: async function ({
    VariantID,
    ProductID,
    Color,
    Stock,
    Price,
    ProductType,
    SubType,
  }: {
    VariantID: number;
    ProductID: number;
    Color: string;
    Stock: number;
    Price: number;
    ProductType: string;
    SubType: string;
  }) {
    try {
      const result = await fetchWithAuth(
        `${API_URL}/api/products/admin/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ProductID,
            Color,
            Stock,
            Price,
            ProductType,
            SubType,
            VariantID,
          }),
        },
      );
      return convertToUpdateProductVariantAdminEntity(result);
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      throw error;
    }
  },
  addProduct: async function (payload) {
    try {
      const result = await fetchWithAuth(`${API_URL}/api/products/admin/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      return convertToAddProductEntity(result);
    } catch (error) {
      console.error("Lỗi khi call API:", error);
      throw error;
    }
  },
  getAdminOrders: async function (status: string) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/orders/admin?status=${status}`,
      );
      return convertToOrdersResponseEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelAdminOrder: async function (orderID: number) {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/orders/admin/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderID,
          }),
        },
      );
      return convertToCancelOrderResponseEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
