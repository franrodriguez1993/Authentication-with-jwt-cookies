import { formLoginInputs, formRegisterInputs } from "../validations/user-schema";

export const registerUsers = async (data:formRegisterInputs) => {
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        email: data.email,
        birthday: data.birthday
      }),
    });
  
  if (!response.ok) {
    throw new Error("Error")
  };
  return await response.json()

}

export const loginUsers = async (data:formLoginInputs) => {
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
  
  if (!response.ok) {
    throw new Error("Error")
  };
  return await response.json()

}

export const logoutUsers = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  
  if (!response.ok) {
    throw new Error("Error")
  };
  return await response.json()

}


export const getUserInfo = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'GET',
      credentials: 'include',
    });
  
  if (!response.ok) {
    throw new Error("Error")
  };
  return await response.json()

}