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

import { FaGoogle } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { observer } from "mobx-react";
import MobxStore from "../mobx";

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  lastname: z.string().min(4, {
    message: "Lastname must be at least 4 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
});

export const SignupForm = observer(() => {
  const { signupWithEmail } = MobxStore;
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values) {
    const { name, lastname, academicLevel, email, password } = values;
    setIsLoading(true);

    try {
      // Regular signup
      await signupWithEmail(email, password, name, lastname, academicLevel);

      setIsLoading(false);
      router.push("/dashboard"); // Redirect after successful operation
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
          name="name"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="string"
                  placeholder="Име"
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
              <FormLabel>Lastname</FormLabel>
              <FormControl>
                <Input
                  id="lastname"
                  type="string"
                  placeholder="Презиме"
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
              <FormLabel>Academy Level</FormLabel>
              <FormControl>
                <Input
                  id="academicLevel"
                  type="string"
                  placeholder="академско ниво"
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
                  placeholder="Password (8+ characters)"
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
          Create Account
        </Button>
      </form>
    </Form>
  );
});

const SignupCard = observer(() => {
  const router = useRouter();

  return (
    <Card className="min-w-3xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create Account</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <SignupForm />
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-center text-sm text-muted-foreground">
          By continuing, you agree to Pathway&apos;s{" "}
          <Link href="/terms">Terms & Conditions</Link> and
          <Link href="/privacy"> Privacy Policy</Link>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          Already Have An Account?{" "}
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
});

const Signup = () => {
  return (
    <div className="mt-8 flex items-center justify-center">
      <SignupCard />
    </div>
  );
};
export default Signup;
