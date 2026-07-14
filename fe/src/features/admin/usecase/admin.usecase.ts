import { AddProductProps, AdminService } from "../services/admin.service";

export const AdminUsecase = {
  getProductDetail: ({ page, type }: { page: number; type: string }) => {
    return AdminService.getProductDetail({ type, page });
  },
  deleteProductAdmin: ({ VariantID }: { VariantID: number }) => {
    return AdminService.deleteProductAdmin({ VariantID });
  },
  updateProductVariantAdmin: ({
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
  }) =>
    AdminService.updateProductVariantAdmin({
      VariantID,
      ProductID,
      Color,
      Stock,
      Price,
      ProductType,
      SubType,
    }),
  addProduct: (payload: AddProductProps) => {
    return AdminService.addProduct(payload);
  },
  getAdminOrders: (status: string) => {
    return AdminService.getAdminOrders(status);
  },
  cancelAdminOrder: (orderID: number) => {
    return AdminService.cancelAdminOrder(orderID);
  },
};
