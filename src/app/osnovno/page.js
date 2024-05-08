import { Hero, ImageSection, RocketCta, YellowSection } from "../page";
import osnovnoImg1 from "../../assets/osnovno1.png";
import osnovnoImg2 from "../../assets/osnovno2.png";
import osnovnoImg3 from "../../assets/osnovno3.png";
import osnovnoImg4 from "../../assets/osnovno4.png";
import osnovnoImg5 from "../../assets/osnovno5.png";
import { heroes } from "@/src/data";

const osnovnoImagesData = [
  {
    title: "Совладување на предметот",
    description:
      "Првичната помош што ја пружаат нашите професори е да помогнат да се совлада материјалот што се бара во училиште, осигурувајќи дека го разбира секој детаљ.",
    color: "#ed1b31",
    image: osnovnoImg1,
  },
  {
    title: "Персонализирано учење",
    description:
      "Нашите искусни професори изработуваат приспособени лекции за да одговараат на темпото и стилот на учење на Вашето дете, осигурувајќи дека тие темелно ги разбираат концептите.",
    color: "#48badd",
    image: osnovnoImg2,
  },
  {
    title: "Менторски пристап",
    description:
      "Вашето дете не добива само професор, добива и ментор, личност која е тука да му помогне да се изгради во личност која е одговорна, прецизна за тоа што сака да го постигне. Менторите помагаат во поставување на долгорочните цели во кариерната насока и ја пробудуваат љубопитноста и ги стекнуваат со спесифично знаење учениците, што е делумно во, но и надвор од материјалот предвиден за на училиште, а истовремено ги поврзува двете материи и даваат комплетна слика за како функционираат работите, со разбирање, а не напамет учење.",
    color: "#ffd02f",
    image: osnovnoImg3,
  },
  {
    title: "Следење на напредокот",
    description:
      "Родители, останете вклучени во образованието на Вашето дете со нашата алатка за следење на напредок и со помош од професорите идентификувајте области на подобрување и гледајте го растот и напредокот кај Вашето дете.",
    color: "#ed1b31",
    image: osnovnoImg4,
  },
  {
    title: "Родителско вклучување",
    description:
      "Ние ја поддржуваме соработката помеѓу родителите и нашите професори и сметаме дека заедно ќе успееме да му помогнеме на Вашето дете да ја добие квалитетната едукација што ја заслужува.",
    color: "#48badd",
    image: osnovnoImg5,
  },
];

const text =
  "Инвестирајте во академскиот успех на Вашето дете со Study Shuttle и ајде да соработуваме за да го оформиме патот до академски успех кај Вашето дете!";

const OsnovnoPage = () => {
  return (
    <div>
      <Hero heroData={heroes[0]} />
      <div className="flex flex-col gap-4">
        {osnovnoImagesData.map((data, index) => (
          <ImageSection data={data} key={index} />
        ))}
      </div>
      <YellowSection text={text} />
      <RocketCta />
    </div>
  );
};

export default OsnovnoPage;
