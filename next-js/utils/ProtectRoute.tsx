'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserContext } from "../contexts/UserProvider";


const ProtectRoute = ({ children }: { children: React.ReactNode }) => {
   const { user } = useUserContext();
   const router = useRouter();

   useEffect(() => {
      if (!user) {
         router.push("/"); // Redirige si el usuario no está autenticado
      }
   }, [user, router]);

   if (!user) return null; // Muestra nada hasta que haya redirección o usuario esté definido

   return <>{children}</>; // Renderiza los hijos si el usuario está autenticado
};

export default ProtectRoute;
