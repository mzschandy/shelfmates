"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCreateSession } from "@/hooks/useCreateSession";

export default function NewSessionModal({
  clubId,
  clubMemberId,
}: {
  clubId: string;
  clubMemberId: string | undefined;
}) {
  const { createSession, isLoading } = useCreateSession(clubId);

  if (!clubMemberId) {
    return null;
  }

  const handleCreateSession = async (data: FormData) => {
    const epubFile = data.get("book") as File;
    // console.log("epupFile", epubFile);
    // console.log("club id", clubId);
    createSession({ epubFile, clubId, clubMemberId });
  };

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
                  <div className="grid gap-2">
                    <label htmlFor="title">Upload a Book</label>
                    <Input id="book" name="book" type="file" required />
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                    {isLoading ? (
                      <div>Creating Session...</div>
                    ) : (
                      <Button formAction={handleCreateSession} type="submit">
                        Create Session
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
