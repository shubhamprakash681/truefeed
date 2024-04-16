import { IMessage } from "@/model/Message";

export interface ApiResponse {
  success: boolean;
  message: string;

  // optional API response data
  isAcceptingMessages?: boolean;
  messages?: IMessage[];
}
