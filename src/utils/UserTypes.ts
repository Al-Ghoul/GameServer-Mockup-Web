import { z } from "zod";

export const UserRegistrationInput = z.object({
    username: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
}).superRefine((data, ctx) => {
    if (data.username === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A username is required",
        });
    }

    if (data.password === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A password is required",
        });
    }

    if (data.confirmPassword === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A Confirmation password is required",
        });
    }

    if (data.confirmPassword !== "" && data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Confirmation password do NOT match.",
        });
    }
});


export const UserLoginInput = z.object({
    username: z.string().refine((val) => val.length > 0, {
        message: "A username must be provided"
    }),
    password: z.string().refine((val) => val.length > 0, {
        message: "A password must be provided"
    }),
}
);

export const SetNameInput = z.object({
    name: z.string().refine((val) => val.length > 0, {
        message: "A name must be provided"
    }),
});

export type UserRegistrationInputType = z.infer<typeof UserRegistrationInput>;
export type UserLoginInputType = z.infer<typeof UserLoginInput>;
export type SetNameInputType = z.infer<typeof SetNameInput>;