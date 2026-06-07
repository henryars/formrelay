"use client";

import { useActionState } from "react";

import {
  updateSubmissionStatusAction,
  type SubmissionActionState,
} from "@/app/actions/submissions";

const initialState: SubmissionActionState = {};

export function SubmissionStatusForm({
  submissionId,
  defaultStatus,
}: {
  submissionId: string;
  defaultStatus: "NEW" | "CONTACTED" | "WON" | "LOST" | "ARCHIVED";
}) {
  const [state, formAction, pending] = useActionState(updateSubmissionStatusAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="submissionId" value={submissionId} />
      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Lead status</span>
        <select
          name="status"
          defaultValue={defaultStatus}
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
        >
          {["NEW", "CONTACTED", "WON", "LOST", "ARCHIVED"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">{state.message}</p>
      ) : null}
      <button type="submit" className="button-primary" disabled={pending}>
        {pending ? "Saving..." : "Update status"}
      </button>
    </form>
  );
}
