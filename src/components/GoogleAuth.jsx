"use client";

import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://api.srv936332.hstgr.cloud";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
const APP_SLUG = "micro-decision-trainer";

export default function GoogleAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      const { createClient } = window.supabase;
      supabaseRef.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      supabaseRef.current.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabaseRef.current.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          if (event === "SIGNED_IN" && session?.user) {
            await trackUserLogin(session.user.email);
          }
        }
      );

      return () => subscription.unsubscribe();
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const trackUserLogin = async (email) => {
    if (!supabaseRef.current || !email) return;

    try {
      const { data: existing } = await supabaseRef.current
        .from("user_tracking")
        .select("*")
        .eq("email", email)
        .eq("app", APP_SLUG)
        .single();

      if (existing) {
        await supabaseRef.current
          .from("user_tracking")
          .update({
            login_cnt: existing.login_cnt + 1,
            last_login_ts: new Date().toISOString(),
          })
          .eq("email", email)
          .eq("app", APP_SLUG);
      } else {
        await supabaseRef.current.from("user_tracking").insert({
          email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error tracking user login:", error);
    }
  };

  const signInWithGoogle = async () => {
    if (!supabaseRef.current) return;

    await supabaseRef.current.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    if (!supabaseRef.current) return;

    await supabaseRef.current.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-purple-200 text-sm">
        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-purple-200 text-sm truncate max-w-[150px]">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 text-sm rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
