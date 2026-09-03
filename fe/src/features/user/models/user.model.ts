export interface UserChangeInformationResponseModel {
  success: boolean;
  message: string;
}
export interface UserInformationResponseModel {
  success: boolean;
  data: {
    Name: string;
    Phone: string;
    Address: string;
    Role: "user" | "admin";
    cartQuantity: number;
  };
}
