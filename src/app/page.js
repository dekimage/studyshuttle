"use client";
import { Button } from "@/components/ui/button";

import rocketImg from "../assets/rocket.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";
import { flagHeroData, proffesorsData, stepsData } from "@/src/data";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import useOnScreen from "../hooks/useOnScreen";

export const SlideInWhenVisible = ({ children }) => {
  // Trigger the animation once and not repeatedly
  const [ref, hasBeenVisible] = useOnScreen({ threshold: 0.1 });

  return (
    <div ref={ref} className={` ${hasBeenVisible ? "slide-in-bottom" : ""}`}>
      {children}
    </div>
  );
};

export const SlideInRightWhenVisible = ({ children }) => {
  // Trigger the animation once and not repeatedly
  const [ref, hasBeenVisible] = useOnScreen({ threshold: 0.1 });

  return (
    <div ref={ref} className={`${hasBeenVisible ? "slide-in-right" : ""}`}>
      {children}
    </div>
  );
};

export const CtaDialog = ({ cta }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{cta}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col justify-center gap-4">
          <div className="text-[24px] font-bold">
            За закажување на час, контактирајте не на:
          </div>
          <div className="flex gap-2">
            <Phone />
            {/* `tel:` links will open the phone dialer app */}
            <a
              href="tel:+38971620370"
              className="text-blue-500 hover:underline"
            >
              +389 71 620 370
            </a>
          </div>
          <div className="flex gap-2">
            <Mail />
            {/* `mailto:` links will open the default email client */}
            <a
              href="mailto:andrej.ilievski@studyshuttle.mk"
              className="text-blue-500 hover:underline"
            >
              schedule@studyshuttle.mk
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const Hero = ({ heroData }) => {
  const { color, headline, subheadline, description, image } = heroData;
  return (
    <div className="mt-16 flex flex-col">
      <div className="mb-24 max-w-[1000px] px-8 lg:mb-0 lg:pl-32 ">
        <div className="slide-in-bottom text-[35px] font-bold lg:text-[65px]">
          Study Shuttle за{" "}
        </div>
        <div
          className="slide-in-bottom text-[35px] font-bold lg:text-[65px]"
          style={{ color: color }}
        >
          {headline}
        </div>
        <div className="slide-in-bottom my-8 text-[16px] font-semibold lg:text-[34px]">
          {subheadline}
        </div>

        <Link href="/signup">
          <Button
            style={{ border: `2px solid ${color}`, color: color }}
            variant="outline"
            className="animate-heartbeat rounded-full"
          >
            Регистрирај се
          </Button>
        </Link>
      </div>

      <div className="relative mt-8 flex h-full w-full items-center justify-center">
        {/* Clipped Background */}
        <div
          style={{
            background: `linear-gradient(to right, ${color}, white)`,
            clipPath: "polygon(0 34%, 100% 0, 100% 100%, 0% 100%)",
          }}
          className="absolute inset-0 z-0"
        ></div>

        {/* Image Positioned Above Clipping Path */}
        <Image
          src={image}
          width={320}
          height={320}
          alt="hero"
          className="absolute right-[80px] top-[-80px] z-[100] h-[220px] w-[220px] lg:right-[150px] lg:top-[-160px] lg:h-[320px] lg:w-[320px]"
        />

        {/* Inner Content Positioned Correctly */}
        <div className="relative z-50 my-24 flex w-full flex-col items-center px-16 lg:my-8 lg:px-32">
          <div className="mb-16 mb-2 pb-8 pt-32 text-center text-[16px] font-semibold lg:text-[24px]">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageSection = ({ data }) => {
  const { title, description, color, image } = data;
  const rgbaColor = (color) => {
    const r = parseInt(color.slice(1, 3), 16),
      g = parseInt(color.slice(3, 5), 16),
      b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };
  return (
    <div
      style={{ position: "relative", width: "100%", minHeight: "600px" }}
      className="mt-8 flex items-center justify-center"
    >
      <Image
        src={image}
        alt="Background"
        style={{
          width: "100%",
          minHeight: "600px",
          maxHeight: "800px",
          objectFit: "cover",
          position: "absolute",
          zIndex: -1,
        }}
      />
      <div
        className="m-[10%] flex flex-col items-center rounded-[20px] p-6 lg:p-10"
        style={{ backgroundColor: rgbaColor(color) }}
      >
        <SlideInWhenVisible>
          <div className="text-[24px] font-extrabold lg:text-[35px]">
            {title}
          </div>
          <div className="text-[16px] font-semibold lg:text-[24px]">
            {description}
          </div>
        </SlideInWhenVisible>
      </div>
    </div>
  );
};

export const YellowSection = ({ text }) => {
  return (
    <div className="mt-8 flex items-center justify-center bg-sun">
      <SlideInWhenVisible>
        <div className="mx-4 my-12 max-w-[1000px] text-center text-[21px] font-semibold leading-6 lg:text-[35px] lg:leading-10">
          {text}
        </div>
      </SlideInWhenVisible>
    </div>
  );
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      // Adjust width according to your mobile breakpoint
      setIsMobile(window.innerWidth < 1024);
    }

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export const RocketCta = ({ isRed, active, isProf }) => {
  const isMobile = useIsMobile();
  let background;
  switch (active) {
    case 1:
    case 4:
      background = isMobile
        ? "linear-gradient(to top, white, #ed1b31)"
        : "linear-gradient(to left, white, #ed1b31)"; // Red
      break;
    case 2:
    case 5:
      background = isMobile
        ? "linear-gradient(to top, white, #ffd02f)"
        : "linear-gradient(to left, white, #ffd02f)"; // Yellow
      break;
    case 3:
      background = isMobile
        ? "linear-gradient(to top, white, #48badd)"
        : "linear-gradient(to left, white, #48badd)"; // Blue
      break;
    case 6:
      background = "white";
      break;
    default:
      // Fallback if none of the active values match
      background = isMobile
        ? "linear-gradient(to top, white, #48badd)"
        : "linear-gradient(to top, white, #48badd)";
      break;
  }
  return (
    <div
      className="my-8 hidden items-center justify-between px-8 py-8 lg:flex lg:flex lg:px-32"
      style={{ background: background }}
    >
      <div className="flex flex-col">
        <div
          className={`mb-8 text-[35px] font-semibold lg:text-[65px]  ${
            isProf ? "text-chili" : "text-black lg:text-white"
          }`}
        >
          Сеуште немаш профил?
        </div>
        {isProf ? (
          <Link href="/signup">
            <Button className="w-fit rounded-full border bg-sky text-white">
              Регистрирај се
            </Button>
          </Link>
        ) : (
          <Link href="/signup">
            <Button
              variant="outline"
              className="b-sky w-fit rounded-full border text-sky"
            >
              Регистрирај се
            </Button>
          </Link>
        )}
        {isRed && (
          <div className="my-6 flex gap-2 text-black lg:text-white">
            <div className="text-[19px]">Види ги чекорите</div> <ChevronDown />
          </div>
        )}
      </div>
      <div
        className="hidden lg:block"
        style={{ transform: "rotate(340deg) scaleX(-1)" }}
      >
        <Image src={rocketImg} width={400} height={400} alt="rocket" />
      </div>
    </div>
  );
};

const FlagHero = ({ data, active, setActive, setIsOnceClicked }) => {
  const { title, description, image, color } = data;
  const dotts = [0, 1, 2, 3, 4];

  return (
    <div className="flex flex-col pb-12 lg:px-32">
      <div className="flex justify-between">
        <div className="mt-16 flex max-w-[800px] flex-col">
          <div className="mb-6 px-8 text-[35px] font-bold  lg:text-[65px]">
            {active == 0 ? (
              <div>
                Добредојдовте во{" "}
                <span className="w-full text-sky">Study Shuttle</span>
              </div>
            ) : (
              <div>{title}</div>
            )}
          </div>
          <div className="max-w-[600px] px-8 text-[16px]  font-bold lg:text-[25px]">
            {description}
          </div>

          <div className="relative z-[150] mt-16 flex items-center justify-start gap-3 px-8 lg:justify-start">
            {dotts.map((dot, index) => {
              const isActive = active === dot;
              return (
                <div
                  key={index}
                  style={
                    isActive
                      ? { backgroundColor: "#ed1b31" }
                      : { backgroundColor: "#ffd02f" }
                  }
                  className="h-4 w-4 cursor-pointer rounded-full bg-chili"
                  onClick={() => {
                    setIsOnceClicked(true);
                    setActive(dot);
                  }}
                ></div>
              );
            })}
          </div>

          <div className="relative mt-8 flex h-full w-full flex-col items-center justify-center lg:hidden">
            {/* Clipped Background */}
            <div
              style={{
                background: `linear-gradient(to right, ${color}, white)`,
                clipPath: "polygon(0 34%, 100% 0, 100% 100%, 0% 100%)",
              }}
              className="absolute inset-0 z-0"
            ></div>

            {/* Image Positioned Above Clipping Path */}
            <Image
              src={image}
              width={220}
              height={220}
              alt="hero"
              className="absolute right-[50px] top-[-50px] z-[100] h-[180px] w-[180px] lg:right-[150px] lg:top-[-160px] lg:h-[320px] lg:w-[320px]"
            />

            {/* Inner Content Positioned Correctly */}
            <div className="relative z-50 my-8 flex w-full flex-col items-start gap-8 px-4 lg:px-32">
              <div className="mt-32 text-[35px] font-semibold">
                Сеуште немаш профил?
              </div>

              <Link href="/signup">
                <Button
                  variant="outline"
                  className="b-sky w-fit rounded-full border text-sky"
                >
                  Регистрирај се
                </Button>
              </Link>

              <div className="flex gap-2">
                <div className="text-[19px] font-semibold">
                  Види ги чекорите
                </div>
                <ChevronDown />
              </div>
            </div>
          </div>
        </div>
        {/* <Image
          src={image}
          width={350}
          height={450}
          alt="flag"
          className="block lg:hidden"
        /> */}

        <div
          className="hidden h-[450px] w-[250px] lg:block"
          style={{
            backgroundColor: color,
            borderRadius: "10% 10% 50% 50% / 0% 0% 50% 50% ",
          }}
        >
          <Image
            src={image}
            width={300}
            height={300}
            alt="flag"
            className="absolute right-[7%] top-[25%]"
          />
        </div>
      </div>
    </div>
  );
};

const SingleStep = ({ isLeft, data }) => {
  const { title, subtitle, description, image } = data;
  const color = isLeft ? "#48badd" : "#ed1b31";
  const isMobile = useIsMobile();
  return (
    <div
      className={`flex flex-col lg:flex-row ${
        isLeft ? "lg:flex-row-reverse" : "flex-row"
      } mx-8  my-8 items-center  justify-center text-center lg:my-32 lg:gap-32 lg:px-32 lg:text-start`}
    >
      {/* <SlideInRightWhenVisible> */}
      <Image
        src={image}
        width={isMobile ? 250 : 400}
        height={isMobile ? 250 : 400}
        alt="step"
        className="mb-6 lg:mb-0"
      />
      {/* </SlideInRightWhenVisible> */}
      <SlideInWhenVisible>
        <div className="">
          <div
            className="animate-popup text-[60px] font-bold lg:text-[90px]"
            style={{ color: color }}
          >
            {title}
          </div>
          <div
            className="text-[24px] font-bold lg:text-[34px]"
            style={{ color: color }}
          >
            {subtitle}
          </div>
          <div className="mt-8 text-[16px] font-bold lg:mt-0 lg:text-[24px]">
            {description}
          </div>
        </div>
      </SlideInWhenVisible>
    </div>
  );
};

const Stats = () => {
  return (
    <div className="bg-sun p-4 lg:p-24">
      <div className="mb-16 mt-8 text-center text-[24px] font-bold lg:mt-0 lg:text-[48px]">
        Подобрете го Вашето образование
      </div>
      <div className="flex flex-col justify-center lg:flex-row lg:gap-32">
        <div className="my-8 flex flex-col items-center justify-center gap-2 lg:my-0 lg:gap-8">
          <div className="text-center text-[65px] font-bold">19</div>
          <div className="text-[24px]">Студенти</div>
        </div>
        <div className="my-8 flex flex-col items-center justify-center gap-2 lg:my-0 lg:gap-8">
          <div className="text-center text-[65px] font-bold">6</div>
          <div className="text-[24px]">Професори</div>
        </div>
        <div className="my-8 flex flex-col items-center justify-center gap-2 lg:my-0 lg:gap-8">
          <div className="text-center text-[65px] font-bold">9</div>
          <div className="text-[24px]">Предмети и Курсеви</div>
        </div>
      </div>
    </div>
  );
};

export const ProffesorCard = ({ proffesor, isLanding }) => {
  const { name, title, scope, subjects, image } = proffesor;
  return (
    <div
      className="flex h-[540px] w-[295px] flex-col items-center rounded-[20px] border border-[3px] border-sun bg-white px-[12px] text-center"
      style={isLanding ? { border: "none" } : {}}
    >
      <div
        className={`mb-4 mt-8 flex h-[120px] w-[120px] items-center justify-center rounded-full border border-[3px] ${
          isLanding ? "border-chili" : "border-sun"
        }`}
      >
        <Image
          src={image}
          width={150}
          height={150}
          alt="profesor"
          className="h-[118px] w-[118px] rounded-full object-cover"
        />
      </div>

      <div className="text-[24px] font-extrabold uppercase">{name}</div>
      <div className="text-[24px] font-semibold">{title}</div>
      <div className="mt-4 font-semibold uppercase">{scope}</div>
      <div className="mx-8 flex flex-col">
        {subjects.map((subject, index) => (
          <div
            key={index}
            style={{
              boxShadow: "inset 2px 7px 4px -5px rgba(0, 0, 0, 0.49)",
            }}
            className={`my-2 w-full rounded-[10px] px-8 py-2 text-[12px] font-bold ${
              isLanding ? "bg-chili text-white" : "bg-sun"
            }`}
          >
            {subject}
          </div>
        ))}
      </div>

      {/* {isLanding && (
        <Button className="mt-4 w-full rounded-[10px] bg-chili">
          Види профил
        </Button>
      )} */}
    </div>
  );
};

const ProfessorsSection = () => {
  return (
    <div
      className="flex h-[800px] flex-col items-center justify-center"
      style={{ background: "linear-gradient(to top, white, #ffd02f)" }}
    >
      <div className="mb-16 border-b border-black text-center  text-[24px] font-bold lg:text-[34px]">
        Запознајте ги нашите професори
      </div>
      {/* <div className="my-8 flex gap-8">
        {proffesorsData.slice(0, 3).map((proffesor, index) => (
          <ProffesorCard proffesor={proffesor} isLanding key={index} />
        ))}
      </div> */}
      <Carousel className="my-8 w-[80%]">
        <CarouselContent className="-ml-4">
          {proffesorsData.map((proffesor, index) => (
            <CarouselItem
              className="flex items-center justify-center px-4 md:basis-1/2 lg:basis-1/3"
              key={index}
            >
              <ProffesorCard proffesor={proffesor} isLanding key={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-chili text-white" />
        <CarouselNext className="bg-chili text-white" />
      </Carousel>
    </div>
  );
};

const LandingPage = () => {
  const [active, setActive] = useState(0);
  const [isOnceClicked, setIsOnceClicked] = useState(false);

  useEffect(() => {
    let intervalId; // Declare the intervalId variable

    if (!isOnceClicked) {
      intervalId = setInterval(() => {
        setActive((prevActive) => (prevActive + 1) % (stepsData.length + 1));
      }, 4500);
    }

    return () => clearInterval(intervalId); // Clear on cleanup
  }, [isOnceClicked]);

  return (
    <div className="">
      <FlagHero
        data={flagHeroData[active]}
        active={active}
        setActive={setActive}
        setIsOnceClicked={setIsOnceClicked}
      />
      <RocketCta active={active + 1} isRed />
      <div>
        {stepsData.map((data, index) => (
          <SingleStep data={data} key={index} isLeft={index % 2 === 0} />
        ))}
      </div>

      <div className="flex items-center justify-center py-16">
        <Link href="/signup">
          <Button className="rounded-full bg-sky py-8 lg:bg-chili lg:px-8 lg:text-[24px]">
            Регистрирај се
          </Button>
        </Link>
      </div>

      <Stats />
      <ProfessorsSection />
      <div className="my-8 mb-24 flex items-center justify-center">
        <Link href="/profesori">
          <Button className="rounded-full bg-sky py-8 lg:px-8 lg:text-[24px]">
            Запознајте ги нашите професори
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
