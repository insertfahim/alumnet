import { User } from "@/types";

// Authentication helper functions
export const AuthUtils = {
    // Check if user is authenticated
    isAuthenticated: (user: User | null): boolean => {
        return user !== null;
    },

    // Check if user is admin
    isAdmin: (user: User | null): boolean => {
        return user?.role === "ADMIN";
    },

    // Check if user is alumni
    isAlumni: (user: User | null): boolean => {
        return user?.role === "ALUMNI";
    },

    // Check if user has verified email
    hasVerifiedEmail: (user: User | null): boolean => {
        return (
            user?.emailVerified !== null && user?.emailVerified !== undefined
        );
    },

    // Check if user is verified by admin
    isVerifiedByAdmin: (user: User | null): boolean => {
        return user?.isVerified === true;
    },

    // Check if user can access admin features
    canAccessAdmin: (user: User | null): boolean => {
        return AuthUtils.isAuthenticated(user) && AuthUtils.isAdmin(user);
    },

    // Check if user can access alumni features
    canAccessAlumniFeatures: (user: User | null): boolean => {
        return (
            AuthUtils.isAuthenticated(user) &&
            (AuthUtils.isAlumni(user) || AuthUtils.isAdmin(user)) &&
            AuthUtils.hasVerifiedEmail(user)
        );
    },

    // Check if user can access premium features (verified alumni)
    canAccessPremiumFeatures: (user: User | null): boolean => {
        return (
            AuthUtils.canAccessAlumniFeatures(user) &&
            AuthUtils.isVerifiedByAdmin(user)
        );
    },

    // Get user display name
    getDisplayName: (user: User | null): string => {
        if (!user) return "Guest";
        return `${user.firstName} ${user.lastName}`.trim() || user.email;
    },

    // Get user initials for avatar
    getUserInitials: (user: User | null): string => {
        if (!user) return "G";
        const firstName = user.firstName?.charAt(0).toUpperCase() || "";
        const lastName = user.lastName?.charAt(0).toUpperCase() || "";
        return firstName + lastName || user.email.charAt(0).toUpperCase();
    },

    // Get graduation info
    getGraduationInfo: (user: User | null): string => {
        if (!user) return "";
        return `${user.degree} in ${user.major} (${user.graduationYear})`;
    },

    // Check if user profile is complete
    isProfileComplete: (user: User | null): boolean => {
        if (!user) return false;
        return !!(
            user.firstName &&
            user.lastName &&
            user.graduationYear &&
            user.degree &&
            user.major &&
            user.bio &&
            user.currentCompany &&
            user.currentPosition
        );
    },

    // Get profile completion percentage
    getProfileCompletionPercentage: (user: User | null): number => {
        if (!user) return 0;

        const requiredFields = [
            user.firstName,
            user.lastName,
            user.graduationYear,
            user.degree,
            user.major,
        ];

        const optionalFields = [
            user.bio,
            user.currentCompany,
            user.currentPosition,
            user.location,
            user.linkedinUrl,
            user.profilePicture,
        ];

        const completedRequired = requiredFields.filter(
            (field) => !!field
        ).length;
        const completedOptional = optionalFields.filter(
            (field) => !!field
        ).length;

        const requiredWeight = 0.7; // 70% weight for required fields
        const optionalWeight = 0.3; // 30% weight for optional fields

        const requiredScore =
            (completedRequired / requiredFields.length) * requiredWeight;
        const optionalScore =
            (completedOptional / optionalFields.length) * optionalWeight;

        return Math.round((requiredScore + optionalScore) * 100);
    },

    // Format user role for display
    formatRole: (role: string): string => {
        switch (role) {
            case "ADMIN":
                return "Administrator";
            case "ALUMNI":
                return "Alumni";
            default:
                return "User";
        }
    },

    // Check if user can message another user
    canMessageUser: (
        currentUser: User | null,
        targetUser: User | null
    ): boolean => {
        if (!currentUser || !targetUser) return false;
        if (currentUser.id === targetUser.id) return false;

        // Admins can message anyone
        if (AuthUtils.isAdmin(currentUser)) return true;

        // Verified alumni can message other verified alumni
        return (
            AuthUtils.canAccessPremiumFeatures(currentUser) &&
            AuthUtils.canAccessAlumniFeatures(targetUser)
        );
    },

    // Check if user can view another user's full profile
    canViewFullProfile: (
        currentUser: User | null,
        targetUser: User | null
    ): boolean => {
        if (!currentUser || !targetUser) return false;

        // Users can always view their own profile
        if (currentUser.id === targetUser.id) return true;

        // Admins can view any profile
        if (AuthUtils.isAdmin(currentUser)) return true;

        // Verified alumni can view other verified alumni profiles
        return (
            AuthUtils.canAccessPremiumFeatures(currentUser) &&
            AuthUtils.isVerifiedByAdmin(targetUser)
        );
    },

    // Get verification status message
    getVerificationStatusMessage: (
        user: User | null
    ): { message: string; type: "success" | "warning" | "error" | "info" } => {
        if (!user) {
            return { message: "Please log in", type: "info" };
        }

        if (!AuthUtils.hasVerifiedEmail(user)) {
            return {
                message:
                    "Please verify your email address to access all features",
                type: "warning",
            };
        }

        if (!AuthUtils.isVerifiedByAdmin(user) && AuthUtils.isAlumni(user)) {
            return {
                message: "Your account is pending admin verification",
                type: "info",
            };
        }

        if (AuthUtils.isVerifiedByAdmin(user)) {
            return {
                message: "Your account is fully verified",
                type: "success",
            };
        }

        return { message: "Account status normal", type: "info" };
    },
};
