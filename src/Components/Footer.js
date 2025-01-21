import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter } from "lucide-react";
import logoImg from "../assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CtaDialog } from "../app/page";

const socialIcons = [
  {
    icon: <Facebook color="#ed1b31" size={18} fill="#ed1b31" />,
    link: "https://www.facebook.com/profile.php?id=61550298703831",
  },
  {
    icon: <Instagram color="#ed1b31" size={18} />,
    link: "https://www.instagram.com/studyshuttle.mk/",
  },
  {
    icon: <Linkedin color="#ed1b31" size={18} style={{ fill: "#ed1b31" }} />,
    link: "https://www.linkedin.com/company/study-shuttle/",
  },
  {
    icon: <Phone color="#ed1b31" size={18} />,
    link: "tel:+38971620370",
  },
];

export const SocialIcons = () => {
  return (
    <div className="flex gap-4">
      {socialIcons.map((icon, index) => (
        <a href={icon.link} key={index} className="text-white">
          {icon.icon}
        </a>
      ))}
    </div>
  );
};

export const Footer = () => {
  return (
    <div
      className="flex h-full flex-col  items-center justify-between gap-8 px-8 pt-8 lg:h-[353px] lg:flex-row lg:items-start lg:gap-32 lg:px-32 lg:pt-0"
      style={{ background: "linear-gradient(to bottom, white, #48badd)" }}
    >
      <div className="flex w-full flex-col items-center gap-2 lg:items-start">
        <Link href="/" className="flex">
          <Image src={logoImg} width={200} height={200} alt="logo" />
        </Link>
        <div className="mb-4 text-[22px] font-semibold ">Учиме заедно!</div>
        <SocialIcons />
      </div>

      <div className="flex w-full flex-col items-center gap-2 text-center lg:items-start lg:text-start">
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

      <div className="mb-6 flex w-full flex-col gap-2 text-center lg:mb-0 lg:text-start">
        <div className="bolded text-[22px] font-bold">Контакт</div>
        {/* <div className="text-lg">info@studyshuttle.mk</div> */}
        <div className="flex flex-col items-start gap-4 ">
          <div className="flex gap-2">
            <Mail />
            {/* `mailto:` links will open the default email client */}
            <a
              href="mailto:studyshuttlemk@gmail.com"
              className="text-blue-500 hover:underline"
            >
              studyshuttlemk@gmail.com
            </a>
          </div>
          <div>
            БЕСПЛАТЕН{' '}
            <Link href="/landing" className="text-blue-500 hover:underline">
              формулар за академска евалуација на ученици
            </Link>
          </div>
          {/* <CtaDialog
            cta={
              <Button className="h-[45px] rounded-[10px] bg-chili">
                Закажи онлајн средба
              </Button>
            }
          /> */}
        </div>
      </div>
    </div>
  );
};
