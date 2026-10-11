import React from "react";
import { useNavigate } from "react-router";

const NoPostFound = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center">
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        Publication Not Found
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        The requested article could not be located or may have been removed.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
      >
        Return to Publications
      </button>
    </div>
  );
};

export default NoPostFound;
