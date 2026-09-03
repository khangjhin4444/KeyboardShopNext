import {
  UserChangeInformationResponseModel,
  UserInformationResponseModel,
} from "../models/user.model";

export interface UserChangeInformationResponseEntity {
  success: boolean;
  message: string;
}

export interface UserInformationEntity {
  Name: string;
  Address: string;
  Phone: string;
  Role: "user" | "admin";
  cartQuantity: number;
}

export function convertToUserInformationEntity(
  responseModel: UserInformationResponseModel,
): UserInformationEntity {
  return {
    Name: responseModel.data.Name,
    Address: responseModel.data.Address,
    Phone: responseModel.data.Phone,
    Role: responseModel.data.Role,
    cartQuantity: responseModel.data.cartQuantity,
  };
}

export function convertToUserChangeInformationEntity(
  responseModel: UserChangeInformationResponseModel,
): UserChangeInformationResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
  };
}
