'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import ProfileModal from '../components/ProfileModal';
import NoteModal, { NoteItem } from '../components/NoteModal';
import NoteCard from '../components/NoteCard';
import { Plus, Search, StickyNote, Loader2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<NoteItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoadingNotes(true);
    try {
      const data = await api.notes.getAll();
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [user, fetchNotes]);

  // Handle note save (create or edit)
  const handleSaveNote = async (payload: { title: string; content: string }) => {
    if (noteToEdit) {
      await api.notes.update(noteToEdit.id, payload);
      showToast('Note updated successfully!');
    } else {
      await api.notes.create(payload);
      showToast('Note created successfully!');
    }
    await fetchNotes();
    await refreshProfile();
  };

  // Handle note delete
  const handleDeleteNote = async (id: number) => {
    await api.notes.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Note deleted successfully.');
    await refreshProfile();
  };

  // Filter notes by query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content && n.content.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen">
        <Navbar onOpenProfile={() => {}} onOpenNewNote={() => {}} />
        <AuthModal />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-xl dark:border-emerald-900/60 dark:bg-zinc-900 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenNewNote={() => {
          setNoteToEdit(null);
          setIsNoteModalOpen(true);
        }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* Top Controls: Search and Create Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search your notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
            <button
              onClick={() => {
                setNoteToEdit(null);
                setIsNoteModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="mt-8">
          {loadingNotes ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(n) => {
                    setNoteToEdit(n);
                    setIsNoteModalOpen(true);
                  }}
                  onDelete={handleDeleteNote}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                <StickyNote className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {searchQuery ? 'No matching notes found' : 'No notes yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? 'Try searching with different keywords or clear the search query.'
                  : 'Start capturing your ideas, reminders, and thoughts by creating your first note.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setNoteToEdit(null);
                    setIsNoteModalOpen(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Note</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setNoteToEdit(null);
        }}
        onSave={handleSaveNote}
        noteToEdit={noteToEdit}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </main>
  );
}
