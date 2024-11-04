'use client'
import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formRegisterInputs, userRegisterSchema } from "../../validations/user-schema";
import { registerUsers } from "../../services/user";
import { useUserContext } from "../../contexts/UserProvider";


const RegisterPage = () => {
   const { register, handleSubmit,watch,formState:{errors} } = useForm<formRegisterInputs>(
    {
      resolver: zodResolver(userRegisterSchema),
     });
  
  const { setUser } = useUserContext();
  
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: formRegisterInputs) => {
    const res = await registerUsers(data)
    if (res.statusCode === 201) {
      setUser(res.result.user);
      router.push("/profile")
    }
    else {
      setResponseMessage("Algo se rompió.")
    }
  }
 
  return (
  <div className="flex items-center justify-center min-h-screen">
  <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
    <label htmlFor="username" className="block text-gray-700 mt-4">Name</label>
    <input type="text" id="username" {...register("username")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.username?.message && <p className="text-red-500 text-sm">{errors.username?.message}</p>}

    <label htmlFor="email" className="block text-gray-700 mt-4">Email</label>
    <input type="email" id="email" {...register("email")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.email?.message && <p className="text-red-500 text-sm">{errors.email?.message}</p>}

    <label htmlFor="password" className="block text-gray-700 mt-4">Password</label>
    <input type="password" id="password" {...register("password")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.password?.message && <p className="text-red-500 text-sm">{errors.password?.message}</p>}

    <label htmlFor="confirmPassword" className="block text-gray-700 mt-4">Confirm Password</label>
    <input type="password" id="confirmPassword" {...register("confirmPassword")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.confirmPassword?.message && <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>}

    <label htmlFor="birthday" className="block text-gray-700 mt-4">Birthday</label>
    <input type="date" id="birthday" {...register("birthday")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.birthday?.message && <p className="text-red-500 text-sm">{errors.birthday?.message}</p>}

    <button type="submit" className="w-full mt-4 bg-blue-500 text-white py-2 rounded">Submit</button>
  </form>
  {<p>{responseMessage}</p>}
</div>

  );
  

}

export default RegisterPage