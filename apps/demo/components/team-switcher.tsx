"use client"
import { Skeleton } from "@/components/ui/skeleton"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CaretSortIcon, PlusIcon } from "@radix-ui/react-icons"
import { GalleryVerticalEnd } from "lucide-react"

import {client}  from "@/lib/auth-client" // import the auth client

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {CreateOrganizationDialog} from "@/components/create-organization-dialog"
export function TeamSwitcher() {

  const {
    data:teams, 
    isPending:isPendingOrg, 
  } = client.useListOrganizations()
  
  const {
    data:activeTeam, 
    isPending:isPendingActiveTenant, 
  } = client.useActiveOrganization()

  const { isMobile } = useSidebar()
  

  return (
    <div>
  
      <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={activeTeam?.logo ?? ""} />
                <AvatarFallback className="rounded-lg bg-blue-700">
                  <GalleryVerticalEnd className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam?.name ?? "No active Tenant"}
                </span>
              </div>
              <CaretSortIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams?.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={()=>{ 
                  client.organization.setActive(
                    {organizationId: team?.id}
                  )
                }}
                className="gap-2 p-2"
              >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={activeTeam?.logo ?? ""} />
                <AvatarFallback className="rounded-lg bg-blue-700">
                  <GalleryVerticalEnd className="size-4" />
                </AvatarFallback>
              </Avatar>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <CreateOrganizationDialog/>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    </div>
    
  )
}
