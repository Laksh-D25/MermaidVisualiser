'use client';

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/userStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const { setSession, clearSession } = useUserStore();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Sync:", event);

            if (session?.user) {
                supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                         setSession(session.user, profile);
                    });
            } else if (event === 'SIGNED_OUT') {
                clearSession();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, setSession, clearSession]);

    return <>{children}</>;
}