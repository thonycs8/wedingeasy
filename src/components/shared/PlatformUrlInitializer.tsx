import { usePlatformUrl } from "@/hooks/usePlatformSettings";

/**
 * Silent component that initializes the platform URL cache on app load.
 */
export function PlatformUrlInitializer() {
  usePlatformUrl();
  return null;
}
