import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
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

    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { oauthAccounts: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name ?? null,
          oauthAccounts: {
            create: { provider: "google", providerAccountId: userInfo.id },
          },
        },
        include: { oauthAccounts: true },
      });
    } else {
      const hasGoogle = user.oauthAccounts.some((a) => a.provider === "google");
      if (!hasGoogle) {
        await prisma.oAuthAccount.create({
          data: { userId: user.id, provider: "google", providerAccountId: userInfo.id },
        });
      }
    }

    await createSession(user.id, user.email, user.name);
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }
}
