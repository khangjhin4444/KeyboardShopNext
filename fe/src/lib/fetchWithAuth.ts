const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
import { getSession, signOut } from "next-auth/react";
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const session = await getSession();

  if (!session || !session.accessToken) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.error === "RefreshAccessTokenError") {
    await signOut({ callbackUrl: "/login" });
    throw new Error("SESSION_EXPIRED");
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error:", errorData);
    throw new Error(errorData.message || "Lấy dữ liệu thất bại");
  }

  return response.json();
};
