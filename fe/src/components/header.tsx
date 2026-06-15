"use client";
import { CircleUser, Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full bg-[#8CC0EB] dark:bg-black flex flex-col justify-center pb-5 items-center">
      <h1 className="text-4xl mt-6 font-bold text-[#FFEBCC] dark:text-zinc-50">
        JK Keyboards
      </h1>
      <div className="flex flex-row w-full justify-around items-center">
        <Image
          className="object-contain rounded-[50%] "
          src="/logo.png"
          alt="Logo"
          width={60}
          height={60}
        />
        <div className="relative w-[50%] flex justify-center ">
          <input
            type="text"
            className="w-full py-2 px-5 bg-[#f9f7ee] rounded-[40px] my-6 dark:bg-black text-[#170C79] dark:text-zinc-50 placeholder:text-[#170C79] dark:placeholder:text-zinc-50  focus:outline-none "
            placeholder="Search items..."
          />
          <div>
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
              <Search />
            </button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-7">
          <button>
            <ShoppingCart className="w-8 h-8 text-[#FFEBCC]" />
          </button>
          <button className=" cursor-pointer">
            <CircleUser className="w-8 h-8 text-[#FFEBCC]" />
          </button>
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
          <p className="text-lg ">Home</p>
        </Link>
        <Link
          href="/about"
          className={clsx("text-[#FFEBCC] dark:text-zinc-50  mx-4", {
            underline: pathname === "/about",
            "font-bold": pathname === "/about",
          })}
        >
          <p className="text-lg">About</p>
        </Link>
        <Link
          href="/services"
          className={clsx("text-[#FFEBCC] dark:text-zinc-50  mx-4", {
            underline: pathname === "/services",
            "font-bold": pathname === "/services",
          })}
        >
          <p className="text-lg">Services</p>
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
