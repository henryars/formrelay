"use client";

import { useActionState } from "react";
import { updateSubmissionStatusAction, type SubmissionActionState } from "@/app/actions/submissions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="space-y-1.5">
        <Label htmlFor="status">Lead status</Label>
        <select
          id="status"
          name="status"
          defaultValue={defaultStatus}
          className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
        >
          {["NEW", "CONTACTED", "WON", "LOST", "ARCHIVED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {state.message && <p className="text-xs text-green-700">{state.message}</p>}
      {state.error && <p className="text-xs text-red-700">{state.error}</p>}
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Update status"}
      </Button>
    </form>
  );
}
