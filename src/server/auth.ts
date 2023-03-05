import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import CredentialsProvider from "next-auth/providers/credentials"
import { UserLoginInput, type UserLoginInputType } from "~/utils/UserTypes";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      // @ts-ignore
      async authorize(credentials: UserLoginInputType, req) {

        const userCredentialsParseResult = UserLoginInput.safeParse(credentials);
        if (!userCredentialsParseResult.success) {
          const formattedErrorMessages = userCredentialsParseResult.error.format();

          if (formattedErrorMessages.name) throw new Error(...formattedErrorMessages.name._errors);

          if (formattedErrorMessages.email) throw new Error(...formattedErrorMessages.email._errors);

          if (formattedErrorMessages.password) throw new Error(...formattedErrorMessages.password._errors);

          throw new Error(...formattedErrorMessages._errors)
        }

        let user;
        if (credentials.email !== "") {
          user = await prisma.user.findFirst({ where: { email: credentials.email, password: credentials.password } });
        } else {
          user = await prisma.user.findFirst({ where: { name: credentials.name, password: credentials.password } });
        }

        if (user) return user;

        throw new Error("User doesn't exist");
      }
    }),
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
