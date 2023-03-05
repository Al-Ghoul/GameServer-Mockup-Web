import { z } from "zod";

export const UserInput = z.object({
    name: z.string({ required_error: "A name is required" })
        .refine((val) => val.length > 0, {
            message: "Please input a name"
        }),
    password: z.string({ required_error: "A password is required" })
        .refine((val) => val.length > 0, {
            message: "Please input a password"
        }),
    confirmPassword: z.string({ required_error: "Please confirm your password" })
        .refine((val) => val.length > 0, {
            message: "Please input a confirmation password"
        }),
    email: z.string({ required_error: "An email is required" })
        .email({ message: "Please input a valid email" })
});

export type UserInputType = z.infer<typeof UserInput>;