import React, { useState } from "react";
import { Star as StarOutline, StarHalf } from "lucide-react";

const StarRating = ({ rating, setRating, editable = false }) => {
  const MAX_STARS = 5;
  const [hoverIndex, setHoverIndex] = useState(null);

  const handleStarClick = (index) => {
    if (editable && setRating) {
      setRating(index + 1); // Rating is 1-indexed
    }
  };

  const handleMouseEnter = (index) => {
    if (editable) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverIndex(null);
    }
  };

  const getStarType = (index) => {
    const currentRating = hoverIndex !== null ? hoverIndex + 1 : rating;

    if (index < Math.floor(currentRating)) {
      return "full";
    } else if (index < currentRating) {
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
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
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
