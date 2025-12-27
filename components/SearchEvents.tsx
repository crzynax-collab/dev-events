"use client";

import { useState } from "react";
import Link from "next/link";

type SearchProps = {
  events: {
    title: string;
    slug: string;
  }[];
};

export default function SearchEvents({ events }: SearchProps) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim().length === 0
      ? []
      : events.filter(
          (e) =>
            e.slug.toLowerCase().includes(query.toLowerCase()) ||
            e.title.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <div className="max-w-xl mx-auto mt-10 relative">
      {/* input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search events by title or slug..."
        className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-dark-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* suggestions dropdown */}
      {query && filtered.length > 0 && (
        <div className="absolute mt-2 w-full rounded-lg bg-dark-100 border border-gray-700 shadow-xl z-20 max-h-64 overflow-y-auto">
          {filtered.map((event) => (
            <Link
              key={event.slug}
              href={`/Events/${event.slug}`}
              className="block px-4 py-2 hover:bg-dark-200 transition-colors"
            >
              <p className="text-white font-medium">{event.title}</p>
              <p className="text-xs text-gray-400">{event.slug}</p>
            </Link>
          ))}
        </div>
      )}

      {/* no results */}
      {query && filtered.length === 0 && (
        <div className="absolute mt-2 w-full rounded-lg bg-dark-100 border border-gray-700 shadow-xl z-20 px-4 py-2">
          <p className="text-gray-300 text-sm">No events found</p>
        </div>
      )}
    </div>
  );
}
