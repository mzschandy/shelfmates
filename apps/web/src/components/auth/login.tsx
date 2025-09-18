"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useSignIn } from "@/hooks/useAuth";

export default function Login() {
  const { signInMutation } = useSignIn();

  const handleLogin = async (data: FormData) => {
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    signInMutation.mutate({ email, password });
  };

  return (
    <div className="mt-4 mb-4">
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
          <Button formAction={handleLogin}>Log In</Button>
        </div>
      </form>
    </div>
  );
}
