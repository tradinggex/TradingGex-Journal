"use server";

import { cookies } from "next/headers";

export async function setSelectedAccount(accountId: string | null) {
  const cookieStore = await cookies();
  if (accountId) {
    cookieStore.set("activeAccount", accountId, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } else {
    cookieStore.delete("activeAccount");
  }
}
