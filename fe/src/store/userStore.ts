import { string } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
// Định nghĩa khung dữ liệu cho User
interface UserState {
  user: {
    id: number;
    username: string;
    cartQuantity: number;
    Name: string;
    Phone: string;
    Address: string;
    role: string;
  } | null;
  isAuth: boolean;
  login: (userData: any) => void;
  logout: () => Promise<void>;
  updateCartQuantity: (quantity: number) => void;
  updateUserInformation: (address: string, name: string, phone: string) => void;
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
      logout: async () => {
        try {
          await fetch("http://localhost:8000/api/auth/logout", {
            method: "POST",
            // QUAN TRỌNG: Phải có dòng này thì trình duyệt mới gửi Cookie lên cho Backend xóa
            credentials: "include",
          });
        } catch (err) {
          console.error("Lỗi khi gọi API đăng xuất:", err);
        } finally {
          localStorage.removeItem("accessToken");
          set({ user: null, isAuth: false });
          window.location.href = "/login";
        }
      },
      updateCartQuantity: (newQuantity: number) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                cartQuantity: newQuantity,
              }
            : null,
        })),
      updateUserInformation: (
        newAddress: string,
        newName: string,
        newPhone: string,
      ) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                Address: newAddress,
                Name: newName,
                Phone: newPhone,
              }
            : null,
        })),
    }),
    {
      name: "user-storage", // Tên của key sẽ được lưu trong localStorage của trình duyệt
      // Mặc định Zustand sẽ tự động dùng localStorage, bạn không cần cấu hình gì thêm
    },
  ),
);
