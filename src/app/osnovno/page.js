import { Hero, ImageSection, RocketCta, YellowSection } from "../page";
import osnovnoImg1 from "../../assets/osnovno1.png";
import osnovnoImg2 from "../../assets/osnovno2.png";
import osnovnoImg3 from "../../assets/osnovno3.png";
import osnovnoImg4 from "../../assets/osnovno4.png";
import osnovnoImg5 from "../../assets/osnovno5.png";
import { heroes } from "@/src/data";
import { whyText } from "../sredno/page";
import Link from 'next/link';

const osnovnoImagesData = [
  {
    title: "1. Совладување на предметот",
    description:
      "Првичната помош што ја пружаат нашите професори е да помогнат да се совлада материјалот што се бара во училиште, осигурувајќи дека го разбира секој детаљ.",
    color: "#ed1b31",
    image: osnovnoImg1,
  },
  {
    title: "2. Персонализирано учење",
    description:
      "Нашите искусни професори изработуваат приспособени лекции за да одговараат на темпото и стилот на учење на Вашето дете, осигурувајќи дека тие темелно ги разбираат концептите.",
    color: "#48badd",
    image: osnovnoImg2,
  },
  {
    title: "3. Менторски пристап",
    description:
      "Вашето дете не добива само професор, добива и ментор, личност која е тука да му помогне да се изгради во личност која е одговорна, прецизна за тоа што сака да го постигне. Менторите помагаат во поставување на долгорочните цели во кариерната насока и ја пробудуваат љубопитноста и ги стекнуваат со спесифично знаење учениците, што е делумно во, но и надвор од материјалот предвиден за на училиште, а истовремено ги поврзува двете материи и даваат комплетна слика за како функционираат работите, со разбирање, а не напамет учење.",
    color: "#ffd02f",
    image: osnovnoImg3,
  },
  {
    title: "4. Следење на напредокот",
    description:
      "Родители, останете вклучени во образованието на Вашето дете со нашата алатка за следење на напредок и со помош од професорите идентификувајте области на подобрување и гледајте го растот и напредокот кај Вашето дете.",
    color: "#ed1b31",
    image: osnovnoImg4,
  },
  {
    title: "5. Родителско вклучување",
    description:
      "Ние ја поддржуваме соработката помеѓу родителите и нашите професори и сметаме дека заедно ќе успееме да му помогнеме на Вашето дете да ја добие квалитетната едукација што ја заслужува.",
    color: "#48badd",
    image: osnovnoImg5,
  },
];

const text = [
  'Како да започнете?',
  '',
  <p key="1">
    1. БЕСПЛАТНО пополнете го{' '}
    <Link href="/landing" className="text-blue-600 hover:text-blue-800 underline">
      формуларот за академска евалуација на ученици
    </Link>.
  </p>,
  <p key="2">
    2. Проверете ја Вашата пошта (вклучувајќи го и spam/junk/непосакувани пораки) за линкот до персонализираниот образовен формулар.
  </p>,
  <p key="3">
    3. Пополнете го  <Link href="/landing" className="text-blue-600 hover:text-blue-800 underline">
      формуларот
    </Link> заедно со Вашето дете и добијте детална стратегија која ќе му помогне да го достигне својот академски потенцијал.
  </p>
];

const OsnovnoPage = () => {
  return (
    <div>
      <Hero heroData={heroes[0]} />
      <YellowSection text={whyText} isBig />
      <div className="flex flex-col gap-4">
        {osnovnoImagesData.map((data, index) => (
          <ImageSection data={data} key={index} />
        ))}
      </div>
      <YellowSection text={text} cta />
      <RocketCta />
    </div>
  );
};

export default OsnovnoPage;
