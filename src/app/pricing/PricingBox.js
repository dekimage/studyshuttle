import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

import Link from "next/link";

export const PricingBox = ({ data, isAuthenticated }) => {
  return (
    // <Card className="md:w-1/2 lg:w-1/3 ">
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid">
        <CardDescription className="line-through">
          {data.description}
        </CardDescription>
        <div>
          <h2 className="scroll-m-20  pb-6 text-3xl font-semibold">
            {data.price}
          </h2>
        </div>

        <div className="pb-4 text-sm font-semibold">Бенефити:</div>
        <div>
          {data.features.map((feature, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-[25px_1fr] items-start last:mb-0 last:pb-0"
            >
              {/* <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" /> */}
              <Check size={20} />
              <div className="space-y-1">
                <p className="text-sm  leading-none">{feature}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {isAuthenticated ? (
          <>
            {data.title === "Месечен план" ? (
              <Button className="w-full">Upgrade to Pro</Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                Active Plan
              </Button>
            )}
          </>
        ) : (
          <div className="w-full">
            <Link href="/signup">
              <Button className="w-full">{data.cta}</Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
