'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { StickyNote, User as UserIcon, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenNewNote: () => void;
}

export default function Navbar({ onOpenProfile, onOpenNewNote }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <StickyNote className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Notes<span className="text-amber-500">App</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Fast, simple & secure notes
            </p>
          </div>
        </div>

        {/* User actions */}
        {user && (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewNote}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
            >
              <span>+ New Note</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="View Profile"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline font-medium">{user.name}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200/60 bg-rose-50/50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100/70 hover:text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

