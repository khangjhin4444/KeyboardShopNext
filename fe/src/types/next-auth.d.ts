import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      cartQuantity: number;
      Address: string;
      Name: string;
      Phone: string;
    } & DefaultSession["user"];
    accessToken: string;
    error?: string;
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    cartQuantity: number;
    Address: string;
    Name: string;
    Phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
    cartQuantity: number;
    Address: string;
    Name: string;
    Phone: string;
  }
}
