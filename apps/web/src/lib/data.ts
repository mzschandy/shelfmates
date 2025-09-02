import { UserPermissions } from "@/hooks/usePermissions"
import { createClient } from "@/utils/supabase/server"
import { prisma, Profile } from "@shelfmates/db"

export const getUserId = async () => {
  "use server"
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase.auth.getUser()

  if (!user || userError) {
    return null
  }
  console.log('getUserId user():', user.user)
  return user.user?.id
}

export const getUserByUserId = async (userId: string) => {
  "use server"
  return await prisma.profile.findUnique({
    where: {
      id: userId,
    }
  })
}

export const getLoggedInUser = async (): Promise<Profile | null> =>  {
  const userId = await getUserId();
  return prisma.profile.findUnique({
    where: { id: userId ?? '' },
  })
}


export const checkAuthPermissions = async (
  clubId: string
): Promise<UserPermissions> => {
  "use server"
  const userId = await getUserId()
    console.log('checkAuthPermissions() clubId:', clubId)

  const data = await prisma.clubMember.findUnique({
    where: {
      id: userId ?? '',
      clubId: clubId
    },
  })

  console.log('checkAuthPermissions() data:', data)

  return {
    isLoggedIn: !!userId,
    isMember: !!data,
    isAdmin: data?.isAdmin ?? false,
  }
}

export const getClubData = async (clubId: string) => {
  return await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      clubMembers: {
        include: {
          profile: true
        }
      },
      sessions: true,
    },
  })
}