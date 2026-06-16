import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ChevronDown } from "lucide-react";
export default function Category() {
  const data = [
    {
      type: "Keyboard Kit",
      options: ["Full Size", "TKL", "75% or less", "Alice"],
    },
    {
      type: "Keycap",
      options: ["Profile Cherry", "Profile MDA", "Profile SA", "Artisan"],
    },
    {
      type: "Switch",
      options: ["Linear", "Tactile", "Clicky", "Silent"],
    },
    {
      type: "Prebuild",
      options: ["Full Size", "TKL", "75% or less", "Alice"],
    },
  ];
  return (
    <div className="justify-around items-center w-full flex flex-row mt-5">
      {data.map((item) => (
        <DropdownMenu key={item.type}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-xl p-4">
              {item.type}
              <span>
                <ChevronDown />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.options.map((opt) => (
              <DropdownMenuItem key={opt} className="text-lg">
                {opt}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}
