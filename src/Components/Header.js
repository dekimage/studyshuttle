"use client";
import Image from "next/image";
import logoImg from "../assets/logo.png";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { CtaDialog } from "../app/page";

export const Header = () => {
  const [isHovering, setIsHovering] = useState(false);
  const pathname = usePathname();

  const isObrazovanie =
    pathname.includes("osnovno") ||
    pathname.includes("sredno") ||
    pathname.includes("univerzitet");

  const isOsnovno = pathname.includes("osnovno");
  const isSredno = pathname.includes("sredno");
  const isUniverzitet = pathname.includes("univerzitet");

  const isSkolarina = pathname.includes("skolarina");
  const isProfesori = pathname.includes("profesori");

  return (
    <div
      className="flex h-[100px] w-full justify-between px-8 lg:h-[147px] lg:px-32"
      style={{
        boxShadow:
          "0 3px 2px -3px rgba(0, 0, 0, 0.1), 0 4px 1px 0px rgba(0, 0, 0, 0.02)",
      }}
    >
      <Link href="/" className="flex items-center justify-center">
        <Image
          src={logoImg}
          width={200}
          height={200}
          alt="logo"
          className="w-[100px] lg:w-[147px]"
        />
      </Link>
      <div className="flex cursor-pointer items-center justify-center lg:hidden">
        <Menu size={48} />
      </div>
      <div className="hidden flex-grow items-center justify-end gap-8 lg:flex">
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className="rounded-full px-3 text-[20px] font-bold text-sky hover:opacity-70"
            style={
              isObrazovanie
                ? { color: "#ed1b31", borderBottom: "2px solid #ed1b31" }
                : {}
            }
          >
            Образование
          </div>
          {isHovering && (
            <div className="b-sky absolute w-48 rounded-[20px] border bg-white">
              <Link href="/osnovno">
                <div
                  className="block rounded-tl-[20px] rounded-tr-[20px] px-4 py-2 text-sky hover:bg-sky hover:text-white"
                  style={
                    isOsnovno
                      ? { backgroundColor: "#48badd", color: "white" }
                      : {}
                  }
                >
                  Основно
                </div>
              </Link>
              <Link href="/sredno">
                <div
                  className="block px-4 py-2 text-sky hover:bg-sky hover:text-white"
                  style={
                    isSredno
                      ? { backgroundColor: "#48badd", color: "white" }
                      : {}
                  }
                >
                  Средно
                </div>
              </Link>
              <Link href="/univerzitet">
                <div
                  className="text-sky0 block rounded-bl-[20px] rounded-br-[20px] px-4  py-2 text-sky hover:bg-sky hover:text-white"
                  style={
                    isUniverzitet
                      ? { backgroundColor: "#48badd", color: "white" }
                      : {}
                  }
                >
                  Универзитет
                </div>
              </Link>
            </div>
          )}
        </div>
        <Link href="/skolarina">
          <div
            className="rounded-full px-3 text-[20px] font-bold text-sky hover:opacity-70"
            style={
              isSkolarina
                ? { color: "#ed1b31", borderBottom: "2px solid #ed1b31" }
                : {}
            }
          >
            Школарина
          </div>
        </Link>
        <Link href="/profesori">
          <div
            className="rounded-full px-3 text-[20px] font-bold text-sky hover:opacity-70"
            style={
              isProfesori
                ? { color: "#ed1b31", borderBottom: "2px solid #ed1b31" }
                : {}
            }
          >
            Професори
          </div>
        </Link>
        <CtaDialog
          cta={<Button className="rounded-full bg-chili">Најави се</Button>}
        />
      </div>
    </div>
  );
};
