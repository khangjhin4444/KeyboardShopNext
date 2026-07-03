import { AdminService } from "../services/admin.service";

export const AdminUsecase = {
  getProductDetail: ({ page, type }: { page: number; type: string }) => {
    return AdminService.getProductDetail({ type, page });
  },
  deleteProductAdmin: ({ VariantID }: { VariantID: number }) => {
    return AdminService.deleteProductAdmin({ VariantID });
  },
};
