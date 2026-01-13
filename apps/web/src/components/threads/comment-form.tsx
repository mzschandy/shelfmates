'use client';

import { useState } from 'react';
import { useThreads } from '@/hooks/useThreads';

interface CommentFormProps {
  threadId: string;
  clubId: string;
  parentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const CommentForm = ({
  threadId,
  clubId,
  parentId,
  onCancel,
  onSuccess,
  placeholder = 'Write a comment...',
  autoFocus = false,
}: CommentFormProps) => {
  const [text, setText] = useState('');
  // const createComment = useCreateComment(threadId);
  const {createComment, createCommentIsLoading} = useThreads(threadId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      createComment({
        commentText: text,
        parentId,
        clubId,
      });
      setText('');
      // onSuccess?.();
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
      <textarea
        className="w-full p-3 border rounded-md bg-background text-foreground resize-y min-h-[100px]"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus={autoFocus}
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={createCommentIsLoading || !text.trim()}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createCommentIsLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};
