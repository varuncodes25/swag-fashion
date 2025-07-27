import React from "react";
import { Star } from "lucide-react";
import clsx from "clsx"; // Optional: if you want cleaner class handling

const StarRating = ({ rating, onRate }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => onRate(star)}
          className={clsx(
            "w-6 h-6 cursor-pointer transition-colors",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
          )}
        />
      ))}
    </div>
  );
};

export default StarRating;
