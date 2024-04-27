import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOption: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req): Promise<any> {
        if (
          credentials?.email.trim() === "" ||
          credentials?.password.trim() === ""
        ) {
          throw new Error("Please enter email and password to continue");
        }

        await connectDB();

        try {
          const user = await UserModel.findOne({ email: credentials?.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isUserVerified) {
            throw new Error("Please verify your account before login");
          }

          if (credentials?.password) {
            const isPasswordMatched = await bcrypt.compare(
              credentials?.password,
              user.password
            );

            if (isPasswordMatched) return user;
          }

          throw new Error("Invalid credentials");
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isUserVerified = user?.isUserVerified;
        token.isAcceptingMessage = user?.isAcceptingMessage;
        token.username = user?.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id?.toString();
        session.user.isUserVerified = token?.isUserVerified;
        session.user.isAcceptingMessage = token?.isAcceptingMessage;
        session.user.username = token?.username;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    colorScheme: "auto",
  },
};
