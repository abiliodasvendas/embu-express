import { supabase } from "@/integrations/supabase/client";
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
        // Even though we authenticate via Backend, Supabase Client can still
        // be used to "listen" if we set the session on it manually or if
        // the backend login returns a session useful for RLS.
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentSession = this.mapSupabaseSession(session);
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

    // Calls Backend to refresh, then updates local client
    async refreshToken(): Promise<{ success: boolean; data?: Session }> {
        // Singleton pattern: if a refresh is already in progress, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            try {
                // Get current refresh token
                const { data: currentSession } = await this.getSession();
                const refresh_token = currentSession.session?.refresh_token;

                if (!refresh_token) {
                    return { success: false };
                }

                // Call Backend
                const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
                const response = await fetch(`${API_URL}/auth/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token })
                });

                if (!response.ok) {
                    throw new Error("Failed to refresh");
                }

                const newSession = await response.json();
                
                // Update Local State (Supabase Client)
                await this.setSession(newSession.access_token, newSession.refresh_token);
                
                const mapped = this.mapSupabaseSession({
                    access_token: newSession.access_token,
                    refresh_token: newSession.refresh_token,
                    user: newSession.user,
                    expires_in: 3600,
                    token_type: "bearer"
                } as any);

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
        // Call Backend to invalidate if needed (Logic can be added)
        // For now, clear local state
        const { error } = await supabase.auth.signOut();
        return { error };
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
