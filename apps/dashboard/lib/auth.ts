import { env, isAuthConfigured } from "@/lib/env";
import { updateSettings } from "@/lib/settings";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * NextAuth configuration
 * Uses Google OAuth with email whitelist for access control
 * Also requests calendar scope and stores refresh token for calendar sync
 *
 * Note: Auth env vars are optional at build time. If not configured,
 * sign-in attempts will fail gracefully with an error message.
 *
 * A placeholder secret is used when NEXTAUTH_SECRET is not configured
 * to allow the setup wizard to load. Auth will still fail gracefully
 * at sign-in time if not properly configured.
 */
const PLACEHOLDER_SECRET = "placeholder-secret-for-setup-wizard-only";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.NEXTAUTH_SECRET || PLACEHOLDER_SECRET,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    /**
     * Check if user's email is in the authorized list
     */
    async signIn({ user, account }) {
      if (!isAuthConfigured()) {
        console.error(
          "Auth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, and AUTHORIZED_EMAILS.",
        );
        return false;
      }

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const authorizedEmails = (env.AUTHORIZED_EMAILS ?? []).map((e) => e.toLowerCase());
      const isAuthorized = authorizedEmails.includes(email);

      if (!isAuthorized) {
        console.warn(`Unauthorized sign-in attempt from: ${email}`);
        return false;
      }

      // Store refresh token for calendar API access
      if (account?.refresh_token) {
        try {
          await updateSettings({
            google: {
              refreshToken: account.refresh_token,
              calendarId: "", // Will be set when user selects calendar
              connectedAt: new Date().toISOString(),
            },
          });
          console.log("Stored Google refresh token for calendar access");
        } catch (error) {
          console.error("Failed to store refresh token:", error);
          // Don't block sign-in if settings storage fails
        }
      }

      return true;
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
