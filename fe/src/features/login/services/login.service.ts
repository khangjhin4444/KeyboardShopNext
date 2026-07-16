import {
  CheckUsernameEntity,
  convertToCheckUsernameEntity,
} from "../entities/login.entity";

type CheckUsername = (username: string) => Promise<CheckUsernameEntity>;

type LoginService = {
  checkUsername: CheckUsername;
};
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const LoginService: LoginService = {
  checkUsername: async function (username: string) {
    try {
      const result = await fetch(
        `${API_URL}/api/auth/check?username=${username}`,
        {
          method: "GET",
        },
      );

      const data = await result.json();
      return convertToCheckUsernameEntity(data);
    } catch (error) {
      throw Error;
    }
  },
};
