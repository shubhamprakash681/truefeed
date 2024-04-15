import { z } from "zod";

export const verifySchemaValidator = z.object({
  verificationCode: z
    .string()
    .length(6, { message: "Verification code must be of 6 digits" }),
});
