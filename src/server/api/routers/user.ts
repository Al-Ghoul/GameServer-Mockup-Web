import { Prisma } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { SetNameInput, UserRegistrationInput } from "~/utils/UserTypes";
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(UserRegistrationInput)
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      const SALT_ROUNDS = 10;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call,  @typescript-eslint/no-unsafe-assignment
      const new_password: string = await bcrypt.hash(password, SALT_ROUNDS);

      try {
        await ctx.prisma.user.create({
          data: {
            username, password: new_password
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientInitializationError) {
          throw new TRPCClientError("Database error, please report this issue or try again later");
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') throw new TRPCClientError("User already exists.");
        }
      }

      return {
        status: "Success",
        message: `${username} was created successfully`,
      };
    }),
  setUsername: protectedProcedure
    .input(SetNameInput)
    .mutation(async ({ input, ctx }) => {

      try {
        await ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id
          },
          data: {
            ...input
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientInitializationError) {
          throw new TRPCClientError("Database error, please report this issue or try again later");
        }

        // if (error instanceof Prisma.PrismaClientKnownRequestError) {
        //   if (error.code === 'P2002') throw new TRPCClientError("Sorry! This name is already used, can you come up with another one?");
        // }
        // console.log(error)
        throw new TRPCClientError("Seems like this user was not found");
      }

      return {
        status: "Success",
        message: `${input.name} was set successfully`,
      };
    }),
});



