import { z } from "zod";

export const endpointConfigSchema = z.object({
  authBackendUrl: z.string().url(),
  authPrefix: z.string().min(1),
});

export const loginInputSchema = z.object({
  account: z.string().min(1),
  password: z.string().min(1),
});
