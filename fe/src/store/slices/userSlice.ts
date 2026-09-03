import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  Address: string;
  Name: string;
  Phone: string;
  Role: "user" | "admin";
}

const initialState: UserState = {
  Address: "",
  Name: "",
  Phone: "",
  Role: "user",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initUserInfo: (state, action: PayloadAction<UserState>) => {
      state.Address = action.payload.Address;
      state.Name = action.payload.Name;
      state.Phone = action.payload.Phone;
      state.Role = action.payload.Role;
    },
    setUserInfo: (state, action: PayloadAction<Omit<UserState, "Role">>) => {
      state.Address = action.payload.Address;
      state.Name = action.payload.Name;
      state.Phone = action.payload.Phone;
    },
  },
});

export const { setUserInfo, initUserInfo } = userSlice.actions;
export default userSlice.reducer;
