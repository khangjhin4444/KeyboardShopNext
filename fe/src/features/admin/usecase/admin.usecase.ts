import { AdminService } from "../services/admin.service";

export const AdminUsecase = {
  getProductDetail: (page: number) => {
    return AdminService.getProductDetail({ page });
  },
};
