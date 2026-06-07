import { parseFieldItems } from "@/lib/submission-json";

type ExportSubmission = {
  status: string;
  spamStatus: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  messagePreview: string | null;
  sourceUrl: string | null;
  createdAt: Date;
  website: { websiteName: string };
  form: { formName: string };
  fieldItems: unknown;
};

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function createSubmissionCsv(submissions: ExportSubmission[]) {
  const header = [
    "status",
    "spam_status",
    "submitter_name",
    "submitter_email",
    "submitter_phone",
    "message_preview",
    "website",
    "form",
    "source_url",
    "created_at",
    "field_summary",
  ];

  const rows = submissions.map((submission) => {
    const fieldSummary = parseFieldItems(submission.fieldItems)
      .map((item) => `${item.label ?? item.key}: ${Array.isArray(item.value) ? item.value.join(" | ") : item.value ?? ""}`)
      .join("; ");

    return [
      submission.status,
      submission.spamStatus,
      submission.submitterName ?? "",
      submission.submitterEmail ?? "",
      submission.submitterPhone ?? "",
      submission.messagePreview ?? "",
      submission.website.websiteName,
      submission.form.formName,
      submission.sourceUrl ?? "",
      submission.createdAt.toISOString(),
      fieldSummary,
    ]
      .map((value) => escapeCsv(String(value)))
      .join(",");
  });

  return [header.join(","), ...rows].join("\n");
}
