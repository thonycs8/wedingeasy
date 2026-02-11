import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { setPlatformUrl } from "@/utils/getPublicBaseUrl";

export function usePlatformUrl() {
  const { data } = useQuery({
    queryKey: ["platform-settings", "published_url"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings" as any)
        .select("value")
        .eq("key", "published_url")
        .maybeSingle();

      if (error) throw error;
      return (data as any)?.value as string | null;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
  });

  // Populate global cache for sync getPublicBaseUrl()
  if (data) {
    setPlatformUrl(data);
  }

  return data ?? null;
}
