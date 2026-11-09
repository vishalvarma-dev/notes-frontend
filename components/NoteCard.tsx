'use client';

import React, { useState } from 'react';
import { NoteItem } from './NoteModal';
import { Edit3, Trash2, Calendar, Loader2, Copy, Check } from 'lucide-react';

interface NoteCardProps {
  note: NoteItem;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(note.id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = `${note.title}\n\n${note.content || ''}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-amber-400/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/40">
      <div>
        {/* Title */}
        <h4 className="text-base font-bold text-zinc-900 line-clamp-1 dark:text-zinc-100">
          {note.title}
        </h4>

        {/* Content */}
        <p className="mt-2 text-sm text-zinc-600 line-clamp-4 whitespace-pre-wrap dark:text-zinc-300">
          {note.content || <span className="italic text-zinc-400">No additional content</span>}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            title="Copy note content"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>

          <button
            onClick={() => onEdit(note)}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-amber-600 dark:hover:bg-zinc-800 dark:hover:text-amber-400"
            title="Edit note"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md bg-zinc-200 px-1.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              title="Delete note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
