type JsonFieldItem = {
  key?: string;
  label?: string;
  type?: string;
  value?: string | string[];
};

export function parseFieldItems(value: unknown): JsonFieldItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === "object" && item !== null) as JsonFieldItem[];
}
