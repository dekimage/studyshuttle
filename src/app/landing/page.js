"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import logoImg from "../../assets/logo.png";
import cosmoImg from "../../assets/cosmo.png";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LandingPage() {
  const searchParams = useSearchParams();

  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
      <div className="pl-16 py-12 flex w-full justify-start">
        <Image src={logoImg} alt="logo" height={200} width={200} />
      </div>



      <div
        style={{
          background: `linear-gradient(to bottom, #ffd02f, white)`,
          clipPath: "polygon(0 0, 100% 20%, 100% 100%, 0% 100%)",
        }}
        className="flex flex-col sm:flex-row justify-between px-2 py-6 sm:px-16 pt-48 w-full"
      >
        <div className="max-w-[900px]">
          <div className="max-w-[600px] sm:text-[65px] text-[25px] font-bold sm:mb-4">
            Откриете го академскиот потенцијал на Вашето дете!
          </div>
          <div className="max-w-[600px] sm:text-[25px] text-[18px] font-bold">
            Добијте персонализиран академски план прилагоден на потребите на Вашето дете.
          </div>
        </div>
        <div>
          <Image
            src={cosmoImg}
            alt="logo"
            height={500}
            width="500"
          // className=" h-[500px] w-[500px]"
          />
        </div>
      </div>

      <div className="flex justify-center"> <Link href={`/landing-form?${searchParams.toString()}`}>
        <Button
          className="bg-chili text-white w-[350px] sm:w-[400px] rounded-full px-12 py-8 mt-4 text-[32px]"
        >
          Започнете тука
        </Button>
      </Link></div>

      <div className="px-2 py-6 sm:px-16 sm:py-12 sm:max-w-[1140px]">
        <div className="sm:text-chili sm:text-[65px] text-[25px] mb-4 font-bold">
          Како функционира?
        </div>
        <div className="sm:text-[25px] text-[18px] font-bold">
          <div>
            Секое дете има уникатен академски пат. Затоа создадовме лесен процес за да Ви
            помогнеме да го откриеме целосниот академски потенцијал на Вашето дете:
          </div>
          <br />
          <div>1. Пополнете го Google формуларот (потребни се околу од 20 минути) заедно со Вашето дете.</div>
          <div>
            2. Добијте детален, персонализиран академски план и родителски совети како можете да му
            помогнете во оваа фаза на Вашето дете, во Вашата е-пошта.
          </div>
          <div>3. Направете го првиот чекор за да му помогнете на Вашето дете да постигне академски успех.</div>
        </div>
      </div>

      <div className="rounded-[20px] bg-chili mx-2 sm:mx-16 flex justify-center items-center p-4 sm:p-10 sm:max-w-[1140px]">
        <div className="font-bold text-white sm:text-[45px] text-[25px] text-center">
          Ова е едноставно, бесплатно и засновано на докажана методологија за академски успех.
        </div>
      </div>
      <div className="px-2 py-6 sm:px-16 sm:py-12 sm:max-w-[1140px]">
        <div className="sm:text-sky sm:text-[65px] text-[25px] font-bold mb-4">
          Зошто да го пополните ова?
        </div>
        <ul className="sm:text-[25px] text-[18px] font-bold">
          <li>Добијте јасна претстава за моменталната академска состојба на Вашето дете.</li>
          <li>Добијте конкретни совети прилагодени на неговите силни страни и предизвици.</li>
          <li>Создадете патоказ за поддршка на неговиот академски раст и иднина.</li>
        </ul>
      </div>

      <div className="rounded-tl-[20px] rounded-tr-[20px] bg-gradient-to-b from-sky to-white p-4 text-center mt-24 w-full sm:max-w-[1140px]">
        <div className="sm:text-[45px] text-[25px] font-bold">
          Добијте го Вашиот бесплатен персонализиран план веднаш!
        </div>
        <Link href={`/landing-form?${searchParams.toString()}`}>
          <Button
            className="bg-chili text-white w-[350px] sm:w-[400px] rounded-full px-12 py-8 mt-4 text-[32px]"
          >
            Започнете тука
          </Button>
        </Link>
      </div>
      <div className="rounded-b-[20px] bg-gradient-to-t from-sky to-white p-4 pt-24 text-center w-full sm:max-w-[1140px]">
        <a
          href="https://www.studyshuttle.mk/"
          target="_blank"
          rel="noopener noreferrer"
          className="sm:text-[35px] text-[25px] font-bold underline text-black"
        >
          Посетете не на нашата веб-страна
        </a>
        <div className="sm:text-[25px] text-[18px] mt-4">© 2025 Стади Шатл ДООЕЛ</div>
      </div>


    </main>
  );
}