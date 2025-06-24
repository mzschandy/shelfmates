
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import UserMenu from "./_components/user-menu"

function LoginLinks() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/login">Sign In</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/login">Sign Up</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

async function Header() {
    const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()


  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-xl font-bold">
        <Link href="/">Chaptr</Link>
      </h1>
      <div>{user ?  <UserMenu email={user?.email} /> : <LoginLinks />}</div>
    </header>
  )
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
