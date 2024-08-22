"use client";

import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { VerticalNavbar } from "./VerticalNavbar";

import {
  CalendarDays,
  CircleUser,
  GaugeCircle,
  LogOut,
  ShieldQuestion,
  ShieldQuestionIcon,
  ShoppingBag,
  Ticket,
  Users,
} from "lucide-react";

import MobxStore from "../mobx";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { observer } from "mobx-react";

// import logoImg from "../assets/pathway-logo.png";
import MobileHeader from "./MobileHeader";
// import { ClerkLoaded, ClerkLoading, SignedIn, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ui/themeButton";
import { mixInitials } from "@/src/util/utils";

export const NAVIGATION_LINKS = [
  {
    title: "Почетна",
    checkUrl: "Events",
    icon: Ticket,
    href: "pocetna",
  },
  {
    title: "Распоред",
    icon: CalendarDays,
    href: "schedule",
  },
  {
    title: "Професори",
    icon: Users,
    href: "professors",
  },

  {
    title: "Профил",
    icon: CircleUser,
    href: "profile",
  },
  {
    title: "Аналитика",
    icon: GaugeCircle,
    href: "analytics",
  },
  {
    title: "ИТ Поддршка",
    icon: ShieldQuestion,
    href: "support",
  },
  // {
  //   title: "Ценовник",
  //   icon: ShoppingBag,
  //   href: "pricing",
  // },
  {
    title: "Одјави се",
    icon: LogOut,
    href: "logout",
  },
];

const defaultLayout = [20, 80];

const ReusableLayout = observer(({ children }) => {
  const { isMobileOpen, setIsMobileOpen, user } = MobxStore;

  const pathname = usePathname();

  const isRoute = (route) => {
    if (route.checkUrl == "Events") {
      return pathname == "/" ? "default" : "ghost";
    }
    return pathname.endsWith(route.href.toLowerCase()) ? "default" : "ghost";
  };

  const navigationLinks = [...NAVIGATION_LINKS];
  if (user?.role === "professor") {
    navigationLinks.push({
      title: "Professor Admin",
      icon: ShieldQuestionIcon, // You can choose a different icon if needed
      href: "professor-admin",
    });
  }

  return (
    <div>
      <div className="hidden sm:block">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full max-h-[950px] items-stretch"
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            maxSize={20}
            className="h-[950px] min-w-[200px] max-w-[200px]"
          >
            <div className="flex flex-col items-center justify-center px-2">
              <div>{mixInitials(user)}</div>
              <div>{user?.name}</div>
              <div>student</div>
              <div>tokens: 5</div>
            </div>

            <VerticalNavbar
              links={navigationLinks.map((link) => ({
                ...link,
                variant: isRoute(link),
              }))}
            />
          </ResizablePanel>

          <ResizablePanel
            className="border-gray-[#e5e7eb] border-l"
            defaultSize={defaultLayout[1]}
            minSize={30}
            style={{ overflow: "auto" }}
          >
            <div>
              <div className="">{children}</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="block sm:hidden">
        <MobileHeader />
        {children}
      </div>
    </div>
  );
});

export default ReusableLayout;
