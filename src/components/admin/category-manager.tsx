"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/admin/actions";
import type { AdminCategory } from "@/lib/admin/types";

interface DraftCategory {
  name: string;
  slug: string;
  description: string;
}

const emptyDraft: DraftCategory = { name: "", slug: "", description: "" };

function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftCategory>(emptyDraft);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<DraftCategory>(emptyDraft);
  const [busy, setBusy] = React.useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await createCategoryAction(draft);
    setDraft(emptyDraft);
    setAdding(false);
    router.refresh();
    setBusy(false);
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditDraft({ name: category.name, slug: category.slug, description: category.description });
  }

  async function handleSaveEdit(id: string) {
    setBusy(true);
    await updateCategoryAction(id, editDraft);
    setEditingId(null);
    router.refresh();
    setBusy(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this category?")) return;
    setBusy(true);
    await deleteCategoryAction(id);
    router.refresh();
    setBusy(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-small">{categories.length} categories</p>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          {adding ? <X /> : <Plus />}
          {adding ? "Cancel" : "New Category"}
        </Button>
      </div>

      {adding ? (
        <form
          onSubmit={handleCreate}
          className="mt-4 flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="text-label" htmlFor="new-category-name">Name</label>
            <Input
              id="new-category-name"
              className="mt-1.5"
              required
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="text-label" htmlFor="new-category-slug">Slug</label>
            <Input
              id="new-category-slug"
              className="mt-1.5"
              placeholder="auto from name if left blank"
              value={draft.slug}
              onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
            />
          </div>
          <div className="flex-[2]">
            <label className="text-label" htmlFor="new-category-description">Description</label>
            <Input
              id="new-category-description"
              className="mt-1.5"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={busy}>
            Save
          </Button>
        </form>
      ) : null}

      <div className="mt-4 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const isEditing = editingId === category.id;
              return (
                <TableRow key={category.id}>
                  {isEditing ? (
                    <>
                      <TableCell>
                        <Input
                          aria-label="Category name"
                          value={editDraft.name}
                          onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label="Category slug"
                          value={editDraft.slug}
                          onChange={(e) => setEditDraft((d) => ({ ...d, slug: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label="Category description"
                          value={editDraft.description}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, description: e.target.value }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" disabled={busy} onClick={() => handleSaveEdit(category.id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell className="max-w-72 truncate">{category.description}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit"
                          onClick={() => startEdit(category)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete"
                          className="hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { CategoryManager };
