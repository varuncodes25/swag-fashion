// components/Review/ReplySection.js
import React, { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ReviewUserAvatar from './ReviewUserAvatar';

const ReplySection = ({ review, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mt-3 md:mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-primary dark:text-primary hover:text-primary mb-2"
      >
        <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span>Replies ({review.replies.length})</span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
        ) : (
          <ChevronDown className="h-3 w-3 md:h-3.5 md:w-3.5" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 md:mt-3 space-y-2 md:space-y-3 pl-4 md:pl-6 border-l-2 border-blue-100 dark:border-primary/30">
          {review.replies.map((reply) => (
            <div
              key={reply._id}
              className="bg-muted/40/30 rounded-lg p-3 md:p-4"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                <ReviewUserAvatar
                  name={reply.userId?.name || reply.user?.name}
                  size="sm"
                />
                <div>
                  <h6 className="font-medium text-foreground text-xs md:text-sm">
                    {reply.userId?.name || reply.user?.name}
                  </h6>
                  <p className="text-xs text-muted-foreground">
                    {new Date(reply.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                {reply.review}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplySection;