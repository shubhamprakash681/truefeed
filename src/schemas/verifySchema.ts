import { z } from "zod";
import { usernameValidation } from "./signupSchema";

export const verifySchemaValidator = z.object({
  username: usernameValidation,
  verificationCode: z
    .string()
    .length(6, { message: "Verification code must be of 6 digits" }),
});
