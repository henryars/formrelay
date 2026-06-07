"use client";

import { useActionState } from "react";

import {
  reviewSubmissionSpamAction,
  type SubmissionActionState,
} from "@/app/actions/submissions";

const initialState: SubmissionActionState = {};

type SubmissionSpamReviewFormProps = {
  submissionId: string;
  mode: "spam" | "recover";
};

export function SubmissionSpamReviewForm({
  submissionId,
  mode,
}: SubmissionSpamReviewFormProps) {
  const [state, formAction, pending] = useActionState(
    reviewSubmissionSpamAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
      <input
        type="hidden"
        name="action"
        value={mode === "recover" ? "MARKED_NOT_SPAM" : "MARKED_SPAM"}
      />
      {mode === "recover" ? (
        <label className="flex items-center gap-3 rounded-xl bg-cool-mist px-4 py-3 text-sm text-midnight-ink">
          <input type="checkbox" name="sendNotificationNow" value="true" className="size-4" />
          Send a notification now
        </label>
      ) : null}
      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        className={mode === "recover" ? "button-primary" : "button-secondary"}
        disabled={pending}
      >
        {pending
          ? "Saving..."
          : mode === "recover"
            ? "Mark as not spam"
            : "Mark as spam"}
      </button>
    </form>
  );
}
