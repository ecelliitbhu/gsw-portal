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
        const q = query(
          collection(db, "admins"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);

        // If the email doesn't exist in the admins collection, deny access
        if (querySnapshot.empty) {
          console.error("Access Denied: Email not in admins collection ->", user.email);
          return false;
        }

        return true; // Allow sign in
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // We'll create a custom login page
    error: '/login', // Redirect back to login on error (e.g. Access Denied)
  }
};
