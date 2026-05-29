"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  labName: string;
  labLogo: string;
  signature: string;
  labPhone: string;
  labEmail: string;
  labWebsite: string;
  labAddress: string;
  cardBgImage: string;
  termsAndConditions: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setProfile({
            id: json.user.id,
            name: json.user.name,
            email: json.user.email,
            role: json.user.role,
            labName: json.user.labName,
            labLogo: json.user.labLogo || "",
            signature: json.user.signature || "",
            labPhone: json.user.labPhone || "+91 12345 67890",
            labEmail: json.user.labEmail || "info@yourlab.com",
            labWebsite: json.user.labWebsite || "www.yourlab.com",
            labAddress: json.user.labAddress || "",
            cardBgImage: json.user.cardBgImage || "",
            termsAndConditions: json.user.termsAndConditions || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile branding:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [session]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
