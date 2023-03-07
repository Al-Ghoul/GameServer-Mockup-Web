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
import { Prisma } from "@prisma/client";
import { type JWT, type JWTDecodeParams, type JWTEncodeParams } from "next-auth/jwt";
import * as jose from 'jose'
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

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
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (!token.name && token.id) {
        const userData = await prisma.user.findFirst({ where: { id: token.id } });
        if (!!userData) token.name = userData.name;
      }
      return token;
    },
    session({ session, token }) {
      //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      session.user.id = token?.id

      return session
    }
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      //  eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      async authorize(credentials: UserLoginInputType) {

        const userCredentialsParseResult = UserLoginInput.safeParse(credentials);
        if (!userCredentialsParseResult.success) {
          const formattedErrorMessages = userCredentialsParseResult.error.format();

          if (formattedErrorMessages.username) throw new Error(...formattedErrorMessages.username._errors);

          if (formattedErrorMessages.password) throw new Error(...formattedErrorMessages.password._errors);

          throw new Error(...formattedErrorMessages._errors)
        }


        let user;
        try {
          user = await prisma.user.findFirst({ where: { username: credentials.username } });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientInitializationError) {
            throw new Error("Database error, please report this issue or try again later");
          }
        }

        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          if (!await bcrypt.compare(credentials.password, user.password))
            throw new Error("Incorrect password.");

          return user;
        }

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
    newUser: '/auth/new-user'
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    async encode(params: JWTEncodeParams): Promise<string> {

      return await new jose.SignJWT({ ...params.token })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime('10d')
        .setIssuer('localhost')
        .sign(new TextEncoder().encode(params.secret.toString()))
    },
    async decode(params: JWTDecodeParams): Promise<JWT | null> {
      if (params.token) {
        const { payload } = await jose.jwtVerify(params.token, new TextEncoder().encode(params.secret.toString()), {
          issuer: 'localhost',
        })

        return payload;
      }
      return null
    },
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
