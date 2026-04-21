import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ID_TOKEN_COOKIE = "firebase-id-token";
const APP_CHECK_COOKIE = "firebase-app-check-token";
const MAX_AGE = 60 * 60;

export async function POST(request: Request) {
  const { idToken, appCheckToken } = (await request.json()) as {
    idToken?: string;
    appCheckToken?: string;
  };
  if (!idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
  cookieStore.set(ID_TOKEN_COOKIE, idToken, cookieOptions);
  if (appCheckToken) {
    cookieStore.set(APP_CHECK_COOKIE, appCheckToken, cookieOptions);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ID_TOKEN_COOKIE);
  cookieStore.delete(APP_CHECK_COOKIE);
  return NextResponse.json({ ok: true });
}
