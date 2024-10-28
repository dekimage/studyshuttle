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

// Validation schema
const formSchema = z.object({
  password: z.string().min(6, {
    message: "Лозинката мора да содржи најмалку 6 карактери.",
  }),
  email: z.string().email({
    message: "Ве молиме внесете валидна емаил адреса.",
  }),
});

export const LoginForm = observer(() => {
  const router = useRouter();
  const { user, userReady, loginWithEmail } = MobxStore;
  const isAuthenticated = !!user;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility
  const [errorMessage, setErrorMessage] = useState("");
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user && userReady) {
      router.push("/pocetna");
    }
  }, [user, userReady, router]);

  async function onSubmit(values) {
    const { email, password } = values;
    setIsLoading(true);
    setErrorMessage(""); // Clear any previous error message

    if (isAuthenticated) {
      setIsLoading(false);
      router.push("/pocetna");
      return;
    }

    try {
      await loginWithEmail({ email, password });
      router.push("/pocetna");
    } catch (error) {
      console.log(error);

      setErrorMessage(
        "Погрешна емаил адреса или лозинка. Ве молиме проверете ги вашите податоци.",
      );
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        id="login"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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
          name="password"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Лозинка</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // Toggle between password and text
                  placeholder="Внесете ја вашата лозинка"
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

        {errorMessage && ( // Display error message if it exists
          <div className="text-sm text-red-500">{errorMessage}</div>
        )}

        <Button
          className="w-full bg-sun font-bold text-black hover:bg-sun"
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <CgSpinner className="mr-2 h-4 w-4 animate-spin" />}
          Најави се
        </Button>

        <Link href="/forgot-password">
          <div className="cursor-pointer text-blue-400">
            Ја заборавивте лознката?
          </div>
        </Link>
      </form>
    </Form>
  );
});

const LoginPage = () => {
  return (
    <div className="mb-32 mt-8 flex items-center justify-center px-4 sm:px-8">
      <div className="w-full max-w-[850px]">
        <div className="mb-8 text-center text-[32px] font-bold text-sun sm:text-[65px]">
          Најави се
        </div>

        <LoginForm />
        <div className="mt-4 text-center">
          Немате профил?
          <Link className="ml-1 cursor-pointer text-blue-400" href="/signup">
            Регистрирај се
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
