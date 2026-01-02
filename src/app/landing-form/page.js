"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";


const validationSchema = Yup.object({
  email: Yup.string().email("Погрешен формат на е-пошта").required("E-пошта е задолжителна"),
  phone: Yup.string()
    .matches(/^[0-9+\s-]+$/, "Невалиден телефонски број")
    .required("Телефонскиот број е задолжителен"),
});

export const dynamic = 'force-dynamic';

export default function LandingPage() {

  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [affiliateCode, setAffiliateCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setAffiliateCode(code);
    }
  }, [searchParams]);

  const formik = useFormik({
    initialValues: {
      email: "",
      phone: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Store lead in Firebase
        const leadResponse = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, affiliateCode }),
        });

        if (!leadResponse.ok) {
          throw new Error("Failed to store lead");
        }

        // Send email
        const emailResponse = await fetch("/api/sendEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: values.email,
            subject: "Формулар за академска евалуација на ученикот – Study Shuttle",
            text: `Почитувани,

Ви благодариме за интересот што го покажавте за програмата на Study Shuttle! Како што веќе разговаравме/добивме информација, подготвени сме да ви понудиме персонализиран план кој ќе ја поддржи Вашата или академската иднина на Вашето дете.

Во продолжение Ви го испраќаме линкот од формуларот што треба да го пополните за да можеме подобро да ги разбереме Вашите потреби и цели:
https://docs.google.com/forms/d/e/1FAIpQLSclLJwjGmI1KouS-0j2lb22xz5wKJYmeiFiMRrSFGOT9tG8bA/viewform?usp=sharing

Штом го добиеме пополнетиот формулар, нашиот тим ќе го анализира и ќе стапи во контакт со Вас за да сподели детално решение и следни чекори.

Доколку Ви се потребни дополнителни информации или имате какви било прашања, слободно контактирајте нè на studyshuttlemk@gmail.com

Ви благодариме уште еднаш за интересот и со нетрпение очекуваме да работиме заедно!

Поздрав и пријатен ден,
Тимот на Study Shuttle
studyshuttlemk@gmail.com
www.studyshuttle.mk`,
          }),
        });

        if (!emailResponse.ok) {
          throw new Error("Failed to send email");
        }

        toast({
          title: "Success!",
          description: "Thank you for your interest. Please check your email for next steps.",
        });

        formik.resetForm();
      } catch (error) {
        console.error("Error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again later.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-[35px] text-sky font-bold">
              Пополнете ги вашите податоци за да го добиете Google формуларот директно на Вашата е-пошта:
            </h1>

          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block font-bold mb-1">Е-пошта *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Внесете ја вашата е-пошта"
                  required
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-600">{formik.errors.email}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="phone" className="block font-bold mb-1">Телефонски број *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Внесете го вашиот телефонски број"
                  required
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                />
                {formik.touched.phone && formik.errors.phone ? (
                  <div className="text-red-600">{formik.errors.phone}</div>
                ) : null}
              </div>

              <div className="font-bold">Откако ќе го поднесете формуларот, проверете го Вашето е-сандаче и spam/junk фолдерот за Google формуларот. Пополнете го заедно со Вашето дете и добијте персонализиран академски план прилагоден на неговите потреби и совети за како Вие можете да му помогнете уште денес!</div>

              <Button
                type="submit"
                className="w-full bg-sky hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Поднеси"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}