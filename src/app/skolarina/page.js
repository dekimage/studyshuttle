import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const SkolarinaPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mt-16 text-[25px] font-bold uppercase lg:text-[65px]">
        Наши платежни планови
      </div>
      <div className="mb-8 mt-4 px-16 text-[25px] font-bold">
        Купете си Study Shuttle токени и ајде да учиме заедно! <br />{" "}
        Трансакцијата на часовите се врши со токени:
      </div>

      <div className="text-[25px] font-bold uppercase text-chili">
        1 токен = 1 час
      </div>

      <div className="flex flex-col gap-8 lg:h-[800px] lg:flex-row">
        <div className="my-32 mb-64 flex h-[550px] items-center justify-center gap-8">
          <div className="flex w-[430px] flex-col rounded-xl bg-sky p-8">
            <div className="text-[35px] font-semibold text-white">
              Основен План
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>1 токен - 1 час</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>Право на користење од еден месец</div>
            </div>

            <div className="b-white my-6 w-full border border-dashed"></div>

            <div className="mb-48 text-[35px] font-bold">1000 МКД</div>

            <Button className="w-full bg-sun">Одбери</Button>
          </div>
        </div>
        <div className="my-32 mb-64 flex h-[550px] items-center justify-center gap-8">
          <div className="flex w-[430px] flex-col rounded-xl bg-sun p-8">
            <div className="text-[35px] font-semibold text-white">
              Основен План
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>4 токени</div>
            </div>
            <div className="my-6 flex gap-2">
              <CheckCircle className="text-black" />
              <div>Целосен пристап до алатките за учење</div>
            </div>

            <div className="b-white my-6 w-full border border-dashed"></div>

            <div className="mb-48 text-[35px] font-bold">3000 МКД</div>

            <Button className="w-full bg-sky">Одбери</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SkolarinaPage;
