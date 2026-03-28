"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import { useLogOut } from "@/hooks/useAuth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UserMenu({
  email,
  name = "",
}: {
  email: string | undefined;
  name?: string | undefined;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOutMutation } = useLogOut();

  if (!email) {
    return null;
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={""} />
          <AvatarFallback>
            {email
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <form className="w-full">
          <button
            onClick={() => signOutMutation.mutate()}
            className="flex w-full"
          >
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
