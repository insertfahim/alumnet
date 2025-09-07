import ImageKit from "imagekit";

// Initialize ImageKit
export const imagekit = new ImageKit({
    publicKey: "public_uYn8YrnqRSiXK8cAWLvdu8BufSA=",
    privateKey: "private_xI5pbsKbTjIPEs/TH3Wm+kvCraQ=",
    urlEndpoint: "https://ik.imagekit.io/faahim06",
});

// Helper function to upload image
export async function uploadImageToImageKit(
    file: Buffer,
    fileName: string,
    folder: string = "verification"
): Promise<{ url: string; fileId: string }> {
    try {
        const result = await imagekit.upload({
            file: file,
            fileName: fileName,
            folder: folder,
            useUniqueFileName: true,
        });

        return {
            url: result.url,
            fileId: result.fileId,
        };
    } catch (error) {
        console.error("ImageKit upload error:", error);
        throw new Error("Failed to upload image");
    }
}

// Helper function to delete image
export async function deleteImageFromImageKit(fileId: string): Promise<void> {
    try {
        await imagekit.deleteFile(fileId);
    } catch (error) {
        console.error("ImageKit delete error:", error);
        throw new Error("Failed to delete image");
    }
}

// Helper function to get image transformations for different sizes
export function getImageUrl(url: string, transformations?: string): string {
    if (!transformations) return url;

    // Add transformations to ImageKit URL
    const urlParts = url.split("/");
    const filename = urlParts.pop();
    const baseUrl = urlParts.join("/");

    return `${baseUrl}/tr:${transformations}/${filename}`;
}

// Common transformations
export const imageTransforms = {
    thumbnail: "w-150,h-150,c-fill",
    profilePicture: "w-300,h-300,c-fill,fo-face",
    verificationProof: "w-800,h-600,c-maintain_ratio",
};
