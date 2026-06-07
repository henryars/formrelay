"use client";

import { useActionState } from "react";
import { reviewSubmissionSpamAction, type SubmissionActionState } from "@/app/actions/submissions";
import { Button } from "@/components/ui/button";

const initialState: SubmissionActionState = {};

type SubmissionSpamReviewFormProps = {
  submissionId: string;
  mode: "spam" | "recover";
};

export function SubmissionSpamReviewForm({ submissionId, mode }: SubmissionSpamReviewFormProps) {
  const [state, formAction, pending] = useActionState(reviewSubmissionSpamAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="action" value={mode === "recover" ? "MARKED_NOT_SPAM" : "MARKED_SPAM"} />
      {mode === "recover" && (
        <label className="flex items-center gap-2 text-sm text-[#52525b] cursor-pointer">
          <input type="checkbox" name="sendNotificationNow" value="true" className="rounded" />
          Send notification now
        </label>
      )}
      {state.message && <p className="text-xs text-green-700">{state.message}</p>}
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <Button
        type="submit"
        variant={mode === "recover" ? "default" : "outline"}
        size="sm"
        disabled={pending}
      >
        {pending ? "Saving…" : mode === "recover" ? "Mark as not spam" : "Mark as spam"}
      </Button>
    </form>
  );
}
