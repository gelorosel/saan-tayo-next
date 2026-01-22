import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uniqueByValue = <T extends { value: string }>(arr: T[]): T[] => {
  const map = new Map<string, T>();

  for (const item of arr) {
    if (!map.has(item.value)) {
      map.set(item.value, item);
    }
  }

  return Array.from(map.values());
};
