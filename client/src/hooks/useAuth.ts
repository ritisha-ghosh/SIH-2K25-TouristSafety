import { useQuery } from "@tanstack/react-query";
import type { User, TouristProfile } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

interface AuthUser extends User {
  touristProfile?: TouristProfile;
}

export function useAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const authData = data as { user: AuthUser; touristProfile?: TouristProfile } | undefined;

  return {
    user: authData?.user,
    touristProfile: authData?.touristProfile,
    isLoading,
    isAuthenticated: !!authData?.user,
  };
}
