import { z } from "zod";
import { usernameValidation } from "./signupSchema";

export const messageSchemaValidator = z.object({
  username: usernameValidation,
  content: z
    .string()
    .min(10, { message: "Content must be of atleast 10 characters" })
    .max(300, "Content must be no longer than 300 characters"),
});
