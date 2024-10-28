"use client";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { CgSpinner } from "react-icons/cg";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { observer } from "mobx-react";
import MobxStore from "../mobx";
import { ChevronDown, ChevronUp } from "lucide-react";

// Validation schema
const formSchema = z
  .object({
    name: z.string().min(3, {
      message: "Името мора да содржи најмалку 3 карактери.",
    }),
    lastname: z.string().min(3, {
      message: "Презимето мора да содржи најмалку 3 карактери.",
    }),
    password: z.string().min(6, {
      message: "Лозинката мора да содржи најмалку 6 карактери.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Потврдата на лозинката мора да содржи најмалку 6 карактери.",
    }),
    email: z.string().email({
      message: "Ве молиме внесете валидна емаил адреса.",
    }),
    academicLevel: z.enum(["osnovno", "sredno", "visoko"], {
      required_error: "Ве молиме одберете академско ниво.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Лозинките мора да се совпаѓаат.",
    path: ["confirmPassword"], // Optional: Indicates where to show the error
  });

export const SignupForm = observer(() => {
  const { signupWithEmail, user, userReady } = MobxStore;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [academicLevel, setAcademicLevel] = useState("osnovno");
  const router = useRouter();

  useEffect(() => {
    if (user && userReady) {
      router.push("/pocetna");
    }
  }, [user, userReady, router]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastname: "",
      password: "",
      confirmPassword: "",
      email: "",
      academicLevel: "osnovno",
    },
  });

  async function onSubmit(values) {
    const { name, lastname, academicLevel, email, password } = values;
    setIsLoading(true);

    try {
      // Regular signup
      await signupWithEmail(email, password, name, lastname, academicLevel);

      setIsLoading(false);
      router.push("/pocetna"); // Redirect after successful operation
    } catch (error) {
      // Handle errors
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        id="signup"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Име</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="string"
                  placeholder="Внесете го вашето име"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastname"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Презиме</FormLabel>
              <FormControl>
                <Input
                  id="lastname"
                  type="string"
                  placeholder="Внесете го вашето презиме"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Емаил адреса</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="Внесете ја вашата емаил адреса"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="academicLevel"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Академско ниво</FormLabel>
              <FormControl>
                <div className="relative">
                  <Button
                    type="button"
                    className="flex w-full items-center justify-between rounded border bg-white px-2 py-1 text-black hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {academicLevel === "osnovno"
                      ? "Основно"
                      : academicLevel === "sredno"
                        ? "Средно"
                        : "Високо"}
                    {isDropdownOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                      <div
                        className="cursor-pointer p-2 hover:bg-sun"
                        onClick={() => {
                          setAcademicLevel("osnovno");
                          setIsDropdownOpen(false);
                          field.onChange("osnovno");
                        }}
                      >
                        Основно
                      </div>
                      <div
                        className="cursor-pointer p-2 hover:bg-sky"
                        onClick={() => {
                          setAcademicLevel("sredno");
                          setIsDropdownOpen(false);
                          field.onChange("sredno");
                        }}
                      >
                        Средно
                      </div>
                      <div
                        className="cursor-pointer p-2 hover:bg-chili"
                        onClick={() => {
                          setAcademicLevel("visoko");
                          setIsDropdownOpen(false);
                          field.onChange("visoko");
                        }}
                      >
                        Високо
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Лозинка</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Внесете ја вашата лозинка"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Потврдете ја лозинката</FormLabel>
              <FormControl>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Потврдете ја вашата лозинка"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className="w-fit cursor-pointer text-xs text-gray-400"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Сокриј лозинка" : "Покажи лозинка"}
        </div>

        <Button
          className="w-full bg-sky hover:bg-sky"
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <CgSpinner className="mr-2 h-4 w-4 animate-spin" />}
          Регистријај се
        </Button>
      </form>
    </Form>
  );
});

const Signup = () => {
  return (
    <div className="mb-32 mt-8 flex items-center justify-center px-4 sm:px-8">
      <div className="w-full max-w-[850px]">
        <div className="mb-8 text-center text-[32px] font-bold sm:text-[65px]">
          Регистрирај се на <br />
          <span className="text-sun">Study Shuttle!</span>
        </div>

        <SignupForm />
        <div className="mt-4 text-center">
          Веќе имате профил?{" "}
          <Link className="ml-1 cursor-pointer text-blue-400" href="/login">
            Најавете се
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;
