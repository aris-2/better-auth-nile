"use client";

import {
  LogOut,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { client } from "@/lib/auth-client"
import { useState } from "react";
import { useRouter } from "next/navigation";






export function NavUser({
  user,
}: {
  user:any
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState<boolean>(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <CaretSortIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Button
					className="w-full"
					variant="secondary"
					onClick={async () => {
						setIsSignOut(true);
						await client.signOut({
							fetchOptions: {
								onSuccess() {
									router.push("/");
								},
							},
						});
						setIsSignOut(false);
					}}
					disabled={isSignOut}
				>
					<span className="text-sm">
						{isSignOut ? (
							<Loader2 size={15} className="animate-spin" />
						) : (
							<div className="flex items-center gap-2">
								<LogOut size={16} />
								Sign Out
							</div>
						)}
					</span>
				</Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
