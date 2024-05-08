"use client";
import Image from "next/image";
import logoImg from "../assets/logo.png";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { CtaDialog } from "../app/page";

export const Header = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      className="relative z-[1000] flex h-[100px] w-full justify-between px-8 lg:h-[147px] lg:px-32"
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
      <div
        className="relative flex cursor-pointer items-center justify-center lg:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu size={48} />
      </div>
      {menuOpen && (
        <div
          className="lg:hidde absolute left-0 top-[80px] z-[1000000] z-[1000] flex w-full flex-col items-end bg-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Link href="/osnovno" className="w-full cursor-pointer  text-end">
            <div
              className="w-full  p-3 pr-8 text-[20px] font-bold text-sky"
              style={
                isOsnovno ? { color: "white", backgroundColor: "#48badd" } : {}
              }
            >
              Основно
            </div>
          </Link>
          <Link href="/sredno" className="w-full  cursor-pointer  text-end">
            <div
              className="w-full p-3 pr-8 text-[20px] font-bold text-sky"
              style={
                isSredno ? { color: "white", backgroundColor: "#48badd" } : {}
              }
            >
              Средно
            </div>
          </Link>
          <Link href="/univerzitet" className="w-full cursor-pointer text-end">
            <div
              className="w-full p-3 pr-8 text-[20px] font-bold text-sky"
              style={
                isUniverzitet
                  ? { color: "white", backgroundColor: "#48badd" }
                  : {}
              }
            >
              Универзитет
            </div>
          </Link>
          <Link href="/skolarina" className="w-full cursor-pointer text-end">
            <div
              className="w-full p-3 pr-8 text-[20px] font-bold text-sky"
              style={
                isSkolarina
                  ? { color: "white", backgroundColor: "#48badd" }
                  : {}
              }
            >
              Школарина
            </div>
          </Link>
          <Link href="/profesori" className="w-full cursor-pointer text-end">
            <div
              className="w-full p-3 pr-8 text-[20px] font-bold text-sky"
              style={
                isProfesori
                  ? { color: "white", backgroundColor: "#48badd" }
                  : {}
              }
            >
              Професори
            </div>
          </Link>
          <Link href="/najava" className="w-full cursor-pointer text-end">
            <div className="relative z-[100000] w-full cursor-pointer p-3 pr-8 text-end text-[20px] font-bold text-sky">
              Најави Се
            </div>
          </Link>
        </div>
      )}

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
