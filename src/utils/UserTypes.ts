import { z } from "zod";

export const UserRegistrationInput = z.object({
    name: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    email: z.string(),
}).superRefine((data, ctx) => {
    if (data.name === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A name is required",
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

    if (data.email !== "") {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|([^-]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}))$/;
        // @ts-ignore
        if (!emailRegex.test(data.email)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please provide a valid email",
            });
        }
    } else {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "An email is required.",
        });
    }
});


export const UserLoginInput = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string()
}).partial().superRefine((data, ctx) => {
    if (data.password === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A password MUST be provided",
        });
    }

    if (data.email !== "") {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|([^-]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}))$/;
        // @ts-ignore
        if (!emailRegex.test(data.email)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please provide a valid email",
            });
        }
    }

    if (data.name === "" && data.email === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please provide either a name or email",
        });
    }
}
);

export type UserRegistrationInputType = z.infer<typeof UserRegistrationInput>;
export type UserLoginInputType = z.infer<typeof UserLoginInput>;