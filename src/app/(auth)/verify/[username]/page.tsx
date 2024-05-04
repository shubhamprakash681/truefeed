"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { verifyAccountFormValidator } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // zod
  const accountVerificationForm = useForm<
    z.infer<typeof verifyAccountFormValidator>
  >({
    resolver: zodResolver(verifyAccountFormValidator),
    defaultValues: {
      verificationCode: "",
    },
  });

  const verifyAccountSubmitHandler = async (
    values: z.infer<typeof verifyAccountFormValidator>
  ) => {
    try {
      console.log("values: ", values);

      setIsSubmitting(true);

      const response = await axios.post<ApiResponse>("/api/user/verify", {
        username: params.username,
        verificationCode: values.verificationCode,
      });

      toast({
        title: "Success",
        description: response.data.message,
      });

      router.replace("/login");
    } catch (err) {
      console.error("Error verifying account", err);

      const axiosError = err as AxiosError<ApiResponse>;

      toast({
        variant: "destructive",
        title: "User Account Verification failed!!",
        description:
          axiosError.response?.data.message ?? "Error verifying account",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex page-container justify-center items-center bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl mb-8">
              Verify Your Account
            </h1>
          </div>

          <Form {...accountVerificationForm}>
            <form
              onSubmit={accountVerificationForm.handleSubmit(
                verifyAccountSubmitHandler
              )}
              className="space-y-6"
            >
              <FormField
                control={accountVerificationForm.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                        </InputOTPGroup>
                        <InputOTPSeparator />

                        <InputOTPGroup>
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                        <InputOTPSeparator />

                        <InputOTPGroup>
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Please enter the Verification code sent to your email.
                    </FormDescription>
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
                    "Verify"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
