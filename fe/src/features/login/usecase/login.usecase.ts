import { LoginService } from "../services/login.service";

export const LoginUsecase = {
  checkUsername: (username: string) => {
    return LoginService.checkUsername(username);
  },
};
