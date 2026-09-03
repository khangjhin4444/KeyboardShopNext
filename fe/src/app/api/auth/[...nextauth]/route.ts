import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          return {
            id: data.user.id,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,

            accessTokenExpires: Date.now() + 15 * 60 * 1000,
          };
        }
        throw new Error(data.message || "Đăng nhập thất bại");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account, profile }) {
      // 1. Lần đầu đăng nhập: Lưu thông tin từ authorize() vào token
      if (user && account?.provider === "credentials") {
        return {
          ...token,
          id: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
        };
      }

      if (account?.provider === "google" && profile) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
          const res = await fetch(`${backendUrl}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            return {
              ...token,
              id: data.user.id,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              accessTokenExpires: Date.now() + 15 * 60 * 1000,
            };
          }
        } catch (error) {
          console.error("Lỗi đồng bộ Google với Backend:", error);
        }
      }

      if (Date.now() < (token.accessTokenExpires as number) - 10000) {
        return token;
      }

      // 3. Token hết hạn: Gọi API Express để lấy Access Token mới (Token Rotation)
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
        const res = await fetch(`${backendUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });

        const tokens = await res.json();

        if (!res.ok || !tokens.success) throw new Error("RefreshTokenError");

        return {
          ...token,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken, // Lưu refresh token MỚI từ rotation
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
        };
      } catch (error) {
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },

    async session({ session, token }) {
      // Đẩy dữ liệu từ jwt ra session để Client (React) dùng được
      session.user = {
        id: token.id as string,
        // username: token.username as string,
        // role: token.role as string,
        // cartQuantity: token.cartQuantity as number,
        // Address: token.Address as string,
        // Phone: token.Phone as string,
        // Name: token.Name as string,
      };
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  events: {
    // Khi signOut, gọi API backend để revoke refresh token trong DB
    async signOut({ token }) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });
      } catch (error) {
        console.error("Logout backend error:", error);
      }
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
