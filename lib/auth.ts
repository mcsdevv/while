import { env, isAuthConfigured } from "@/lib/env";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * NextAuth configuration
 * Uses Google OAuth with email whitelist for access control
 *
 * Note: Auth env vars are optional at build time. If not configured,
 * sign-in attempts will fail gracefully with an error message.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID ?? "",
      clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    /**
     * Check if user's email is in the authorized list
     */
    async signIn({ user }) {
      if (!isAuthConfigured()) {
        console.error(
          "Auth not configured. Set AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, NEXTAUTH_SECRET, and AUTHORIZED_EMAILS.",
        );
        return false;
      }

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const authorizedEmails = (env.AUTHORIZED_EMAILS ?? []).map((e) => e.toLowerCase());
      const isAuthorized = authorizedEmails.includes(email);

      if (!isAuthorized) {
        console.warn(`Unauthorized sign-in attempt from: ${email}`);
      }

      return isAuthorized;
    },
    /**
     * Add user info to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    /**
     * Add user info to session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
