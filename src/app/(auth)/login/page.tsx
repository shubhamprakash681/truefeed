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
import { useToast } from "@/components/ui/use-toast";
import { signinSchemaValidator } from "@/schemas/signinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const LoginPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  // zod
  const loginForm = useForm<z.infer<typeof signinSchemaValidator>>({
    resolver: zodResolver(signinSchemaValidator),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const loginSubmitHandler = async (
    values: z.infer<typeof signinSchemaValidator>
  ) => {
    try {
      setIsSubmitting(true);

      const res = await signIn("credentials", {
        redirect: false,
        identifier: values.identifier,
        password: values.password,
      });

      // console.log("res: ", res);

      if (res?.error) {
        console.error("Error signing up", res.error);

        toast({
          variant: "destructive",
          title: "Login failed!",
          description: res.error ?? "Incorrect email/username or password",
        });
      }

      if (res?.url) {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error("Error signing up", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-container flex justify-center items-center bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              TrueFeed
            </h1>

            <p className="mb-4">Login to continue with your adventure</p>
          </div>

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(loginSubmitHandler)}
              className="space-y-6"
            >
              <FormField
                control={loginForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username or email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex w-full max-w-sm items-center space-x-1">
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          onChange={(e) => field.onChange(e)}
                        />

                        {isPasswordVisible ? (
                          <Button
                            variant={"outline"}
                            onClick={() => setIsPasswordVisible(false)}
                          >
                            <EyeOff className="animate-in" width={"15px"} />
                          </Button>
                        ) : (
                          <Button
                            variant={"outline"}
                            onClick={() => setIsPasswordVisible(true)}
                          >
                            <Eye className="animate-out" width={"15px"} />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center items-center  w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={
                    isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center mt-4">
            <p>
              Don't have an account?{" "}
              <Link
                href={"/signup"}
                className="text-blue-500 hover:text-blue-800"
              >
                Signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
