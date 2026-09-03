"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { initUserInfo } from "@/store/slices/userSlice";
import { updateQuantity } from "@/store/slices/cartSlice";
import { UserUsecase } from "@/features/user/usecase/user.usecase";
import { useQuery } from "@tanstack/react-query";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const {
    data: response,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => UserUsecase.getUserInformation(),
    enabled: status === "authenticated" && !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  useEffect(() => {
    if (isSuccess && response) {
      dispatch(
        initUserInfo({
          Name: response.Name,
          Phone: response.Phone,
          Address: response.Address,
          Role: response.Role,
        }),
      );

      dispatch(updateQuantity(response.cartQuantity));
    }

    if (isError) {
      console.error(error?.message || "Failed to fetch user information");
    }
  }, [isSuccess, isError, response, error, dispatch]);

  return <>{children}</>;
}
