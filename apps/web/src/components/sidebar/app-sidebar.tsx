"use client";

import * as React from "react";

import { CompanyHeader } from "@/components/sidebar/company-header";
import { NavFirst } from "@/components/sidebar/nav-first";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  BookOpen,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
} from "lucide-react";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "First Menu",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Option One",
          url: "/dashboard/exemple-one",
        },
        {
          title: "Option Two",
          url: "/dashboard/exemple-two",
        },
        {
          title: "Option Three",
          url: "#",
        },
      ],
    },

    {
      title: "Second Menu",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Option One",
          url: "#",
        },
        {
          title: "Option Two",
          url: "#",
        },
        {
          title: "Option Three",
          url: "#",
        },
        {
          title: "Option Four",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Side Menu One",
      url: "#",
      icon: Frame,
    },
    {
      name: "Side Menu Two",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Side Menu Three",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyHeader icon={GalleryVerticalEnd} />
      </SidebarHeader>
      <SidebarContent>
        <NavFirst items={data.navMain} />
        <NavSecondary items={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
