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
import { Button } from "../ui/button"
import { createSession } from "@/app/(main)/club/[slug]/session/actions"

export default function NewSessionModal({clubId, clubMemberId = ''}: {clubId: string, clubMemberId?: string}) {
  // console.log("NewSessionModal user:", user)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Add New Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4">
            <div className="grid gap-3">
              <div className="mt-4 mb-4">
                <form>
                  {/* <input type="hidden" name="userId" value={user?.id} /> */}
                  <input type="hidden" name="club_id" value="club_id" />
                  <div className="grid gap-2">
                    <label htmlFor="title">Upload a Book</label>
                    <Input id="book" name="book" type="file" required />
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                    <Button formAction={createSession} type="submit">
                      Create Session
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
