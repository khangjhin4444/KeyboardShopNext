// file: src/lib/fetchWithAuth.ts

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  // Lần gọi API đầu tiên
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Nếu bị lỗi 401 (Hết hạn Access Token)
  if (response.status === 401) {
    console.log("Token hết hạn, tự động refresh...");
    const refreshRes = await fetch("http://localhost:8000/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Ép gửi kèm Cookie chứa Refresh Token
    });

    if (refreshRes.ok) {
      const { accessToken: newAccessToken } = await refreshRes.json();
      localStorage.setItem("accessToken", newAccessToken);

      // Tái thực hiện lại request ban đầu với Token mới
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    } else {
      // Nếu refresh cũng thất bại (quá 7 ngày), ném ra mã lỗi đặc biệt
      throw new Error("SESSION_EXPIRED");
    }
  }

  // Nếu lỗi khác (500, 404...)
  if (!response.ok) {
    // throw new Error("Lấy dữ liệu thất bại");
    const res = await response.json();
    console.log(res);
  }

  return response.json();
};
