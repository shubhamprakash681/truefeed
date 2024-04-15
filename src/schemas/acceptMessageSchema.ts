import { z } from "zod";

export const acceptMessagesValidator = z.object({
  acceptMessages: z.boolean(),
});
