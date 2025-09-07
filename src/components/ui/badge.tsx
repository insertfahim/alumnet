import { forwardRef } from "react";
import { clsx } from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    {
                        "border-transparent bg-primary-600 text-white hover:bg-primary-700":
                            variant === "default",
                        "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200":
                            variant === "secondary",
                        "border-gray-300 text-gray-700 hover:bg-gray-50":
                            variant === "outline",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";
