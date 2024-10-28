"use client";

import Loader from "../_components/Loader";
import { Title } from "../_components/ReusableDivs";
import MobxStore from "../mobx";
import { PricingBox } from "./PricingBox";

export const freeData = {
  title: "Промотивна понуда!",
  description: "800МКД",
  price: "500 МКД",
  features: [
    "1 токен",
    "Целосен пристап до алатките за учење",
    "Право на користење 30 дена декември",
  ],
  cta: "Купи Токен",
};

export const proData = {
  title: "Месечен план",
  description: "4000МКД",
  price: "3000 МКД",
  features: [
    "5 токени",
    "Целосен пристап до алатките за учење",
    "Право на користење од 30 дена",
  ],
  cta: " Избери план ",
};

const Pricing = () => {
  const { user, loading } = MobxStore;

  if (loading) {
    
    return <Loader />;
  }

  return (
    <div>
      <Title>Ценовник</Title>
      <div className="flex flex-col justify-start gap-8 md:flex-row lg:flex-row">
        <PricingBox data={freeData} isAuthenticated={false} />
        <PricingBox data={proData} isAuthenticated={false} />
      </div>
    </div>
  );
};
export default Pricing;
