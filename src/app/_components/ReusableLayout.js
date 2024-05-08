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

export const NAVIGATION_LINKS = [
  {
    title: "Часови",
    checkUrl: "Events",
    icon: Ticket,
    href: "",
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
    title: "Извештаи",
    icon: GaugeCircle,
    href: "reports",
  },
  {
    title: "Профил",
    icon: CircleUser,
    href: "profile",
  },
  {
    title: "ИТ Поддршка",
    icon: ShieldQuestion,
    href: "support",
  },
  {
    title: "Ценовник",
    icon: ShoppingBag,
    href: "pricing",
  },
  {
    title: "Одјави се",
    icon: LogOut,
    href: "logout",
  },
];

const defaultLayout = [20, 80];

const ReusableLayout = observer(({ children }) => {
  const { isMobileOpen, setIsMobileOpen } = MobxStore;
  const handleSignIn = async () => {
    await signInAnonymously();
  };
  const pathname = usePathname();
  const isRoute = (route) => {
    if (route.checkUrl == "Events") {
      return pathname == "/" ? "default" : "ghost";
    }
    return pathname.endsWith(route.href.toLowerCase()) ? "default" : "ghost";
  };

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
            <div className="flex h-[52px] items-center justify-center px-2">
              {/* <Image src={logoImg} width={32} height={32} alt="logo" /> */}
              <div className="ml-1 text-2xl font-bold">Study Shuttle</div>
            </div>
            <Separator />
            <VerticalNavbar
              links={NAVIGATION_LINKS.map((link) => ({
                ...link,
                variant: isRoute(link),
              }))}
            />
            <Separator />
          </ResizablePanel>

          <ResizablePanel
            className="border-gray-[#e5e7eb] border-l"
            defaultSize={defaultLayout[1]}
            minSize={30}
            style={{ overflow: "auto" }}
          >
            <div>
              <div className="flex h-[53px] w-full items-center justify-end gap-4 border-b p-2">
                <ModeToggle />
                <>
                  {/* <ClerkLoading>
                    <div> Logging in... </div>
                  </ClerkLoading>
                  <ClerkLoaded>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </ClerkLoaded> */}
                </>
              </div>
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
