"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import AuthInitializer from "@/components/authInitializer";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
