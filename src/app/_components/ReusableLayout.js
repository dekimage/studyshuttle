"use client";

import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { VerticalNavbar } from "./VerticalNavbar";

import {
  Activity,
  CalendarDays,
  CalendarRange,
  CircleUser,
  FolderLock,
  GaugeCircle,
  GraduationCap,
  Headphones,
  LogOut,
  ShieldQuestion,
  ShieldQuestionIcon,
  ShoppingBag,
  Ticket,
  UserRound,
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
import { FaChartBar } from "react-icons/fa";

export const NAVIGATION_LINKS = [
  {
    title: "Почетна",
    // checkUrl: "Events",
    icon: Activity,
    href: "pocetna",
  },
  {
    title: "Распоред",
    icon: CalendarRange,
    href: "schedule",
  },
  {
    title: "Професори",
    icon: GraduationCap,
    href: "professors",
  },

  {
    title: "Профил",
    icon: UserRound,
    href: "profile",
  },
  {
    title: "Аналитика",
    icon: FaChartBar,
    href: "analytics",
  },
  {
    title: "ИТ Поддршка",
    icon: Headphones,
    href: "support",
  },
  {
    title: "Одјави се",
    icon: LogOut,
    action: "logout",
    // href: "logout",
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
    return pathname.endsWith(route.href?.toLowerCase()) ? "default" : "ghost";
  };

  const navigationLinks = [...NAVIGATION_LINKS];
  if (user?.role === "professor") {
    navigationLinks.push({
      title: "Professor Admin",
      icon: FolderLock,
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
            className="h-screen min-w-[290px] max-w-[345px]"
          >
            <div className="flex flex-col items-center justify-center px-2">
              <div className="my-6 flex h-[95px] w-[95px] items-center justify-center rounded-full bg-chili">
                <div className="text-[45px] text-white">
                  {mixInitials(user)}
                </div>
              </div>

              <div className="mb-4 text-[25px] font-bold">{user?.name}</div>
              <div className="my-2 font-bold text-darkGrey">Студент</div>
              <div className="font-bold text-darkGrey">
                Токени: {user?.yellowTokens || 0}
              </div>
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
