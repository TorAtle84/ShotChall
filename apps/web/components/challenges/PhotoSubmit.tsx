"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { processImage, generateStoragePath } from "@/lib/image-utils";
import { submitToChallenge } from "@/app/challenges/actions";

type Props = {
    challengeId: string;
    userId: string;
};

export default function PhotoSubmit({ challengeId, userId }: Props) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string>("");
    const [error, setError] = useState("");

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Max 25MB
        if (file.size > 25 * 1024 * 1024) {
            setError("Image must be less than 25MB");
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setError("");
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        setError("");
        setUploadProgress("Processing image...");

        startTransition(async () => {
            try {
                // Process image (resize + thumbnail)
                const { displayBlob, thumbBlob } = await processImage(selectedFile);
                setUploadProgress("Uploading...");

                const supabase = createSupabaseBrowserClient();

                // Generate paths
                const displayPath = generateStoragePath(userId, challengeId, "");
                const thumbPath = generateStoragePath(userId, challengeId, "-thumb");

                // Upload display image
                const { error: displayError } = await supabase.storage
                    .from("submissions")
                    .upload(displayPath, displayBlob, {
                        contentType: "image/jpeg",
                        upsert: false,
                    });

                if (displayError) {
                    throw new Error(`Upload failed: ${displayError.message}`);
                }

                // Upload thumbnail
                const { error: thumbError } = await supabase.storage
                    .from("submissions")
                    .upload(thumbPath, thumbBlob, {
                        contentType: "image/jpeg",
                        upsert: false,
                    });

                if (thumbError) {
                    throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
                }

                setUploadProgress("Saving submission...");

                // Get public URLs
                const { data: displayUrl } = supabase.storage
                    .from("submissions")
                    .getPublicUrl(displayPath);

                const { data: thumbUrl } = supabase.storage
                    .from("submissions")
                    .getPublicUrl(thumbPath);

                // Create submission record
                const result = await submitToChallenge(
                    challengeId,
                    displayUrl.publicUrl,
                    thumbUrl.publicUrl
                );

                if (result.error) {
                    throw new Error(result.error);
                }

                setUploadProgress("");
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
                setUploadProgress("");
            }
        });
    };

    const handleCancel = () => {
        setPreview(null);
        setSelectedFile(null);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />

            {!preview ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="w-full rounded-2xl bg-[color:var(--color-accent)] px-5 py-4 text-sm font-semibold text-white shadow-md shadow-orange-200/60 disabled:opacity-50"
                >
                    📸 Take Photo or Choose from Gallery
                </button>
            ) : (
                <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                        <img
                            src={preview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {uploadProgress && (
                        <div className="text-center text-sm text-[color:var(--color-muted)]">
                            {uploadProgress}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={isPending}
                            className="flex-1 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-semibold text-[color:var(--color-muted)] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="flex-1 rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/60 disabled:opacity-50"
                        >
                            {isPending ? "Submitting..." : "Submit Photo"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
