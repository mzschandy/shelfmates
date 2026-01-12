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
import { useThreads } from "@/hooks/useThreads";

export default function NewThreadModal({ sessionId, clubId }: { sessionId: string, clubId: string }) {
  const { createThread, createThreadIsLoading } = useThreads();

  if (!sessionId) {
    return null;
  }

  const handleCreateThread = async (data: FormData) => {
    const threadTitle = data.get("threadTitle") as string;
    const threadDescription = data.get("threadDescription") as string;

    console.log('thread title', threadTitle);
    console.log('thread descr', threadDescription);

    createThread({
      title: threadTitle,
      description: threadDescription,
      clubId,
      sessionId,
      type: "SESSION",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Thread</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4">
            <div className="grid gap-3">
              <div className="mt-4 mb-4">
                <form>
                  <div className="grid gap-2">
                    <label htmlFor="title">Thread Title</label>
                    <Input
                      id="threadTitle"
                      name="threadTitle"
                      type="text"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="title">Thread Description</label>
                    <Input
                      id="threadDescription"
                      name="threadDescription"
                      type="text"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                    {createThreadIsLoading ? (
                      <div>Creating Thread...</div>
                    ) : (
                      <Button formAction={handleCreateThread} type="submit">
                        Create Thread
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
