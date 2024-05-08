import { Facebook, Instagram, Phone, Twitter } from "lucide-react";
import logoImg from "../assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CtaDialog } from "../app/page";

const socialIcons = [
  {
    icon: (
      <Facebook color="#ed1b31" size={18} fill style={{ fill: "#ed1b31" }} />
    ),
    link: "https://www.facebook.com/profile.php?id=61550298703831",
  },
  {
    icon: <Instagram color="#ed1b31" size={18} />,
    link: "https://www.instagram.com/studyshuttle.mk/",
  },
  {
    icon: <Twitter color="#ed1b31" size={18} style={{ fill: "#ed1b31" }} />,
    link: "https://twitter.com/studyshuttle",
  },
  {
    icon: <Phone color="#ed1b31" size={18} />,
    link: "https://www.viber.com",
  },
];

export const Footer = () => {
  return (
    <div
      className="flex h-full flex-col  items-center justify-between gap-8 px-8 pt-8 lg:h-[353px] lg:flex-row lg:gap-32 lg:px-32 lg:pt-0"
      style={{ background: "linear-gradient(to bottom, white, #48badd)" }}
    >
      <div className="flex flex-col items-center gap-2">
        <Link href="" className="flex">
          <Image src={logoImg} width={200} height={200} alt="logo" />
        </Link>
        <div className="mb-4 text-[22px] font-semibold ">Учиме заедно!</div>
        <div className="flex gap-4">
          {socialIcons.map((icon, index) => (
            <a href={icon.link} key={index} className="text-white">
              {icon.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center lg:text-start">
        <div className="bolded text-[22px] font-bold">Навигација</div>
        <Link href="/osnovno">
          <div className="w-fit border-b border-transparent text-lg hover:border-b hover:border-black">
            Основно образование
          </div>
        </Link>
        <Link href="/sredno">
          <div className="w-fit border-b border-transparent text-lg hover:border-b hover:border-black">
            Средно образование
          </div>
        </Link>
        <Link href="/univerzitet">
          <div className="w-fit border-b border-transparent text-lg hover:border-b hover:border-black">
            Универзитет
          </div>
        </Link>
        <Link href="/profesori">
          <div className="w-fit border-b border-transparent text-lg hover:border-b hover:border-black">
            Професори
          </div>
        </Link>
        <Link href="/skolarina">
          <div className="w-fit border-b border-transparent text-lg hover:border-b hover:border-black">
            Школарина
          </div>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-2 text-center lg:mb-0 lg:text-start">
        <div className="bolded text-[22px] font-bold">Контакт</div>
        <div className="text-lg">info@studyshuttle.mk</div>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <Input
            className="focus:ring-2 focus:ring-blue-500"
            placeholder="Емаил адреса"
          />
          <CtaDialog
            cta={
              <Button className="h-[45px] rounded-[10px] bg-chili">
                Пријави се
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
};
