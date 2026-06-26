import type { Metadata } from "next";

import { ServiceClient } from "../_components/ServiceClient";

export const metadata: Metadata = {
  title: "Boat Cruise — GTi Rides",
  description: "Private yacht and boat cruises on Lagos waters. Request in minutes.",
};

export default function CruisesPage() {
  return (
    <ServiceClient
      service="cruise"
      subject="Boat Cruise"
      eyebrow="✦ Boat Cruise"
      title="Set sail on Lagos waters."
      subtitle="Private yacht and boat experiences for birthdays, proposals, shoots and unforgettable days out."
      image="/gtirides/hero/boat-cruise.jpg"
      priceNote="From ₦250,000 per cruise"
      features={[
        "Private yachts and speed boats for every group size",
        "Birthdays, proposals, photo shoots and corporate days",
        "Experienced captain and safety equipment included",
        "Sound system and comfortable lounge seating",
        "Optional catering, drinks and decoration",
        "Flexible duration — by the hour or full day",
      ]}
    />
  );
}
