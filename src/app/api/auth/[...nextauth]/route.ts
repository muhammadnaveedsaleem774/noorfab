import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLE } from "@/lib/constants";

// Extend Session in this file only (global augmentation can shadow NextAuth default export)
declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
    accessToken?: string;
  }
}

// Auth.js requires AUTH_SECRET. Create .env.local and add:
// AUTH_SECRET=<run: npm run auth-secret>
if (!process.env.AUTH_SECRET) {
  console.error(
    "[auth] MissingSecret: Add AUTH_SECRET to .env.local (copy from .env.example or run: npm run auth-secret)"
  );
}

const { handlers } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? USER_ROLE.CUSTOMER;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const sub = token.sub;
        const id = token.id;
        const userId: string | null =
          typeof sub === "string" ? sub : (typeof id === "string" ? id : null);
        (session.user as { id?: string | null }).id = userId;
        session.user.role = (token.role as string) ?? USER_ROLE.CUSTOMER;
      }
      session.accessToken = token as unknown as string;
      return session;
    },
    redirect({ url, baseUrl }) {
      // After login, redirect to /account unless a specific callbackUrl was set
      if (url && url.startsWith("/")) return `${baseUrl}${url}`;
      if (url && new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/account`;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAccount = nextUrl.pathname.startsWith("/account");
      if (isOnAccount && !isLoggedIn) {
        return false;
      }
      return true;
    },
  },
});

function isSessionDecryptionError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("decryption") ||
    message.includes("JWTSessionError") ||
    (err as { code?: string })?.code === "ERR_JWE_DECRYPTION_FAILED"
  );
}

export async function GET(
  request: NextRequest,
  _context: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    return await handlers.GET(request);
  } catch (err) {
    if (isSessionDecryptionError(err)) {
      return NextResponse.json({ user: null, expires: null });
    }
    throw err;
  }
}

export async function POST(
  request: NextRequest,
  _context: { params: Promise<{ nextauth: string[] }> }
) {
  return handlers.POST(request);
}
