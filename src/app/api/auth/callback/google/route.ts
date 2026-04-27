import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/session";

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (errorParam || !code || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${url.origin}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) throw new Error("No access token");

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo: GoogleUserInfo = await userInfoRes.json();

    if (!userInfo.email) throw new Error("No email from Google");

    const { data: existingUser } = await supabase
      .from("User")
      .select("id, email, name")
      .eq("email", userInfo.email)
      .maybeSingle();

    let userId: string;
    let userName: string | null;

    if (!existingUser) {
      const id = crypto.randomUUID();
      const { data: newUser, error } = await supabase
        .from("User")
        .insert({ id, email: userInfo.email, name: userInfo.name ?? null })
        .select("id, email, name")
        .single();

      if (error || !newUser) throw error ?? new Error("Failed to create user");

      await supabase.from("OAuthAccount").insert({
        id: crypto.randomUUID(),
        userId: id,
        provider: "google",
        providerAccountId: userInfo.id,
      });

      userId = newUser.id;
      userName = newUser.name;
    } else {
      const { data: oauthAccounts } = await supabase
        .from("OAuthAccount")
        .select("id")
        .eq("userId", existingUser.id)
        .eq("provider", "google");

      if (!oauthAccounts?.length) {
        await supabase.from("OAuthAccount").insert({
          id: crypto.randomUUID(),
          userId: existingUser.id,
          provider: "google",
          providerAccountId: userInfo.id,
        });
      }

      userId = existingUser.id;
      userName = existingUser.name;
    }

    await createSession(userId, userInfo.email, userName);
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }
}
