import { z } from "zod";

const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),

    // Authentication
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    JWT_SECRET: z.string().min(32),

    // Email (SMTP)
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().transform((val) => parseInt(val, 10)),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_FROM: z.string().email(),

    // Storage (S3-compatible)
    S3_ENDPOINT: z.string().url(),
    S3_REGION: z.string(),
    S3_BUCKET: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),

    // Redis (BullMQ)
    REDIS_URL: z.string().url(),

    // Application
    APP_URL: z.string().url(),
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    // Optional features
    ENABLE_EMAIL_VERIFICATION: z
        .string()
        .transform((val) => val === "true")
        .default("false"),
    ENABLE_RATE_LIMITING: z
        .string()
        .transform((val) => val === "true")
        .default("true"),
});

// Validate environment variables
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ Invalid environment variables:");
            error.errors.forEach((err) => {
                console.error(`  ${err.path.join(".")}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
}

export const env = validateEnv();

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
