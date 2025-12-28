/**
 * Image upload utilities for Supabase Storage
 * Handles client-side resizing and upload to submissions bucket
 */

const MAX_IMAGE_SIZE = 1920; // Max dimension for display image
const THUMB_SIZE = 400; // Thumbnail dimension
const JPEG_QUALITY = 0.85;

/**
 * Resize an image to fit within maxSize while maintaining aspect ratio
 */
export function resizeImage(
    file: File,
    maxSize: number,
    quality: number = JPEG_QUALITY
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            let { width, height } = img;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Draw and export
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Could not create blob"));
                    }
                },
                "image/jpeg",
                quality
            );
        };

        img.onerror = () => reject(new Error("Could not load image"));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Generate display image and thumbnail from original file
 */
export async function processImage(file: File): Promise<{
    displayBlob: Blob;
    thumbBlob: Blob;
}> {
    const [displayBlob, thumbBlob] = await Promise.all([
        resizeImage(file, MAX_IMAGE_SIZE),
        resizeImage(file, THUMB_SIZE),
    ]);

    return { displayBlob, thumbBlob };
}

/**
 * Generate a unique filename for storage
 */
export function generateStoragePath(
    userId: string,
    challengeId: string,
    suffix: string = ""
): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId}/${challengeId}/${timestamp}-${random}${suffix}.jpg`;
}
