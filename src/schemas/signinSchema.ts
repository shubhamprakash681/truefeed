import { z } from "zod";

export const signinSchemaValidator = z.object({
  identifier: z.string(),
  password: z.string(),
});
