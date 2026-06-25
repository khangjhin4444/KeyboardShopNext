import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  convertToUserChangeInformationEntity,
  UserChangeInformationResponseEntity,
} from "../entities/user.entity";
import { p } from "motion/react-client";

type UserChangeInformation = ({
  address,
  name,
  phone,
}: {
  address: string;
  name: string;
  phone: string;
}) => Promise<UserChangeInformationResponseEntity>;

type UserService = {
  userChangeInformation: UserChangeInformation;
};

export const UserService: UserService = {
  userChangeInformation: async function ({ address, name, phone }) {
    try {
      const response = await fetchWithAuth("http://localhost:8000/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          name,
          phone,
        }),
      });
      return convertToUserChangeInformationEntity(response);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
