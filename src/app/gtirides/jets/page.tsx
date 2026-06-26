import type { Metadata } from "next";

import { ServiceClient } from "../_components/ServiceClient";

export const metadata: Metadata = {
  title: "Private Jet Charter — GTi Rides",
  description: "Charter a private jet across Nigeria and Africa. Request in minutes.",
};

export default function JetsPage() {
  return (
    <ServiceClient
      service="jet"
      subject="Private Jet Charter"
      eyebrow="✦ Private Jet Charter"
      title="Fly private, on your schedule."
      subtitle="Skip the queues and fly in ultimate luxury across Nigeria and Africa — point to point, when you want."
      image="/gtirides/hero/private-jet.jpg"
      priceNote="From ₦4,500,000 per flight hour"
      features={[
        "Light, midsize and heavy jets to match your group",
        "Point-to-point routing across Nigeria & Africa",
        "Dedicated flight concierge and ground handling",
        "Flexible departure times — leave when you're ready",
        "VIP terminal and fast-track where available",
        "Optional onboard catering and special requests",
      ]}
    />
  );
}
