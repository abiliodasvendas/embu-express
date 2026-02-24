import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "./queryClient";
import { Session as SupabaseSession } from "@supabase/supabase-js";

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "INITIAL_SESSION" | "TOKEN_REFRESHED" | "password_recovery";

export interface AuthUser {
    id: string;
    email?: string;
    perfil_id?: number | null;
    [key: string]: any;
}

export type Session = {
    access_token: string;
    refresh_token: string;
    user?: AuthUser | null;
} | null;

export type AuthListener = {
    subscription: {
        unsubscribe: () => void;
    };
};

class SessionManager {
    private currentSession: Session = null;

    constructor() {
        // Initial load from Supabase client (Client-side listener for convenience)
        supabase.auth.getSession().then(({ data }) => {
            this.currentSession = this.mapSupabaseSession(data.session);
        });

        // Subscribe to Supabase auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentSession = this.mapSupabaseSession(session);

            if (event === 'SIGNED_OUT') {
                localStorage.clear();
                queryClient.clear();
            }
        });
    }

    private mapSupabaseSession(session: SupabaseSession | null): Session {
        if (!session) return null;
        return {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user ? {
                id: session.user.id,
                email: session.user.email,
                ...session.user.user_metadata
            } : null
        };
    }

    async getSession(): Promise<{ data: { session: Session } }> {
        // We defer to Supabase Client for local storage management
        const { data } = await supabase.auth.getSession();
        return { data: { session: this.mapSupabaseSession(data.session) } };
    }

    // Called by Login Page after successful backend authentication
    async setSession(access_token: string, refresh_token: string) {
        // Hydrate Supabase Client so RLS works if we still use some direct calls,
        // and so persistent storage works automatically.
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        return { error };
    }

    private refreshPromise: Promise<{ success: boolean; data?: Session }> | null = null;

    // Local Client Native Refresh
    async refreshToken(): Promise<{ success: boolean; data?: Session }> {
        // Singleton pattern: if a refresh is already in progress, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            try {
                // Use frontend's native Supabase client to refresh the token
                // This talks directly to Supabase Auth API, preventing race conditions
                // with our backend and ensuring local storage is updated natively.
                const { data, error } = await supabase.auth.refreshSession();

                if (error || !data.session) {
                    throw new Error(error?.message || "Failed to refresh via Supabase Client");
                }

                const mapped = this.mapSupabaseSession(data.session);
                return { success: true, data: mapped };
            } catch (error) {
                console.error("Refresh failed", error);
                return { success: false };
            } finally {
                // Clear the promise so future calls can start a new refresh if needed
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    async signOut() {
        try {
            // Drop cache explicitly before we even try
            localStorage.clear();
            queryClient.clear();

            const { error } = await supabase.auth.signOut();

            // If supabase fails to logout globally (ex: 403 token already invalid), force local logout
            if (error) {
                await supabase.auth.signOut({ scope: "local" });
            }

            return { error };
        } catch (err: any) {
            return { error: err };
        }
    }

    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session) => void): { data: AuthListener } {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const mappedSession = this.mapSupabaseSession(session);
            const mappedEvent = event as AuthChangeEvent;
            callback(mappedEvent, mappedSession);
        });

        return { data: { subscription } };
    }
}

export const sessionManager = new SessionManager();
