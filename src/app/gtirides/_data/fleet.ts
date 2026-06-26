export type CarCategory =
  | "Sedan"
  | "Electric"
  | "Executive SUV"
  | "Luxury SUV"
  | "Super SUV"
  | "Sports";

export type Availability = "Available" | "Limited" | "On Request";

export type Car = {
  id: string;
  name: string;
  category: CarCategory;
  image: string;
  cities: string[];
  priceMin: number; // Naira per day
  priceMax: number;
  availability: Availability;
  note: string;
  tags: string[]; // extra search keywords
};

export const CATEGORY_ORDER: CarCategory[] = [
  "Sedan",
  "Electric",
  "Executive SUV",
  "Luxury SUV",
  "Super SUV",
  "Sports",
];

export const CATEGORY_BLURB: Record<CarCategory, string> = {
  Sedan: "Comfortable cars for everyday movement.",
  Electric: "Clean, quiet, and modern electric rides.",
  "Executive SUV": "Bigger cars for comfort, trips, and family use.",
  "Luxury SUV": "Premium rides for events, executives, and special occasions.",
  "Super SUV": "Statement performance for when arrival matters.",
  Sports: "Head-turning supercars for shoots and celebrations.",
};

const img = (file: string) => `/gtirides/cars/${file}`;

export const CARS: Car[] = [
  {
    id: "toyota-camry",
    name: "Toyota Camry",
    category: "Sedan",
    image: img("sedan-grey.jpg"),
    cities: ["Lagos", "Abuja", "Ibadan"],
    priceMin: 45000,
    priceMax: 75000,
    availability: "Available",
    note: "Smooth daily mover for meetings, errands, and city runs.",
    tags: ["toyota", "camry", "sedan", "saloon"],
  },
  {
    id: "hyundai-elantra",
    name: "Hyundai Elantra",
    category: "Sedan",
    image: img("sedan-corolla.jpg"),
    cities: ["Lagos", "Port Harcourt"],
    priceMin: 40000,
    priceMax: 65000,
    availability: "Available",
    note: "Sporty, fuel-friendly sedan for everyday comfort.",
    tags: ["hyundai", "elantra", "sedan", "saloon"],
  },
  {
    id: "tesla-model-3",
    name: "Tesla Model 3",
    category: "Electric",
    image: img("tesla-white.jpg"),
    cities: ["Lagos", "Abuja"],
    priceMin: 180000,
    priceMax: 280000,
    availability: "Limited",
    note: "Silent, all-electric luxury with instant torque.",
    tags: ["tesla", "electric", "ev", "model 3"],
  },
  {
    id: "tesla-roadster",
    name: "Tesla Roadster",
    category: "Electric",
    image: img("tesla-modelx.jpg"),
    cities: ["Lagos"],
    priceMin: 350000,
    priceMax: 600000,
    availability: "On Request",
    note: "All-electric supercar for shoots and grand entrances.",
    tags: ["tesla", "electric", "ev", "roadster", "sports"],
  },
  {
    id: "land-cruiser-v8",
    name: "Toyota Land Cruiser V8",
    category: "Executive SUV",
    image: img("landcruiser-black.jpg"),
    cities: ["Lagos", "Abuja", "Port Harcourt"],
    priceMin: 150000,
    priceMax: 230000,
    availability: "Available",
    note: "Executive movement, airport pickup, and convoys.",
    tags: ["toyota", "land cruiser", "lc", "v8", "suv", "jeep"],
  },
  {
    id: "nissan-patrol-v8",
    name: "Nissan Patrol V8",
    category: "Executive SUV",
    image: img("nissan-patrol.jpg"),
    cities: ["Lagos", "Abuja"],
    priceMin: 140000,
    priceMax: 210000,
    availability: "Available",
    note: "Bold, roomy, and built for long road trips.",
    tags: ["nissan", "patrol", "v8", "suv", "jeep"],
  },
  {
    id: "lexus-gx460",
    name: "Lexus GX 460",
    category: "Executive SUV",
    image: img("lexus-gx460-white.jpg"),
    cities: ["Lagos", "Abuja", "Port Harcourt"],
    priceMin: 160000,
    priceMax: 260000,
    availability: "Available",
    note: "Refined executive SUV for business and family.",
    tags: ["lexus", "gx", "gx460", "suv", "jeep"],
  },
  {
    id: "lexus-gx460-pearl",
    name: "Lexus GX 460 — Pearl",
    category: "Executive SUV",
    image: img("lexus-silver.jpg"),
    cities: ["Ibadan", "Lagos"],
    priceMin: 160000,
    priceMax: 260000,
    availability: "Limited",
    note: "Pearl-finish GX for weddings and events.",
    tags: ["lexus", "gx", "gx460", "suv", "jeep", "pearl", "silver"],
  },
  {
    id: "lexus-lx570",
    name: "Lexus LX 570",
    category: "Luxury SUV",
    image: img("lx570-black.jpg"),
    cities: ["Lagos", "Abuja"],
    priceMin: 260000,
    priceMax: 400000,
    availability: "Available",
    note: "Flagship Lexus comfort for VIP movement.",
    tags: ["lexus", "lx", "lx570", "luxury", "suv", "jeep"],
  },
  {
    id: "mercedes-gwagon",
    name: "Mercedes-Benz G-Wagon",
    category: "Luxury SUV",
    image: img("gwagon-white.jpg"),
    cities: ["Lagos", "Abuja"],
    priceMin: 450000,
    priceMax: 700000,
    availability: "Limited",
    note: "Iconic luxury for executives and celebrations.",
    tags: ["mercedes", "benz", "g-wagon", "gwagon", "g class", "luxury", "suv"],
  },
  {
    id: "mercedes-g63-brabus",
    name: "Mercedes-AMG G63 Brabus",
    category: "Luxury SUV",
    image: img("g63-black.jpg"),
    cities: ["Lagos"],
    priceMin: 700000,
    priceMax: 1200000,
    availability: "On Request",
    note: "Blacked-out Brabus G63 for ultimate presence.",
    tags: ["mercedes", "amg", "g63", "brabus", "luxury", "suv"],
  },
  {
    id: "lamborghini-urus",
    name: "Lamborghini Urus",
    category: "Super SUV",
    image: img("lamborghini-green.jpg"),
    cities: ["Lagos"],
    priceMin: 1200000,
    priceMax: 2000000,
    availability: "On Request",
    note: "650hp super-SUV for unforgettable arrivals.",
    tags: ["lamborghini", "urus", "super", "suv", "supercar"],
  },
  {
    id: "chevrolet-corvette",
    name: "Chevrolet Corvette",
    category: "Sports",
    image: img("corvette-red.jpg"),
    cities: ["Lagos"],
    priceMin: 500000,
    priceMax: 850000,
    availability: "On Request",
    note: "American V8 supercar for shoots and special days.",
    tags: ["chevrolet", "corvette", "sports", "supercar"],
  },
];

export function formatNaira(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  return `₦${Math.round(value / 1000)}k`;
}

export function priceRangeLabel(car: Pick<Car, "priceMin" | "priceMax">): string {
  return `${formatNaira(car.priceMin)} – ${formatNaira(car.priceMax)} / day`;
}

export function carById(id: string): Car | undefined {
  return CARS.find((c) => c.id === id);
}
