"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup } from "./actions"

export default function Login() {
  return (
    <div className="flex justify-center height-screen-helper">
      <div className="w-sm m-auto">
        <Card>
          <CardHeader>
            <CardTitle>Login or Sign up</CardTitle>
            <CardDescription>
              Please enter your credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                />
              </div>
              <div className="grid gap-2 mt-5">
                <Label htmlFor="email">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password"
                />
              </div>
              <div className="flex flex-col gap-2 mt-5">
                <Button formAction={login}>Log In</Button>
                <Button formAction={signup}>Sign Up</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
