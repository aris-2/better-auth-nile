"use client"

import * as React from "react"
import {
  UserRoundCog,
  Settings2,
  Braces,
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
import { Skeleton } from "@/components/ui/skeleton"
const datas = {
  projects: [
    {
      name: "Api Data View ",
      url: "/private/",
      icon: Braces,
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    data: session, 
    isPending, 
    error 
  } = client.useSession()



  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
         <TeamSwitcher />
        
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={datas.projects} />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? 
          <Skeleton className="h-8 w-[230px] rounded-sm" />
          : 
          <NavUser user={session?.user} 
          />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
