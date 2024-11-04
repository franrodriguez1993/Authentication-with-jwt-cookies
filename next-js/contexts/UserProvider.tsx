'use client';

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { UserInterface } from "../interface/user.interface";

// determinamos un type y un valor por default:
type UserContextType = {
  user: UserInterface | null,
  setUser:Function
}
const DEFAULT_VALUE_CONTEXT = {user:null, setUser:()=>{}}

// seteamos el context:
const UserContext = createContext<UserContextType>(DEFAULT_VALUE_CONTEXT);

// creamos el provider:
const UserProvider = ({ children }: PropsWithChildren) => {
  
  const [user, setUser] = useState<UserInterface | null>(null)
  
  return (
    <UserContext.Provider value={{user,setUser}}>
      {children}
    </UserContext.Provider>
  )
}

// exportamos el context y el provider:
export const useUserContext = () => {
  return useContext(UserContext);
}

export default UserProvider