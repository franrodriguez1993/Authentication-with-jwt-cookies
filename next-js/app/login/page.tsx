'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react'
import { formLoginInputs, userLoginSchema } from '../../validations/user-schema';
import { useForm } from 'react-hook-form';
import { useUserContext } from '../../contexts/UserProvider';
import { useRouter } from 'next/navigation';
import { loginUsers } from '../../services/user';

const LoginPage = () => {

  const { register, handleSubmit,formState:{errors} } = useForm<formLoginInputs>(
    {
      resolver: zodResolver(userLoginSchema),
     });
  
  const { setUser } = useUserContext();
  
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: formLoginInputs) => {
    const res = await loginUsers(data)
    if (res.statusCode === 200) {
      setUser(res.result.user);
      router.push("/profile")
    }
    else {
      setResponseMessage("Algo se rompió.")
    }
  }
 
  return (
 <div className="flex items-center justify-center min-h-screen">
  <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
    <label htmlFor="email" className="block text-gray-700">Email</label>
    <input type="email" id="email" {...register("email")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.email?.message && <p className="text-red-500 text-sm">{errors.email?.message}</p>}

    <label htmlFor="password" className="block text-gray-700 mt-4">Password</label>
    <input type="password" id="password" {...register("password")} className="w-full mt-2 p-2 border border-gray-300 rounded" />
    {errors.password?.message && <p className="text-red-500 text-sm">{errors.password?.message}</p>}

    <button type="submit" className="w-full mt-4 bg-blue-500 text-white py-2 rounded">Submit</button>
  </form>
  {<p className="mt-4 text-center">{responseMessage}</p>}
</div>

  );

}

export default LoginPage