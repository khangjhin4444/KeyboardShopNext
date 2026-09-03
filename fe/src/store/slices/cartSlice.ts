import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  quantity: number;
}

export const cartSlice = createSlice({
  name: "cart",
  initialState: {
    quantity: 0,
  } as CartState,
  reducers: {
    addToCart: (state, action: PayloadAction<number>) => {
      state.quantity += action.payload;
    },
    updateQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
    },
  },
});

export const { addToCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
