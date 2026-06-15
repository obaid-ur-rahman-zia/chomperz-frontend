"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "font-bold !bg-[#2b332d] !border-2 !border-[#3a453d] !text-[#f5f6fa] !shadow-lg",
          title: "font-extrabold",
          description: "font-bold text-[#a4b0af]",
          closeButton: "!bg-[#3a453d] !border-[#3a453d] !text-white",
        },
      }}
    />
  );
}
