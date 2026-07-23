"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react"; // Import thêm ArrowLeft cho nút Back
import { signIn } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoginUsecase } from "@/features/login/usecase/login.usecase";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle cho confirm password
  const [errorMsg, setErrorMsg] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const checkUsernameMutation = useMutation({
    mutationFn: () => LoginUsecase.checkUsername(username),
  });
  // State quản lý bước đăng ký (1 hoặc 2)
  const [signupStep, setSignupStep] = useState(1);

  // Hàm chuyển đổi Login/Signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setSignupStep(1); // Reset lại bước 1 khi đổi mode
    setErrorMsg("");
  };

  const handleNextStep = async () => {
    setErrorMsg("");
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{10,20}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg("Invalid Password");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Password confirmation failed!");
      return;
    }
    try {
      const res = await checkUsernameMutation.mutateAsync();
      console.log(res);
      if (res.exist) {
        setErrorMsg("Username exist!");
        return;
      }

      setSignupStep(2);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message);
      console.error(error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.push("/home");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Fail to connect server");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName, phone, address }),
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
      if (data.success) {
        alert("Sign Up success, please Log In");
        setIsLogin(true);
        setSignupStep(1);
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg("Fail to connect server ");
      console.log(err);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans">
      {/* Cột trái: Hình ảnh */}
      <div className="hidden lg:block lg:w-5/12 h-full">
        <img
          className="w-full h-full object-cover"
          src="/taco-bg.webp"
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
                onClick={toggleAuthMode}
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
            {/* ----------------- GIAO DIỆN LOGIN ----------------- */}
            {isLogin && (
              <>
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
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!username || !password}
                  className="w-full py-3 bg-[#3B9AB8] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Login
                </button>
              </>
            )}

            {/* ----------------- GIAO DIỆN SIGNUP ----------------- */}
            {!isLogin && signupStep === 1 && (
              <>
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
                  <label className="block text-gray-800 text-lg mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <ul className="text-gray-500 text-sm list-disc ml-6 mt-1">
                    <li>Password length 10-20 characters</li>
                    <li>Contains atleast 1 Uppercase letter</li>
                    <li>Contains atleast 1 Number</li>
                  </ul>
                </div>
                <div>
                  <label className="block text-gray-800 text-lg mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!username || !password || !confirmPassword}
                  className="w-full py-3 bg-[#3B9AB8] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </>
            )}

            {!isLogin && signupStep === 2 && (
              <>
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
                <div>
                  <label className="block text-gray-800 text-lg mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                    placeholder="0123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-800 text-lg mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3B9AB8]"
                    placeholder="Your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="w-1/3 py-3 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    <ArrowLeft size={20} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={!fullName}
                    className="w-2/3 py-3 bg-[#3B9AB8] text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}

            {/* Nút đăng nhập Google luôn hiển thị */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/home" })}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              <img
                src="https://authjs.dev/img/providers/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              {isLogin ? "Sign in with Google" : "Sign up with Google"}
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
