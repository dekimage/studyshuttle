"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useState } from "react";

import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import MobxStore from "../mobx";

const formSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
});

export const LoginForm = observer(() => {
  const router = useRouter();
  const { user, loginWithEmail } = MobxStore;
  const isAuthenticated = !!user;

  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    const { email, password } = values;
    setIsLoading(true);

    if (isAuthenticated) {
      setIsLoading(false);
      router.push("/dashboard");
      return;
    }

    await loginWithEmail({
      email,
      password,
    });
    setIsLoading(false);
    router.push("/dashboard");
  }

  return (
    <Form {...form}>
      <form
        id="login"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <CgSpinner className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
      </form>
    </Form>
  );
});

const LoginCard = observer(() => {
  const router = useRouter();
  const { signInWithGoogle } = MobxStore;
  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    router.push("/dashboard");
  };
  return (
    <Card className="min-w-3xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
        <CardDescription>
          Glad to see you again! Log in to continue your journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <LoginForm />
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col gap-2 text-center text-sm">
          Don&apos;t have account?&nbsp;
          <Link href="/signup">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
});

const LoginPage = () => {
  return (
    <div className="mt-8 flex items-center justify-center">
      <LoginCard />
    </div>
  );
};
export default LoginPage;
