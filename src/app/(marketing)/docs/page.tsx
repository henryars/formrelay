const docsSections = [
  {
    title: "AI Builder Prompt",
    body: "Use the generated prompt to connect an existing form without changing its UI or validation flow.",
  },
  {
    title: "HTML Action",
    body: "Point a regular HTML form directly at the public `/f/{publicFormId}` endpoint for quick setups.",
  },
  {
    title: "React and Next.js",
    body: "Submit either `FormData` or JSON to FormRelay and include `source_url`, `page_title`, and `form_name` metadata.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-10 px-6 py-14 md:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-invoice-blue">Documentation</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Setup paths for the builders people already use.
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {docsSections.map((section) => (
          <article key={section.title} className="rounded-[20px] bg-white p-6 shadow-subtle">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">
              {section.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-charcoal-whisper">{section.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
