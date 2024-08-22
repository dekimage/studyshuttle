"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "@/components/ui/button";
import MobxStore from "../mobx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRef, useState } from "react";

const DialogLogout = ({ setDialogOpen, link }) => {
  const { logout } = MobxStore;
  const ref = useRef();
  return (
    <Dialog>
      <DialogTrigger ref={ref}>
        <div
          className={cn(
            buttonVariants({ variant: link.variant, size: "sm" }),
            link.variant === "default" &&
              "rounded-full bg-sky hover:bg-sky dark:hover:text-white",
            "my-2 w-full justify-start",
          )}
        >
          {link.variant === "default" ? (
            <div className="ml-[-12px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-sky shadow-lg">
              <link.icon className=" h-6 w-6 text-white" />
            </div>
          ) : (
            <link.icon className="mr-4 h-6 w-6 text-sky" />
          )}

          <div className="ml-4 text-[15px] font-bold">{link.title}</div>
          {link.label && (
            <span
              className={cn(
                "ml-auto",
                link.variant === "default" && "text-background dark:text-white",
              )}
            >
              {link.label}
            </span>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Дали сакате да се одјавите?</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button
            className="bg-darkGrey hover:bg-darkGrey"
            onClick={() => ref.current?.click()}
          >
            Врати се назад
          </Button>
          <Button onClick={logout} className="bg-sky hover:bg-sky">
            Одјави се
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function VerticalNavbar({ links }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="group flex w-full flex-col gap-4 py-8">
      <nav className="grid gap-1 px-8">
        {links.map((link, index) => {
          if (link.action == "logout") {
            return (
              <DialogLogout
                link={link}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                setDialogOpen={setDialogOpen}
              />
            );
          }

          return (
            <Link
              onClick={() => {
                link.callBack && link.callBack();
                link.action == "logout" && setDialogOpen(true);
              }}
              key={index}
              href={link.action == "logout" ? "/" : `/${link.href}`}
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                  "rounded-full bg-sky hover:bg-sky dark:hover:text-white",
                "my-2 justify-start",
              )}
            >
              {link.variant === "default" ? (
                <div className="ml-[-12px] flex h-[45px] w-[45px] items-center justify-center rounded-full bg-sky shadow-lg">
                  <link.icon className=" h-6 w-6 text-white" />
                </div>
              ) : (
                <link.icon className="mr-4 h-6 w-6 text-sky" />
              )}

              <div className="ml-4 text-[15px] font-bold">{link.title}</div>
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                      "text-background dark:text-white",
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
