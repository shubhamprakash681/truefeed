import { z } from "zod";

const usernameValidation = z
  .string()
  .trim()
  .min(2, { message: "Username must be of atleast 2 characters" })
  .max(20, { message: "Username must not be more than 20 characters" })
  .regex(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/, {
    message: "Username must not contain special characters",
  });

// used regex summary:
// The username can consist of alphanumeric characters.
// Internal separators (spaces, underscores, or hyphens) are allowed.
// The first and last character must be alphanumeric.

const emailValidation = z.string().email({ message: "Invalid email address" });
const passwordValidation = z
  .string()
  .min(6, { message: "Password must be of atleast 6 characters" });

export const signupSchemaValidator = z.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation,
});
