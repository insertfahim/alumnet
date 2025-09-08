"use client";

import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock RadioGroup implementation
const RadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value?: string;
        onValueChange?: (value: string) => void;
    }
>(({ className, value, onValueChange, children, ...props }, ref) => {
    return (
        <div
            className={cn("grid gap-2", className)}
            {...props}
            ref={ref}
            role="radiogroup"
        >
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        ...child.props,
                        checked: child.props.value === value,
                        onChange: () => onValueChange?.(child.props.value),
                    });
                }
                return child;
            })}
        </div>
    );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & {
        value?: string;
    }
>(({ className, value, ...props }, ref) => {
    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input
                ref={ref}
                type="radio"
                value={value}
                className={cn(
                    "h-4 w-4 rounded-full border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            />
            <div className="relative">
                {props.checked && (
                    <Circle className="absolute inset-0 h-2.5 w-2.5 fill-current text-blue-600" />
                )}
            </div>
        </label>
    );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
