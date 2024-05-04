"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signupSchemaValidator } from "@/schemas/signupSchema";
import { ApiResponse } from "@/types/ApiResponse";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameMessage, setUsernameMessage] = useState<string>("");
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const debounced = useDebounceCallback(setUsername, 500);

  const { toast } = useToast();
  const router = useRouter();

  // zod
  const signupForm = useForm<z.infer<typeof signupSchemaValidator>>({
    resolver: zodResolver(signupSchemaValidator),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // useEffect for validating (checking) entered username is valid (correct) or not using API
  useEffect(() => {
    const checkUsername = async () => {
      setIsCheckingUsername(true);
      setUsernameMessage("");

      try {
        const response = await axios.get(
          `/api/user/check-username-unique?username=${username}`
        );

        setUsernameMessage(response.data.message);
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;

        setUsernameMessage(
          axiosError.response?.data.message ?? "Error validating username"
        );
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [username]);

  const signupSubmitHandler = async (
    values: z.infer<typeof signupSchemaValidator>
  ) => {
    try {
      setIsSubmitting(true);

      const response = await axios.post<ApiResponse>("/api/signup", values);

      toast({
        title: "Success",
        description: response.data.message,
      });

      router.replace(`/verify/${username}`);
    } catch (err) {
      console.error("Error signing up", err);

      const axiosError = err as AxiosError<ApiResponse>;

      toast({
        variant: "destructive",
        title: "Signup fail!",
        description: axiosError.response?.data.message ?? "Error signing up",
      });
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

            <p className="mb-4">Sign up to start your anonymous adventure</p>
          </div>

          <Form {...signupForm}>
            <form
              onSubmit={signupForm.handleSubmit(signupSubmitHandler)}
              className="space-y-6"
            >
              <FormField
                control={signupForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          debounced(e.target.value);
                        }}
                      />
                    </FormControl>

                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                    <p
                      className={`text-xs ${
                        usernameMessage.includes("available")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameMessage}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email"
                        {...field}
                        onChange={(e) => field.onChange(e)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex w-full max-w-sm items-center space-x-1">
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="password"
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
                    "Signup"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center mt-4">
            <p>
              Already a member?{" "}
              <Link
                href={"/login"}
                className="text-blue-500 hover:text-blue-800"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
