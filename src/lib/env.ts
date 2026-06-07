import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://formrelay:formrelay@localhost:5188/formrelay?schema=public"),
  DIRECT_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_SES_FROM_EMAIL: z
    .string()
    .default("FormRelay <forms@example.com>")
    .refine((value) => /.+@.+/.test(value), "AWS_SES_FROM_EMAIL must contain an email address"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  SESSION_SECRET: z.string().min(16).default("dev-session-secret-change-me"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET,
});
