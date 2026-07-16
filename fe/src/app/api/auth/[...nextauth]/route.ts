import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
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
          // Trả về dữ liệu để lưu vào token của NextAuth
          return {
            id: data.user.id,
            username: data.user.username,
            role: data.user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            cartQuantity: data.user.cartQuantity,
            Address: data.user.Address,
            Name: data.user.Name,
            Phone: data.user.Phone,
            // Thêm mốc thời gian hết hạn của Access Token (15 phút)
            accessTokenExpires: Date.now() + 15 * 60 * 1000,
          };
        }
        throw new Error(data.message || "Đăng nhập thất bại");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Lần đầu đăng nhập: Lưu thông tin từ authorize() vào token
      if (user) {
        return {
          ...token,
          id: user.id,
          username: user.username,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          cartQuantity: user.cartQuantity,
          Address: user.Address,
          Name: user.Name,
          Phone: user.Phone,
        };
      }
      if (trigger === "update" && session) {
        // Cập nhật các giá trị mới vào token
        if (session.cartQuantity !== undefined)
          token.cartQuantity = session.cartQuantity;
        if (session.Name !== undefined) token.Name = session.Name;
        if (session.Phone !== undefined) token.Phone = session.Phone;
        if (session.Address !== undefined) token.Address = session.Address;
      }
      // 2. Token vẫn còn hạn (cộng thêm 1 chút thời gian bù trừ mạng)
      if (Date.now() < (token.accessTokenExpires as number) - 10000) {
        return token;
      }

      // 3. Token hết hạn: Gọi API Express để lấy Access Token mới
      try {
        const res = await fetch(`/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });

        const tokens = await res.json();

        if (!res.ok || !tokens.success) throw new Error("RefreshTokenError");

        return {
          ...token,
          accessToken: tokens.accessToken,
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
        username: token.username as string,
        role: token.role as string,
        cartQuantity: token.cartQuantity as number,
        Address: token.Address as string,
        Phone: token.Phone as string,
        Name: token.Name as string,
      };
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
