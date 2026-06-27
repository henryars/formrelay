import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prepend https:// when the user omits a scheme, so "mysite.com" becomes a valid URL.
 * Returns "" unchanged so optional fields stay empty.
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Split a comma-separated email string into a trimmed, lowercased, de-duplicated list. */
export function parseEmailList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}
