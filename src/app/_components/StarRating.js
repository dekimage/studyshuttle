import React from "react";
import { Star as StarOutline, StarHalf } from "lucide-react";

const StarRating = ({ rating, setRating, editable = false }) => {
  const MAX_STARS = 5;

  const handleStarClick = (index) => {
    if (editable && setRating) {
      setRating(index + 1); // Rating is 1-indexed
    }
  };

  const getStarType = (index) => {
    if (index < Math.floor(rating)) {
      return "full";
    } else if (index < rating) {
      return "half";
    } else {
      return "empty";
    }
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const starType = getStarType(index);

        return (
          <span
            key={index}
            className="relative inline-block cursor-pointer"
            onClick={() => handleStarClick(index)}
          >
            {starType === "full" && (
              <StarOutline
                className="text-yellow-500"
                style={{
                  fill: "currentColor",
                  stroke: "black",
                  strokeWidth: "2px",
                }}
              />
            )}
            {starType === "half" && (
              <div className="relative">
                <StarOutline
                  className="text-gray-300"
                  style={{ fill: "none", stroke: "black", strokeWidth: "2px" }}
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <StarOutline
                    className="text-yellow-500"
                    style={{ fill: "currentColor", stroke: "none" }}
                  />
                </div>
              </div>
            )}
            {starType === "empty" && (
              <StarOutline
                className="text-gray-300"
                style={{ fill: "none", stroke: "black", strokeWidth: "2px" }}
              />
            )}
          </span>
        );
      })}
      <div className="ml-2">{rating.toFixed(1)}</div>
    </div>
  );
};

export default StarRating;
