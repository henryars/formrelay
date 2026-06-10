"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "settings", label: "Settings" },
  { value: "spam",     label: "Spam & Filtering" },
  { value: "mapping",  label: "Field Mapping" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

interface FormTabsProps {
  defaultValue: TabValue;
  children: React.ReactNode;
}

export function FormTabs({ defaultValue, children }: FormTabsProps) {
  const [value, setValue] = useState<TabValue>(defaultValue);

  return (
    <Tabs value={value} onValueChange={(v) => setValue(v as TabValue)}>
      {/* Mobile: native select */}
      <div className="md:hidden">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value as TabValue)}
          className="w-full rounded-[14px] border border-[#ececee] bg-white px-4 py-2.5 text-sm font-semibold text-[#09090b] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0098f2] appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: "36px",
          }}
        >
          {TABS.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: pill tabs */}
      <TabsList className="hidden md:inline-flex">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab panels — always rendered for both breakpoints */}
      {children}
    </Tabs>
  );
}
