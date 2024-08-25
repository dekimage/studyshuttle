import React from "react";
import { CgSpinner } from "react-icons/cg"; // Example spinner icon

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lightGrey">
      <div className="flex flex-col items-center">
        <CgSpinner className="mb-4 h-12 w-12 animate-spin text-sky" />
        <div className="text-xl font-semibold text-darkGrey">Loading...</div>
      </div>
    </div>
  );
};

export default Loader;
