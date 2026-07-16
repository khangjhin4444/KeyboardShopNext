import { CheckUsernameResponseModel } from "../models/login.model";

export type CheckUsernameEntity = {
  exist: boolean;
  message: string;
};

export const convertToCheckUsernameEntity = (
  responseModel: CheckUsernameResponseModel,
): CheckUsernameEntity => {
  return {
    exist: responseModel.exist,
    message: responseModel.message,
  };
};
