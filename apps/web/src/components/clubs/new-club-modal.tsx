"use client"

import { createClub } from "@/app/(main)/club/actions"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { create } from "domain"

export default function NewClubModal({ user }: { user?: any }) {
  console.log("NewClubModal user:", user)
  // const createClubWWithId = createClub.bind(null, user?.id);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Club</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Club</DialogTitle>
          <DialogDescription>Create a new book club</DialogDescription>
        </DialogHeader>
        <form>
          <input type="hidden" name="userId" value={user.id} />
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Cat Lovers Club"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="e.g. a book for cat lovers"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button formAction={createClub}>Create Club</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
