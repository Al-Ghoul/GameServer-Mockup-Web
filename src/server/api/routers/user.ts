import { Prisma } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { UserRegistrationInput } from "~/utils/UserTypes";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(UserRegistrationInput)
    .mutation(async ({ input, ctx }) => {
      const { name, password, email } = input;

      try {
        await ctx.prisma.user.create({
          data: {
            name, password, email
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientInitializationError) {
          throw new TRPCClientError(`[{\"message\": \"Database error, please report this issue or try again later.\"}]`);
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') throw new TRPCClientError('[{\"message\": \"User already exists.\"}]');
        }
      }

      return {
        status: "Success",
        message: `${name} was created successfully`,
      };
    }),
});
