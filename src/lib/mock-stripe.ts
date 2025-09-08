// Mock Stripe implementation for development
export interface Stripe {
    redirectToCheckout: (options: {
        sessionId: string;
    }) => Promise<{ error?: { message: string } }>;
}

export const loadStripe = async (publishableKey: string): Promise<Stripe> => {
    // Mock implementation
    console.log("Mock Stripe loaded with key:", publishableKey);

    return {
        redirectToCheckout: async (options) => {
            console.log("Mock redirectToCheckout called with:", options);
            // Simulate successful payment
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return {};
        },
    };
};
