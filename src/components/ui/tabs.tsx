"use client";

import { createContext, useContext, useState } from "react";
import { clsx } from "clsx";

const TabsContext = createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
    const [value, setValue] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ value, onValueChange: setValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={clsx(
                "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
                className
            )}
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.value === value;

    return (
        <button
            className={clsx(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                className
            )}
            onClick={() => context.onValueChange(value)}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.value !== value) return null;

    return <div className={className}>{children}</div>;
}
