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
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req): Promise<any> {
        // console.log("here, cred: ", credentials);

        if (
          credentials?.identifier.trim() === "" ||
          credentials?.password.trim() === ""
        ) {
          throw new Error("Please enter identifier and password to continue");
        }

        await connectDB();

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials?.identifier },
              { username: credentials?.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email or username");
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
