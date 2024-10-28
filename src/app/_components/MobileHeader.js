import { Button } from "@/components/ui/button";
import { MenuIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import MobxStore from "../mobx";
import { observer } from "mobx-react";
import { VerticalNavbar } from "./VerticalNavbar";
import { usePathname } from "next/navigation";
import { NAVIGATION_LINKS } from "./ReusableLayout";

const MobileHeader = observer(() => {
  const { isMobileOpen, setIsMobileOpen } = MobxStore;

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const pathname = usePathname();
  const isRoute = (route) => {
    if (route == "Events" && pathname == "/") {
      return "default";
    }
    return pathname.endsWith(route.toLowerCase()) ? "default" : "ghost";
  };

  return (
    <div className="relative z-50 flex h-[52px] items-center justify-between border-b border-gray-200 p-4">
      <div className="font-bold">Study Shuttle</div>
      <Button onClick={toggleMenu} className="p-2">
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MenuIcon className="h-6 w-6" />
        )}
      </Button>

      {isMobileOpen && (
        <div className="absolute left-0 top-[52px] flex h-screen w-full flex-col items-start bg-white p-4">
          {/* List of menu items */}
          <VerticalNavbar
            links={NAVIGATION_LINKS.map((link) => ({
              ...link,
              variant: isRoute(link.title),
              callBack: () => setIsMobileOpen(false),
            }))}
          />
        </div>
      )}
    </div>
  );
});

export default MobileHeader;
