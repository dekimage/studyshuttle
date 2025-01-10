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
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\s-]+$/, "Invalid phone number")
    .required("Phone number is required"),
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
      name: "",
      email: "",
      phoneNumber: "",
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
            text: "Hey thanks for showing interest! Here is the link to the google form: [YOUR_GOOGLE_FORM_LINK_HERE]",
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Transform Your Learning Journey
            </h1>
            <p className="text-xl text-gray-600">
              Join our community of successful students and take your education to the next level
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  {...formik.getFieldProps("name")}
                  className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                )}
              </div>

              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  {...formik.getFieldProps("email")}
                  className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                )}
              </div>

              <div>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Your Phone Number"
                  {...formik.getFieldProps("phoneNumber")}
                  className={formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500" : ""}
                />
                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.phoneNumber}</div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Get Started Now"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}