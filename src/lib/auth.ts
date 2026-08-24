import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./firebaseStore";
import { collection, getDocs, query, where } from "firebase/firestore";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) return false;
        
        // Check if the user is in the "admins" collection
        const adminQ = query(
          collection(db, "admins"),
          where("email", "==", user.email)
        );
        const adminSnapshot = await getDocs(adminQ);
        if (!adminSnapshot.empty) {
          (user as any).role = "admin";
          return true;
        }

        // Check if the user is in the "team_leaders_2026" collection
        const tlQ = query(
          collection(db, "team_leaders_2026"),
          where("email", "==", user.email)
        );
        const tlSnapshot = await getDocs(tlQ);
        if (!tlSnapshot.empty) {
          const tlData = tlSnapshot.docs[0].data();
          (user as any).role = "team_leader";
          (user as any).teamId = tlData.teamId;
          (user as any).trackId = tlData.trackId;
          return true;
        }

        console.error("Access Denied: Email not in admins or team_leaders_2026 collection ->", user.email);
        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.teamId = (user as any).teamId;
        token.trackId = (user as any).trackId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub || "";
        // @ts-ignore
        session.user.role = token.role || "";
        // @ts-ignore
        session.user.teamId = token.teamId || null;
        // @ts-ignore
        session.user.trackId = token.trackId || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // We'll create a custom login page
    error: '/login', // Redirect back to login on error (e.g. Access Denied)
  }
};
