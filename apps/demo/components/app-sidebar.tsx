"use client"

import * as React from "react"
import {
  UserRoundCog,
  Settings2,
  Braces,
  ListChecks
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {client}  from "@/lib/auth-client" // import the auth client

const menuList=[
    {
      name: "Api Data View ",
      url: "/private",
      icon: Braces,
    },
    {
      name: "Todo Demo ",
      url: "/private/todo",
      icon: ListChecks,
    },
    {
      name: "Admin",
      url: "/private/admin",
      icon: UserRoundCog,
    },
    {
      name: "Settings",
      url: "/private/settings",
      icon: Settings2,
    },
  ]


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    data: session, 
  } = client.useSession()


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
         <TeamSwitcher />
        
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={menuList} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
