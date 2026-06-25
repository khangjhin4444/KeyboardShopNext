import { UserService } from "../services/user.service";

export const UserUsecase = {
  userChangeInformation: ({
    address,
    name,
    phone,
  }: {
    address: string;
    name: string;
    phone: string;
  }) => UserService.userChangeInformation({ address, name, phone }),
};
