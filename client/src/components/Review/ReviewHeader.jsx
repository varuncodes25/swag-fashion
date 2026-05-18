import React from "react";
import { Star } from "lucide-react";
import ReviewUserAvatar from "./ReviewUserAvatar";

const ReviewHeader = ({ review, formatDate }) => {
  const rating = review?.rating || 0;
  const userName = review?.userId?.name || review?.user?.name || "Anonymous User";
  const shortName = userName.split(" ")[0];
  const date = review?.createdAt;

  const renderStars = (size) => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300 dark:text-gray-600"
          }
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="mb-3 flex items-start justify-between md:hidden">
        <div className="flex items-center gap-3">
          <ReviewUserAvatar name={userName} size="md" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">{shortName}</h4>
            <div className="mt-0.5 flex items-center gap-1">
              {renderStars(12)}
              <span className="ml-1 text-xs font-semibold text-highlight dark:text-amber-500">
                {rating}.0
              </span>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="mb-4 hidden items-start gap-4 md:flex">
        <ReviewUserAvatar name={userName} size="lg" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-foreground">{userName}</h4>
              <div className="mt-1 flex items-center gap-2">
                {renderStars(14)}
                <span className="text-sm font-semibold text-highlight dark:text-amber-500">
                  {rating}.0
                </span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewHeader;
