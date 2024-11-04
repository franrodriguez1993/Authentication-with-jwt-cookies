'use client'
import { useUserContext } from '../../contexts/UserProvider'
import ProtectRoute from '../../utils/ProtectRoute';

const ProfilePage = () => {
  const { user } = useUserContext();
  return (
<ProtectRoute>
      <div>
      <h1>Welcome {user?.username}</h1>
    </div>
</ProtectRoute>

  )
}

export default ProfilePage