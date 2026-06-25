import { UserChangeInformationResponseModel } from "../models/user.model";

export interface UserChangeInformationResponseEntity {
  success: boolean;
  message: string;
}

export function convertToUserChangeInformationEntity(
  responseModel: UserChangeInformationResponseModel,
): UserChangeInformationResponseEntity {
  return {
    success: responseModel.success,
    message: responseModel.message,
  };
}
