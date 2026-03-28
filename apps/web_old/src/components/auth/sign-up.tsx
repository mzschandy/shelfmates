"use client";

import { signup } from "@/app/(auth)/login/actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function SignUp() {
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
        <div className="grid gap-2 mt-5">
          <Label htmlFor="email">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="adamwarlock"
          />
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <Button formAction={signup}>Sign Up</Button>
        </div>
      </form>
    </div>
  );
}
