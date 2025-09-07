// Simple profile picture utility functions
export const uploadProfilePicture = async (file: File, token: string) => {
    try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const response = await fetch("/api/profile/picture", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Failed to upload profile picture"
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Profile picture upload error:", error);
        throw error;
    }
};

export const deleteProfilePicture = async (token: string) => {
    try {
        const response = await fetch("/api/profile/picture", {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Failed to delete profile picture"
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Profile picture deletion error:", error);
        throw error;
    }
};
