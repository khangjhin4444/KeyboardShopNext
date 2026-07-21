"use client";
import {
  CircleUserRound,
  ReceiptText,
  Search,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutIcon, UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import EditProfileForm from "./edit-profile-form";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuth = !!session?.user;
  const user = session?.user;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  return (
    <header className="w-full bg-[#8CC0EB] dark:bg-black flex flex-col justify-center pb-5 items-center">
      <h1 className="text-4xl mt-6 font-bold text-[#FFEBCC] dark:text-zinc-50">
        JK Keyboards
      </h1>
      <div className="flex flex-row w-full justify-around  items-center">
        <div className="flex-1 flex justify-center">
          <Image
            className=" object-contain rounded-[50%] cursor-pointer"
            src="/logo.png"
            alt="Logo"
            width={60}
            height={60}
            onClick={() => {
              router.push("/home");
            }}
          />
        </div>

        <div className="flex-1 relative w-full flex justify-center ">
          <input
            type="text"
            className="w-full py-2 px-3 bg-[#f9f7ee] rounded-[40px] my-6 dark:bg-black text-[#170C79] dark:text-zinc-50 placeholder:text-[#170C79] dark:placeholder:text-zinc-50  focus:outline-none placeholder:text-[13px] md:placeholder:text-[16px]"
            placeholder="Search items..."
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter" && keyword !== "") {
                router.push(`/search/${keyword}`);
              }
            }}
          />
          <div>
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => {
                if (keyword !== "") {
                  router.push(`/search/${keyword}`);
                }
              }}
            >
              <Search className="w-4 h-4 md:w-7 md:h-7" />
            </button>
          </div>
        </div>
        <div className="flex-1  flex-row items-center gap-7 flex justify-center">
          <button
            onClick={() => router.push("/cart")}
            className="relative cursor-pointer"
          >
            <ShoppingCart className="w-8 h-8 text-[#FFEBCC]" />
            <div
              className={clsx(
                "absolute select-none -right-2 -top-2 bg-gray-300 rounded-full p-2 w-6 h-6  items-center flex justify-center font-bold",
                { hidden: !user },
              )}
            >
              {user?.cartQuantity}
            </div>
          </button>
          <button
            className="hidden md:flex justify-center font-semibold text-[#FFEBCC] cursor-pointer items-center"
            onClick={() => router.push("/orders")}
          >
            <ReceiptText className="mr-2 h-7 w-7" />
            Orders
          </button>

          {isAuth ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <CircleUserRound className="text-[#FFEBCC] w-8 h-8 cursor-pointer" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-30">
                  <DropdownMenuGroup>
                    <DialogTrigger asChild>
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </DialogTrigger>

                    <DropdownMenuItem
                      className="flex md:hidden"
                      onClick={() => router.push("/orders")}
                    >
                      <ReceiptText className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        signOut({ callbackUrl: "/login" });
                      }}
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>

                <EditProfileForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          ) : (
            <button onClick={() => router.push("/login")}>
              <CircleUserRound className="text-white w-8 h-8 cursor-pointer" />
            </button>
          )}
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-row">
        <Link
          href="/home"
          className={clsx("text-[#FFEBCC] dark:text-zinc-50  mx-4", {
            underline: pathname === "/home",
            "font-bold": pathname === "/home",
          })}
        >
          <p className="text-lg select-none">Home</p>
        </Link>
        <Link
          href="/about"
          className={clsx("text-[#FFEBCC] dark:text-zinc-50  mx-4", {
            underline: pathname === "/about",
            "font-bold": pathname === "/about",
          })}
        >
          <p className="text-lg select-none">About</p>
        </Link>
        <Link
          href="/contact"
          className={clsx("text-[#FFEBCC] dark:text-zinc-50  mx-4", {
            underline: pathname === "/contact",
            "font-bold": pathname === "/contact",
          })}
        >
          <p className="text-lg">Contact</p>
        </Link>
      </div>
    </header>
  );
}
