"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
export default function Sorting() {
  const [nameSort, setNameSort] = useState("default");
  const [priceSort, setPriceSort] = useState("default");
  return (
    <div className=" flex flex-col gap-5 md:flex-row mt-10 items-center md:pl-5">
      <p className="text-xl font-semibold">Sort by: </p>
      <div className="flex flex-row items-center lg:ml-10  gap-6 ">
        <p className="text-xl">Name:</p>
        <Select
          value={nameSort}
          onValueChange={(value) => {
            setNameSort(value);
            setPriceSort("default");
          }}
        >
          <SelectTrigger className="md:w-45 text-xl p-5">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent position={"popper"}>
            <SelectGroup>
              <SelectItem value="asc" className="text-lg">
                A-Z
              </SelectItem>
              <SelectItem value="desc" className="text-lg">
                Z-A
              </SelectItem>
              <SelectItem value="default" className="text-lg">
                Default
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row items-center lg:ml-10 gap-6 ">
        <p className="text-xl">Price:</p>
        <Select
          value={priceSort}
          onValueChange={(value) => {
            setPriceSort(value);
            setNameSort("default");
          }}
        >
          <SelectTrigger className="md:w-45 text-xl p-5">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent position={"popper"}>
            <SelectGroup>
              <SelectItem value="asc" className="text-lg">
                Low to High
              </SelectItem>
              <SelectItem value="desc" className="text-lg">
                High to Low
              </SelectItem>
              <SelectItem value="default" className="text-lg">
                Default
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
