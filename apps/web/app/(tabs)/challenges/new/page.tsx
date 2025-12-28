import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import { getChallengeTemplates, getChallengeCategories } from "@/lib/data/challenges";
import { getFriends } from "@/lib/data/friends";
import CreateChallengeWizard from "@/components/challenges/CreateChallengeWizard";

export default async function NewChallengePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [templates, categories, friends] = await Promise.all([
    getChallengeTemplates(),
    getChallengeCategories(),
    getFriends(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Create Challenge
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Challenge your friends or the public arena.
        </p>
      </header>

      <CreateChallengeWizard
        templates={templates}
        categories={categories}
        friends={friends}
      />
    </div>
  );
}
