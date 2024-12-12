import z, { string } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ZapSchema = z.object({
  availabletriggerId: string(),
  triggerMetadata: z.any().optional(),
  actions: z.array(
    z.object({
      availableactionId: string(),
      actionMetadata: z.any().optional(),
    })
  ),
});
