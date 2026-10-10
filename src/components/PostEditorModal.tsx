import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { X, Globe, Eye, FileText, Check } from 'lucide-react';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    tags: string[];
    coverImage?: string;
    featured?: boolean;
  }) => Promise<void>;
  initialData?: Post | null;
}

const CATEGORIES = [
  'Architecture',
  'Design & UX',
  'Security',
  'Engineering',
  'Cloud Infrastructure',
  'Database Systems',
];

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setExcerpt(initialData.excerpt || '');
      setCategory(initialData.category || CATEGORIES[0]);
      setTagsInput(initialData.tags?.join(', ') || '');
      setCoverImage(initialData.coverImage || '');
      setFeatured(initialData.featured || false);
    } else {
      setTitle('');
      setContent('');
      setExcerpt('');
      setCategory(CATEGORIES[0]);
      setTagsInput('');
      setCoverImage('');
      setFeatured(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time slug preview generator
  const slugPreview = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'your-story-title';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        category,
        tags,
        coverImage: coverImage.trim() || undefined,
        featured,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save publication');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Publication' : 'Write a New Story'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Architecting Resilient Microservices with Outbox Pattern"
              className="w-full text-base font-semibold text-slate-900 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Category & Tags Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Microservices, Node.js, Security"
                className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Summary / Excerpt (Optional)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="A concise synopsis to display in article listings and previews..."
              className="w-full text-sm text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Content Editor with Write & Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Content (Markdown supported) *
              </label>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'write' ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'preview' ? 'bg-white font-semibold text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="### Introduction&#10;&#10;Write your deep-dive insights using markdown syntax..."
                rows={12}
                className="w-full text-sm font-mono leading-relaxed bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            ) : (
              <div className="min-h-[280px] p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-y-auto max-h-[350px] text-slate-800 text-sm leading-relaxed prose">
                {content.trim() ? (
                  content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p className="text-slate-400 italic">No content to preview yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Featured Post Flag */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featuredCheckbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="featuredCheckbox" className="text-xs text-slate-700 font-medium">
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
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{submitting ? 'Saving...' : initialData ? 'Update Story' : 'Publish Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
