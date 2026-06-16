// file: src/app/(public)/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle giữa Login và Signup
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // States cho Form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const loginAction = useUserStore((state) => state.login);

  // Xử lý Gửi Form Đăng Nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        // Lưu Access Token vào localStorage để dễ dàng lấy ra đính kèm vào API
        localStorage.setItem("accessToken", data.accessToken);
        loginAction(data.user);
        console.log("Login", data.user);
        router.push("/home"); // Chuyển vào vùng private
      } else {
        setErrorMsg(data.message || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối đến máy chủ");
      console.log("eer:", err);
    }
  };

  // Xử lý Gửi Form Đăng Ký
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName }), // Bổ sung các field cần thiết
      });
      const data = await res.json();

      if (data.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true); // Tự động chuyển về form đăng nhập
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối đến máy chủ");
      console.log("ee", err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans">
      {/* Cột trái: Hình ảnh */}
      <div className="hidden lg:block lg:w-5/12 h-full">
        <img
          className="w-full h-full object-cover"
          src="/taco-bg.webp" // Thay bằng ảnh của bạn trong folder public
          alt="Background"
        />
      </div>

      {/* Cột phải: Nội dung Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? "Welcome back" : "Hey there"}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? "New to App? " : "Already know App? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#3B9AB8] underline font-medium hover:text-blue-700 transition"
              >
                {isLogin ? "Sign up" : "Log In"}
              </button>
            </p>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-center mb-4">{errorMsg}</p>
          )}

          <form
            onSubmit={isLogin ? handleLogin : handleSignup}
            className="space-y-6"
          >
            {!isLogin && (
              <div>
                <label className="block text-gray-800 text-lg mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-gray-800 text-lg mb-2">
                User name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-800 text-lg mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username || !password || (!isLogin && !fullName)}
              className="w-full py-3 bg-[#3B9AB8] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <button className="text-[#3B9AB8] underline text-sm hover:text-blue-700">
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
