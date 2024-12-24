import { Hero, ImageSection, RocketCta, YellowSection } from "../page";
import osnovnoImg1 from "../../assets/universitet1.png";
import osnovnoImg2 from "../../assets/universitet2.png";
import { heroes } from "@/src/data";

const osnovnoImagesData = [
  {
    title: "Курсевите се наменети за:",
    description: (
      <div>
        1. Студенти што сакаат во краток период да подготват предмет
        <br />
        2. Студенти што сакаат да го издигнат знаењето на повисоко ниво
        <br />
        3. Студенти што се борат за пролазна оценка
        <br />
        <br />
        Ако си било кој од овие студенти, тогаш овие курсеви се токму за тебе!
      </div>
    ),
    color: "#ed1b31",
    image: osnovnoImg1,
  },
  {
    title: "Како функционира?",
    description: (
      <div>
        1. Регистрирајте се на платофрмата како студент
        <br />
        2. Најавете се и одете на полето професори
        <br />
        3. Изберете професор и најдете го посакуваниот предмет за кој е објавен
        курсот
        <br />
        4. Резервирајте го Вашето место и очекувајте дополнителни информации на
        е-маил
      </div>
    ),
    color: "#48badd",
    image: osnovnoImg2,
  },
];

const text =
  "Подобрете го Вашето универзитетско искуство со Study Shuttle, збогатете се со суштинско знаење и станете успешна приказна која ќе и носи гордост на Македонија!";

const OsnovnoPage = () => {
  return (
    <div>
      <Hero heroData={heroes[2]} />
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
