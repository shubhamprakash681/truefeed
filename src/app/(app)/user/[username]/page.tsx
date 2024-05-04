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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { messageFormValidator } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const UserProfilePage = () => {
  const params = useParams<{ username: string }>();
  const { toast } = useToast();

  const [isSubmittingFeedback, setIsSubmittingFeedback] =
    useState<boolean>(false);

  const messageForm = useForm<z.infer<typeof messageFormValidator>>({
    resolver: zodResolver(messageFormValidator),
    defaultValues: {
      content: "",
    },
  });

  const messageSubmitHandler = async (
    values: z.infer<typeof messageFormValidator>
  ) => {
    console.log("values: ", values);
    console.log("messageForm: ", messageForm);

    setIsSubmittingFeedback(true);

    try {
      const response = await axios.post<ApiResponse>("/api/messages/send", {
        username: params.username,
        content: values.content,
      });

      toast({
        title: "Feedback sent",
        description: response.data.message,
      });
    } catch (err) {
      console.log("Error sending feedback", err);

      const axiosError = err as AxiosError<ApiResponse>;

      toast({
        variant: "destructive",
        title: "Submit Feedback Failed!",
        description:
          axiosError.response?.data.message ?? "Error sending feedback",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="page-container md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-center text-2xl md:text-4xl font-bold mb-6">
        Public Profile
      </h1>

      <p className="font-bold"></p>

      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(messageSubmitHandler)}
          className="space-y-6"
        >
          <FormField
            control={messageForm.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`Send anonymous feedbacks to @${params.username}`}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous feedback here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-evenly">
            <Button
              className={
                isSubmittingFeedback ? "cursor-not-allowed" : "cursor-pointer"
              }
              disabled={isSubmittingFeedback}
              type="submit"
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait!
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserProfilePage;
