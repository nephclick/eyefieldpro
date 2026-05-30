import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  profileName: string;
  handle: string;
  avatar: string;
  gender: string;
  bio: string;
  country: string;
  phone: string;
  showPhone?: boolean;
  showAddress?: boolean;
  visibility?: string;
  currency_code?: string;
  address: {
    street: string;
    city: string;
    state: string;
  };
  currency: { code: string; symbol: string };
  businessName?: string;
  businessAddress?: string;
  fullAddress?: string;
  businessCategory?: string;
  businessSubcategory?: string;
  website?: string;
  banner?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  is_verified?: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    if (!session?.user) {
      setUserState(null);
      setIsOnboardedState(false);
      setIsLoading(false);
      return;
    }

    try {
      // Try to fetch profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const userData: UserProfile = {
          id: profile.id,
          email: session.user.email,
          name: profile.name || session.user.email?.split('@')[0] || "User",
          profileName: profile.name || "",
          handle: profile.handle || "",
          avatar: profile.avatar_url || "",
          gender: profile.gender || "",
          bio: profile.bio || "",
          country: profile.country || "",
          phone: profile.phone || "",
          showPhone: profile.show_phone,
          showAddress: profile.show_address,
          visibility: profile.visibility,
          currency_code: profile.currency_code,
          address: {
            street: profile.address_street || "",
            city: profile.address_city || "",
            state: profile.address_state || "",
          },
          currency: { code: profile.currency_code || "USD", symbol: profile.currency_symbol || "$" },
          businessName: profile.business_name,
          businessAddress: profile.business_name,
          fullAddress: profile.address_street,
          businessCategory: profile.business_category,
          businessSubcategory: profile.business_subcategory,
          website: profile.website,
          banner: profile.banner_url,
          socials: {
            instagram: profile.instagram,
            twitter: profile.twitter,
            linkedin: profile.linkedin,
          }
        };
        setUserState(userData);
        setIsOnboardedState(profile.is_onboarded || false);
      } else {
        // No profile found, but we have a user (means they signed up but trigger might be slow or they just signed in)
        setUserState({ id: session.user.id, email: session.user.email } as any);
        setIsOnboardedState(false);
      }
    } catch (e) {
      console.error("Error fetching user profile in mobile app:", e);
      setUserState({ id: session.user.id, email: session.user.email } as any);
      setIsOnboardedState(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (userData: UserProfile) => {
    setUserState(userData);
  };

  const setIsOnboarded = (val: boolean) => {
    setIsOnboardedState(val);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isOnboarded, setIsOnboarded, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
