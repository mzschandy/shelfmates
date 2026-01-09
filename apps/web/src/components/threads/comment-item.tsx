'use client';

import { useState } from 'react';
import { Comment } from '@/hooks/useThreads';
import { CommentForm } from './comment-form';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
  allComments: Comment[];
  threadId: string;
  clubId: string;
}

export const CommentItem = ({
  comment,
  allComments,
  threadId,
  clubId,
}: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);

  const childComments = allComments.filter((c) => c.parentId === comment.id);

  return (
    <div className="flex gap-3 mb-4">
        {/* Avatar Placeholder */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
        {comment.clubMember.profile.avatarUrl ? (
          <img
            src={comment.clubMember.profile.avatarUrl}
            alt={comment.clubMember.profile.username || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-gray-600">
            {(comment.clubMember.profile.username || '?')[0].toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-grow">
        <div className="bg-gray-50 rounded-lg p-3 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">
              {comment.clubMember.profile.username || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {comment.commentText}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-4">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Reply
          </button>
        </div>

        {isReplying && (
          <div className="mt-2 pl-2 border-l-2 border-gray-200">
            <CommentForm
              threadId={threadId}
              clubId={clubId}
              parentId={comment.id}
              onCancel={() => setIsReplying(false)}
              onSuccess={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}

        {childComments.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
            {childComments.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                allComments={allComments}
                threadId={threadId}
                clubId={clubId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
