import { FileText, PenSquare } from "lucide-react";
import React from "react";

interface NoPostListProps {
  filter: "all" | "active" | "trash";
  handleOpenNewPost: () => void;
}

const NoPostList: React.FC<NoPostListProps> = ({
  filter,
  handleOpenNewPost,
}) => {
  return (
    <div className="p-16 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 space-y-4">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-base font-bold text-slate-900">No stories found</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          {filter === "trash"
            ? "Your trash is completely empty."
            : "You have not written any publications yet."}
        </p>
      </div>
      {filter !== "trash" && (
        <button
          onClick={handleOpenNewPost}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>Write Your First Article</span>
        </button>
      )}
    </div>
  );
};

export default NoPostList;
