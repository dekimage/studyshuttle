import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { CtaDialog, CtaInvoiceDialog } from "../page";
import rocketImg from "../../assets/rocket.png";
import Image from "next/image";
import Link from "next/link";
const SkolarinaPage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="mt-16 text-center text-[25px] font-bold uppercase lg:text-[65px]">
        Нашите платежни планови
      </div>
      <div className="mb-8 mt-4 px-16 text-center text-[25px] font-bold max-w-[9  00px]">
        ФАЗИТЕ СЕ НАМЕНЕТИ ДА УЧЕНИКОТ СЕ КАЧУВА ПО АКАДЕМСКАТА СКАЛИЛО, СО КРАЈНА ЦЕЛ ДА ГО ИСКОРИСТИ СВОЈОТ МАКСИМАЛЕН АКАДЕМСКИ ПОТЕНЦИЈАЛ!
      </div>

      <div className="text-[45px] font-bold uppercase text-chili text-center mx-2">
        Основно и средно образование
      </div>

      <div className="flex flex-col gap-8  mt-24  w-full">
        <div className="flex h-[550px] w-full items-center justify-center gap-8">
          <div className="flex max-w-[800px] w-[400px] lg:w-full flex-col rounded-xl bg-sky p-8 h-fit relative">
            <div
              className="hidden lg:block  absolute top-[-150px] right-[-150px] z-0"
              style={{ transform: "rotate(340deg) scaleX(-1)" }}
            >
              <Image src={rocketImg} width={400} height={400} alt="rocket absolute" className="w-[120px] h-[120px]  lg:w-[320px] lg:h-[320px]" />
            </div>



            <div className="flex justify-between h-fit">
              <div className="text-[35px] font-semibold text-white">
                Основен План
              </div>
              <div className="text-[35px] font-bold">1200 МКД</div></div>

            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>1 токен - 1 час</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>Право на користење од 14 денови</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>  Ограничен пристап до платформата</div>
            </div>



            <div className="b-white my-6 w-full border border-dashed"></div>

            <Link href="/signup">
              <Button className="w-full bg-sun">Одбери</Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-8 justify-center lg:flex-row flex-col">

          <div className="my-32 mb-64 flex h-[550px] items-center justify-center gap-8">
            <div className="flex w-[400px] h-[800px] flex-col rounded-xl bg-sun p-8  lg:w-[430px]">
              <div className="text-[35px] font-semibold text-white">
                ФАЗА 1: Фундаментална фаза
              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>48 токени (3 часа неделно)</div>
              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Цел: Да се стекне рутина и здраво гледиште кон едукација</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Целосен Пристап до алатките за учење</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div> Право на користење од едно полугодие</div>
              </div>



              <div className="b-white my-6 w-full border border-dashed"></div>

              <div className="mb-8 text-[35px] font-bold">750МКД / час</div>

              <CtaInvoiceDialog
                cta={<Button className="w-full bg-sky">Одбери</Button>}
                ctaNumber={1}
              ></CtaInvoiceDialog>
            </div>
          </div>


          <div className="my-32 mb-64 flex h-[550px] items-center justify-center gap-8">
            <div className="flex w-[400px] h-[800px] flex-col rounded-xl bg-sun p-8  lg:w-[430px]">
              <div className="text-[35px] font-semibold text-white">
                ФАЗА 2: Фаза на Растење
              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>36 токени (2 часа неделно + екстра за пред тестови)</div>
              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Цел: Да се зацврстат навиките и добие јасна слика колку е важна едукацијата</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Целосен пристап до сите алатки</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div> Право на користење од едно полугодие</div>
              </div>



              <div className="b-white my-6 w-full border border-dashed"></div>

              <div className="mb-8 text-[35px] font-bold">800МКД / час</div>

              <CtaInvoiceDialog
                cta={<Button className="w-full bg-sky">Одбери</Button>}
                ctaNumber={2}
              ></CtaInvoiceDialog>
            </div>
          </div>

        </div>

        <div className="flex gap-8 justify-center lg:flex-row flex-col">
          <div className="my-32 mb-64 flex h-[550px] items-center justify-center gap-8">
            <div className="flex w-[400px] h-[800px] flex-col rounded-xl bg-sun p-8  lg:w-[430px]">
              <div className="text-[35px] font-semibold text-white">
                ФАЗА 3: Напредна Фаза

              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>24 токени (1 час неделно + екстра за пред тестови и други предмети)</div>
              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Цел: Тука фокусот е на градење менталитет за како ученикот да се истакне</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Целосен пристап до сите алатки</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div> Право на користење од едно полугодие</div>
              </div>



              <div className="b-white my-6 w-full border border-dashed"></div>

              <div className="mb-8 text-[35px] font-bold">900МКД / час</div>

              <CtaInvoiceDialog
                cta={<Button className="w-full bg-sky">Одбери</Button>}
                ctaNumber={3}
              ></CtaInvoiceDialog>
            </div>
          </div>




          <div className="my-32 mb-64 flex h-[550px] items-center justify-center gap-8">
            <div className="flex w-[400px] h-[800px] flex-col rounded-xl bg-sun p-8  lg:w-[430px]">
              <div className="text-[35px] font-semibold text-white">
                ФАЗА 4: Академска фаза

              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>1 академски токен = 46 неделна програма од 3 групни предавања/неделно со факултетски професор</div>
              </div>
              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Цел: Да се стекне рутина и здраво гледиште кон едукацијаЦел: Да се стекне ученикот со знаење надвор од рамките на образовните програми за да може да се натпреварува на национални и интернационални натпревари</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div>Целосен пристап до сите алатки + консултантски часови 1 на 1 со професорот</div>
              </div>

              <div className="my-6 flex gap-2">
                <CheckCircle className="text-black" />
                <div> Право на користење од 1 календарска година</div>
              </div>



              <div className="b-white my-6 w-full border border-dashed"></div>

              {/* <div className="mb-8 text-[35px] font-bold">750МКД / час</div> */}

              <CtaInvoiceDialog
                cta={<Button className="w-full bg-sky">Одбери</Button>}
                ctaNumber={4}
              ></CtaInvoiceDialog>
            </div>
          </div>

        </div>


        <div className="text-[45px] font-bold uppercase text-chili text-center">
          УНИВЕРЗИТЕТ
        </div>

        <div className=" flex h-[550px] w-full items-center justify-center gap-8 mb-32">
          <div className="flex max-w-[800px] w-[400px] lg:w-full flex-col rounded-xl bg-sky p-8 h-fit relative">


            <div className="flex justify-between h-fit flex-col lg:flex-row">
              <div className="text-[35px] font-semibold text-white">
                Подготвителен курс
              </div>
              <div className="text-[35px] font-bold">4000 МКД</div></div>

            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>1 студент токен = 1 Подготвителен курс (може да се подели и на колоквиуми)</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>Цел: Да го подготви студентот да го положи испитот со реална оцена</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div> 6 предавања од 120 минути и 1 консултациски час предадени во 7 дена</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div> Право на користење од 1 семестар</div>
            </div>



            <div className="b-white my-6 w-full border border-dashed"></div>

            <Link href="/signup">
              <Button className="w-full bg-sun">Одбери</Button>
            </Link>
          </div>
        </div>



      </div>
    </div>
  );
};
export default SkolarinaPage;


