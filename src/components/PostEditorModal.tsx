import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { Post } from "../types";
import { postEditorSchema } from "../validations/postValidation";
import { X, Globe, Eye, FileText, Check } from "lucide-react";

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    excerpt?: string;
    featured?: boolean;
  }) => Promise<void>;
  initialData?: Post | null;
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featured: initialData?.featured || false,
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = postEditorSchema.safeParse(values);
      if (result.success) return {};

      const errors: Record<string, string> = {};
      const issues = result.error.issues || (result.error as any).errors || [];
      for (const issue of issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);

      try {
        await onSubmit({
          title: values.title.trim(),
          content: values.content.trim(),
          excerpt: values.excerpt.trim() || undefined,

          featured: values.featured,
        });
        onClose();
      } catch (err: any) {
        setError(err.message || "Failed to save publication");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      formik.resetForm({
        values: {
          title: initialData?.title || "",
          content: initialData?.content || "",
          excerpt: initialData?.excerpt || "",

          featured: initialData?.featured || false,
        },
      });
      setError(null);
      setActiveTab("write");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Real-time slug preview generator
  const slugPreview =
    formik.values.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "your-story-title";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? "Edit Publication" : "Write a New Story"}
            </h3>
            <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Slug: /post/{slugPreview}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="post-title"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Article Title *
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="e.g. Architecting Resilient Microservices with Outbox Pattern"
              className={`w-full text-base font-semibold text-slate-900 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                formik.touched.title && formik.errors.title
                  ? "border-rose-400"
                  : "border-slate-200"
              }`}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {formik.errors.title}
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label
              htmlFor="post-excerpt"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Summary / Excerpt (Optional)
            </label>
            <input
              id="post-excerpt"
              name="excerpt"
              type="text"
              value={formik.values.excerpt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="A concise synopsis to display in article listings and previews..."
              className={`w-full text-sm text-slate-800 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                formik.touched.excerpt && formik.errors.excerpt
                  ? "border-rose-400"
                  : "border-slate-200"
              }`}
            />
            {formik.touched.excerpt && formik.errors.excerpt && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {formik.errors.excerpt}
              </p>
            )}
          </div>

          {/* Content Editor with Write & Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="post-content"
                className="text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Content (Markdown supported) *
              </label>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                    activeTab === "write"
                      ? "bg-white font-semibold text-slate-900 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                    activeTab === "preview"
                      ? "bg-white font-semibold text-slate-900 shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {activeTab === "write" ? (
              <div>
                <textarea
                  id="post-content"
                  name="content"
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="### Introduction&#10;&#10;Write your deep-dive insights using markdown syntax..."
                  rows={12}
                  className={`w-full text-sm font-mono leading-relaxed bg-white border rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                    formik.touched.content && formik.errors.content
                      ? "border-rose-400"
                      : "border-slate-200"
                  }`}
                />
                {formik.touched.content && formik.errors.content && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {formik.errors.content}
                  </p>
                )}
              </div>
            ) : (
              <div className="min-h-[280px] p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-[350px] text-slate-800 text-sm leading-relaxed prose">
                {formik.values.content.trim() ? (
                  formik.values.content
                    .split("\n\n")
                    .map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p className="text-slate-400 italic">
                    No content to preview yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Featured Post Flag */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featuredCheckbox"
              name="featured"
              checked={formik.values.featured}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label
              htmlFor="featuredCheckbox"
              className="text-xs text-slate-700 font-medium"
            >
              Feature this story on the home hero banner
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formik.handleSubmit()}
            disabled={formik.isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {formik.isSubmitting
                ? "Saving..."
                : initialData
                  ? "Update Story"
                  : "Publish Story"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
