import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Get the list of authorized emails from environment variable
      const authorizedEmails = process.env.AUTHORIZED_EMAILS?.split(",") || [];
      
      // Check if the user's email is in the list of authorized emails
      if (user.email && authorizedEmails.includes(user.email)) {
        return true;
      }
      
      // Reject the sign-in attempt if not authorized
      return false;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 