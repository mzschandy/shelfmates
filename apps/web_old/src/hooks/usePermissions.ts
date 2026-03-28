import { prisma } from "@shelfmates/db"
import { User } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query"

export interface UserPermissions {
  isLoggedIn: boolean, 
  isMember: boolean,
  isAdmin: boolean,
  isLoading?: boolean,
}

export function usePermissions(clubId: string) {
  // const { user }: { user: User | null } = useAuth()

  // const { data: membership, isLoading } = useQuery({
  //   queryKey: ["clubMembership", clubId, user?.id],
  //   queryFn: async () => {
  //     if (!user) return null
  //     const data = await prisma.clubMember.findFirst({
  //       where: {
  //         id: user?.id,
  //         clubId: clubId,
  //       },
  //     })
  //     return data
  //   },
  //   enabled: !!user && !!clubId,
  // })
  return null;
  // return {
  //   isLoggedIn: !!user,
  //   isMember: !!membership,
  //   isAdmin: membership?.isAdmin ?? false,
  //   isLoading: isLoading,
  // }
}
