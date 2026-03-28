'use client';

import { Comment } from '@/hooks/useThreads';
import { CommentItem } from './comment-item';

interface CommentListProps {
  comments: Comment[];
  threadId: string;
  clubId: string;
}

export const CommentList = ({ comments, threadId, clubId }: CommentListProps) => {
  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>
      {topLevelComments.length === 0 ? (
        <p className="text-gray-500 italic">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              allComments={comments}
              threadId={threadId}
              clubId={clubId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
