import { forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant = "primary", size = "md", children, ...props },
        ref
    ) => {
        return (
            <button
                className={clsx(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600":
                            variant === "default" || variant === "primary",
                        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-600":
                            variant === "secondary",
                        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-600":
                            variant === "outline",
                        "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-600":
                            variant === "ghost",
                    },
                    {
                        "h-8 px-3 text-sm": size === "sm",
                        "h-10 px-4 text-sm": size === "md",
                        "h-12 px-6 text-base": size === "lg",
                    },
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
