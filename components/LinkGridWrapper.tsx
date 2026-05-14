"use client";

import { useLinks } from "@/hooks/useLinks";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { LinkGrid } from "@/components/links/LinkGrid";
import { AddLinkForm } from "@/components/forms/AddLinkForm";
import { Menu, X } from "lucide-react";
import { LinkCategory } from "@/types";

export default function LinkGridWrapper() {
  const {
    links,
    filteredLinks,
    isLoading,
    filter,
    setFilter,
    addLink,
    deleteLink,
    allTags,
  } = useLinks();

  const [showAddForm, setShowAddForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        query={filter.query}
        onQueryChange={(q) => setFilter({ query: q })}
        onAddClick={() => setShowAddForm(true)}
        linkCount={links.length}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="md:hidden fixed bottom-5 left-4 z-40 p-3 rounded-full bg-indigo-500 text-white"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>

        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          links={links}
          filter={filter}
          onCategoryChange={(cat: LinkCategory | "all") => {
            setFilter({ category: cat });
            setSidebarOpen(false);
          }}
          onTagClick={(tag) => {
            setFilter({ tag });
            setSidebarOpen(false);
          }}
          allTags={allTags}
          isOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-6xl">
            <LinkGrid
              links={filteredLinks}
              isLoading={isLoading}
              onDelete={deleteLink}
              onTagClick={(tag) => setFilter({ tag })}
              query={filter.query}
            />
          </div>
        </main>
      </div>

      {showAddForm && (
        <AddLinkForm onAdd={addLink} onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}
