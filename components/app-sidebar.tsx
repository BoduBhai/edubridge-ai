"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import BrandLogo from "@/components/BrandLogo";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GaugeIcon,
  HandCoinsIcon,
  SchoolIcon,
  UserRoundIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";

const navItems = [
  {
    title: "Dashboard",
    key: "dashboard",
    href: "/dashboard",
    icon: <GaugeIcon />,
  },
  {
    title: "My Profile",
    key: "profile",
    href: "/dashboard?section=profile",
    icon: <UserRoundIcon />,
  },
  {
    title: "Universities",
    key: "universities",
    href: "/dashboard?section=universities",
    icon: <SchoolIcon />,
  },
  {
    title: "Scholarships",
    key: "scholarships",
    href: "/dashboard?section=scholarships",
    icon: <HandCoinsIcon />,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const currentSection = searchParams.get("section") ?? "dashboard";

  const userInfo = {
    name:
      user?.fullName ||
      user?.username ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      "User",
    email: user?.primaryEmailAddress?.emailAddress ?? "No email",
    avatar: user?.imageUrl ?? "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <BrandLogo
          size="md"
          className="[&>div:first-child]:text-primary-foreground [&>div:last-child>span:first-child]:text-primary-foreground [&>div:last-child>span:last-child]:text-primary-foreground px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:[&>div:last-child]:hidden"
        />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem className="py-2" key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary data-[active=true]:hover:bg-sidebar-accent data-[active=true]:hover:text-primary"
                  isActive={
                    pathname === "/dashboard" && currentSection === item.key
                  }
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <NavUser user={userInfo} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
