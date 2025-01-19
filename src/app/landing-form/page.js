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
  phone: Yup.string().matches(/^[0-9+\s-]+$/, "Invalid phone number"),
});

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
            subject: "Thanks for Your Interest!",
            text: "Hey thanks for showing interest! Here is the link to the google form: https://docs.google.com/forms/d/1ByGyaG80p47Q6mZbO1BY3B7G60NOuQ2Y-MLb5T5x_xA/alreadyresponded?pli=1&pli=1&pli=1",
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
                <label htmlFor="phone" className="block font-bold mb-1">Телефонски број</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Внесете го вашиот телефонски број"
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