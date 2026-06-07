const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For one website that just needs working submissions.",
    features: ["1 website", "2 form inboxes", "250 clean submissions", "Basic spam filtering"],
  },
  {
    name: "Pro",
    price: "$29",
    description: "For freelancers and product teams running multiple campaigns.",
    features: ["10 websites", "Unlimited forms", "2,500 clean submissions", "Priority email delivery"],
  },
  {
    name: "Agency",
    price: "$99",
    description: "For agencies managing many client websites from one inbox layer.",
    features: ["Unlimited websites", "Unlimited forms", "10,000 clean submissions", "Agency reporting"],
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-10 px-6 py-14 md:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-invoice-blue">Pricing preview</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Spam does not count toward your limit.
        </h1>
        <p className="mt-5 text-lg leading-8 text-charcoal-whisper">
          Start with the core form backend, then grow into client workflows, inbox scale, and
          deeper routing when the product earns it.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-[20px] bg-white p-6 shadow-subtle">
            <p className="text-sm font-medium text-invoice-blue">{plan.name}</p>
            <p className="mt-5 text-4xl font-semibold tracking-tight text-midnight-ink">
              {plan.price}
              <span className="text-base font-medium text-graphite-mute"> / month</span>
            </p>
            <p className="mt-4 text-base leading-7 text-charcoal-whisper">{plan.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-charcoal-whisper">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
