import { z } from "zod";

 export type formRegisterInputs = {
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    birthday: string,
}
    
  export type formLoginInputs = {
    email: string,
    password: string,
    }

export const userRegisterSchema = z.object({
  username: z.string().min(2).max(25),
  email: z.string().email(),
  password: z.string().min(6).max(25),
  confirmPassword: z.string().min(6).max(25),
  birthday:z.string().refine(birthday=> new Date(birthday))
}).refine(data => data.password === data.confirmPassword, { message: "Passwords must be equal" })

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(25),
})
