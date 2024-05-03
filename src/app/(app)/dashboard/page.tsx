"use client";

import { useToast } from "@/components/ui/use-toast";
import { IMessage } from "@/model/Message";
import { acceptMessagesValidator } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IUser } from "@/model/User";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";

const DashboardPage = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const { data: session } = useSession();

  const { register, watch, setValue } = useForm<
    z.infer<typeof acceptMessagesValidator>
  >({
    resolver: zodResolver(acceptMessagesValidator),
    defaultValues: {
      acceptMessages: true,
    },
  });
  const acceptMessages = watch("acceptMessages");

  const getAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const res = await axios.get<ApiResponse>("/api/messages/accept");

      res?.data?.isAcceptingMessage &&
        setValue("acceptMessages", res.data.isAcceptingMessage);
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;

      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Eroor getting isAcceptingMessages",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const getMessages = useCallback(
    async (isRefreshing: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(true);

      try {
        const res = await axios.get<ApiResponse>("/api/messages/getMessages");

        setMessages(res.data.messages || []);

        if (isRefreshing) {
          toast({
            title: "Refreshed messages",
            description: "Showing latest messages",
          });
        }
      } catch (err) {
        const axiosError = err as AxiosError<ApiResponse>;

        toast({
          title: "Error",
          description:
            axiosError.response?.data.message || "Eroor getting messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setMessages(
        messages.filter((message: IMessage) => message._id !== messageId)
      );
    } catch (err) {}
  };

  useEffect(() => {
    if (!session || !session.user) return;

    getMessages();
    getAcceptMessages();
  }, [session, setValue, getAcceptMessages, getMessages]);

  const handleSwitchChange = async () => {
    try {
      const res = await axios.post<ApiResponse>("/api/messages/accept", {
        acceptMessages: !acceptMessages,
      });

      setValue("acceptMessages", !acceptMessages);

      toast({
        title: "Success",
        description: res.data.message,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>;

      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Eroor switching isAcceptingMessages",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL copied!",
      description: "Profile URL has been copied to clipboard",
    });
  };

  if (!session || !session.user) {
    return <div>Please Login to continue!</div>;
  }

  const { username } = session.user as IUser;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  return (
    <div className="my-8 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="ml-4"
        variant={"outline"}
        onClick={(e) => {
          e.preventDefault();
          getMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className=" mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => <div>Message card</div>)
        ) : (
          <p>No message to display</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
