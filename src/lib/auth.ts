import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "./env";

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 12);
};

export const comparePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } | null => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        return decoded;
    } catch (error) {
        return null;
    }
};

export const generatePasswordResetToken = (): string => {
    return jwt.sign({ purpose: "password_reset" }, env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

export const verifyPasswordResetToken = (token: string): boolean => {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            purpose: string;
        };
        return decoded.purpose === "password_reset";
    } catch (error) {
        return false;
    }
};
