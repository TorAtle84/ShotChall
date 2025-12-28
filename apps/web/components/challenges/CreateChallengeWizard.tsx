"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createChallenge } from "@/app/challenges/actions";
import type { ChallengeTemplate } from "@/lib/data/challenges";
import type { Friend } from "@/lib/data/friends";

type Props = {
    templates: ChallengeTemplate[];
    categories: { id: string; name: string; slug: string }[];
    friends: Friend[];
};

type Step = "type" | "prompt" | "time" | "recipients" | "confirm";

export default function CreateChallengeWizard({ templates, categories, friends }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");

    const [step, setStep] = useState<Step>("type");
    const [challengeType, setChallengeType] = useState<"text" | "photo">("text");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState("");
    const [rulesNote, setRulesNote] = useState("");
    const [timeLimitHours, setTimeLimitHours] = useState(24);
    const [visibility, setVisibility] = useState<"private" | "public">("private");
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    const handleSubmit = () => {
        setError("");
        startTransition(async () => {
            const result = await createChallenge({
                type: challengeType,
                templateId: selectedTemplateId || undefined,
                promptText: customPrompt || selectedTemplate?.text || undefined,
                rulesNote: rulesNote || undefined,
                visibility,
                timeLimitHours,
                recipientIds: visibility === "private" ? selectedFriends : undefined,
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            router.push(`/challenges/${result.challengeId}`);
        });
    };

    const toggleFriend = (id: string) => {
        setSelectedFriends((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id].slice(0, 10)
        );
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Challenge Type */}
            {step === "type" && (
                <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Challenge Type
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <button
                            onClick={() => setChallengeType("text")}
                            className={`rounded-3xl border p-5 text-left shadow-sm transition ${challengeType === "text"
                                    ? "border-[color:var(--color-accent)] bg-orange-50"
                                    : "border-white/70 bg-white/80"
                                }`}
                        >
                            <h3 className="font-display text-xl text-[color:var(--color-foreground)]">
                                Text Challenge
                            </h3>
                            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                                Pick a template or write your own prompt.
                            </p>
                        </button>
                        <button
                            onClick={() => setChallengeType("photo")}
                            className={`rounded-3xl border p-5 text-left shadow-sm transition ${challengeType === "photo"
                                    ? "border-[color:var(--color-accent)] bg-orange-50"
                                    : "border-white/70 bg-white/80"
                                }`}
                        >
                            <h3 className="font-display text-xl text-[color:var(--color-foreground)]">
                                Photo Imitation
                            </h3>
                            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                                Upload a reference photo to recreate.
                            </p>
                        </button>
                    </div>
                    <button
                        onClick={() => setStep("prompt")}
                        className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
                    >
                        Continue
                    </button>
                </section>
            )}

            {/* Step 2: Prompt Selection */}
            {step === "prompt" && (
                <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        {challengeType === "text" ? "Choose a Prompt" : "Upload Reference"}
                    </h2>

                    {challengeType === "text" && (
                        <>
                            <div className="grid gap-3 max-h-64 overflow-y-auto">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => {
                                            setSelectedTemplateId(template.id);
                                            setCustomPrompt("");
                                        }}
                                        className={`rounded-2xl border p-4 text-left transition ${selectedTemplateId === template.id
                                                ? "border-[color:var(--color-accent)] bg-orange-50"
                                                : "border-white/70 bg-white/80"
                                            }`}
                                    >
                                        <p className="text-sm font-medium text-[color:var(--color-foreground)]">
                                            {template.text}
                                        </p>
                                        {template.categoryName && (
                                            <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                                                {template.categoryName}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs text-[color:var(--color-muted)]">or</p>
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => {
                                    setCustomPrompt(e.target.value);
                                    setSelectedTemplateId(null);
                                }}
                                placeholder="Write your own prompt..."
                                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
                            />
                        </>
                    )}

                    {challengeType === "photo" && (
                        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center">
                            <p className="text-sm text-[color:var(--color-muted)]">
                                Photo upload coming soon
                            </p>
                        </div>
                    )}

                    <textarea
                        value={rulesNote}
                        onChange={(e) => setRulesNote(e.target.value)}
                        placeholder="Add rules or extra instructions (optional)"
                        rows={2}
                        className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep("type")}
                            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)]"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep("time")}
                            disabled={!selectedTemplateId && !customPrompt && challengeType === "text"}
                            className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60 disabled:opacity-50"
                        >
                            Continue
                        </button>
                    </div>
                </section>
            )}

            {/* Step 3: Time Limit */}
            {step === "time" && (
                <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Time Limit
                    </h2>
                    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="6"
                                max="48"
                                step="1"
                                value={timeLimitHours}
                                onChange={(e) => setTimeLimitHours(Number(e.target.value))}
                                className="flex-1 accent-[color:var(--color-accent)]"
                            />
                            <span className="min-w-16 text-right font-display text-2xl text-[color:var(--color-foreground)]">
                                {timeLimitHours}h
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                            Participants have {timeLimitHours} hours to submit their photo.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep("prompt")}
                            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)]"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep("recipients")}
                            className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
                        >
                            Continue
                        </button>
                    </div>
                </section>
            )}

            {/* Step 4: Recipients */}
            {step === "recipients" && (
                <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Recipients
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <button
                            onClick={() => setVisibility("private")}
                            className={`rounded-3xl border p-5 text-left shadow-sm transition ${visibility === "private"
                                    ? "border-[color:var(--color-accent)] bg-orange-50"
                                    : "border-white/70 bg-white/80"
                                }`}
                        >
                            <h3 className="font-display text-xl text-[color:var(--color-foreground)]">
                                Private
                            </h3>
                            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                                Challenge specific friends.
                            </p>
                        </button>
                        <button
                            onClick={() => setVisibility("public")}
                            className={`rounded-3xl border p-5 text-left shadow-sm transition ${visibility === "public"
                                    ? "border-[color:var(--color-accent)] bg-orange-50"
                                    : "border-white/70 bg-white/80"
                                }`}
                        >
                            <h3 className="font-display text-xl text-[color:var(--color-foreground)]">
                                Public Arena
                            </h3>
                            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                                Anyone can join and compete.
                            </p>
                        </button>
                    </div>

                    {visibility === "private" && (
                        <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                                Select friends (max 10)
                            </p>
                            {friends.length === 0 ? (
                                <p className="text-sm text-[color:var(--color-muted)]">
                                    No friends yet. Add friends first!
                                </p>
                            ) : (
                                <div className="grid gap-2 max-h-48 overflow-y-auto">
                                    {friends.map((friend) => (
                                        <button
                                            key={friend.id}
                                            onClick={() => toggleFriend(friend.id)}
                                            className={`flex items-center gap-3 rounded-xl p-2 text-left transition ${selectedFriends.includes(friend.id)
                                                    ? "bg-orange-100"
                                                    : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-xs font-bold text-white">
                                                {friend.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">@{friend.username}</span>
                                            {selectedFriends.includes(friend.id) && (
                                                <span className="ml-auto text-orange-500">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep("time")}
                            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)]"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => setStep("confirm")}
                            disabled={visibility === "private" && selectedFriends.length === 0}
                            className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60 disabled:opacity-50"
                        >
                            Continue
                        </button>
                    </div>
                </section>
            )}

            {/* Step 5: Confirm */}
            {step === "confirm" && (
                <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Confirm Challenge
                    </h2>
                    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm space-y-3">
                        <div>
                            <p className="text-xs text-[color:var(--color-muted)]">Prompt</p>
                            <p className="font-medium text-[color:var(--color-foreground)]">
                                {customPrompt || selectedTemplate?.text || "Photo Challenge"}
                            </p>
                        </div>
                        {rulesNote && (
                            <div>
                                <p className="text-xs text-[color:var(--color-muted)]">Rules</p>
                                <p className="text-sm text-[color:var(--color-foreground)]">{rulesNote}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-[color:var(--color-muted)]">Time Limit</p>
                            <p className="font-medium text-[color:var(--color-foreground)]">{timeLimitHours} hours</p>
                        </div>
                        <div>
                            <p className="text-xs text-[color:var(--color-muted)]">Visibility</p>
                            <p className="font-medium text-[color:var(--color-foreground)]">
                                {visibility === "public" ? "Public Arena" : `${selectedFriends.length} friends selected`}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep("recipients")}
                            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)]"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60 disabled:opacity-50"
                        >
                            {isPending ? "Creating..." : "Create Challenge"}
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}
