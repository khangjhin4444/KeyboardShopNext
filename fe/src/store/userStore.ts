import { create } from "zustand";
import { persist } from "zustand/middleware";
// Định nghĩa khung dữ liệu cho User
interface UserState {
  user: {
    id: number;
    username: string;
    cartQuantity: number;
  } | null;
  isAuth: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

// Khởi tạo kho lưu trữ
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,

      // Hàm gọi khi đăng nhập thành công
      login: (userData) => set({ user: userData, isAuth: true }),

      // Hàm gọi khi bấm đăng xuất
      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, isAuth: false });
      },
    }),
    {
      name: "user-storage", // Tên của key sẽ được lưu trong localStorage của trình duyệt
      // Mặc định Zustand sẽ tự động dùng localStorage, bạn không cần cấu hình gì thêm
    },
  ),
);
