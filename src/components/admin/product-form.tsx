"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Divider } from "@/components/ui/divider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brands, categories, availabilityLabels } from "@/lib/catalogue";
import type { ProductAvailability } from "@/lib/catalogue";
import { createProductAction, updateProductAction } from "@/lib/admin/actions";
import type { AdminProduct, AdminProductImage } from "@/lib/admin/types";

const availabilityOptions = Object.keys(availabilityLabels) as ProductAvailability[];

export interface ProductFormProps {
  product?: AdminProduct;
}

function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = React.useState(product?.name ?? "");
  const [slug, setSlug] = React.useState(product?.slug ?? "");
  const [sku, setSku] = React.useState(product?.sku ?? "");
  const [brandSlug, setBrandSlug] = React.useState(product?.brandSlug ?? brands[0]?.slug ?? "");
  const [categorySlug, setCategorySlug] = React.useState(
    product?.categorySlug ?? categories[0]?.slug ?? ""
  );
  const [shortDescription, setShortDescription] = React.useState(product?.shortDescription ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [dayRate, setDayRate] = React.useState(String(product?.dayRate ?? ""));
  const [weekRate, setWeekRate] = React.useState(String(product?.weekRate ?? ""));
  const [availability, setAvailability] = React.useState<ProductAvailability>(
    product?.availability ?? "available"
  );
  const [featured, setFeatured] = React.useState(product?.featured ?? false);
  const [tags, setTags] = React.useState(product?.tags.join(", ") ?? "");
  const [images, setImages] = React.useState<AdminProductImage[]>(product?.images ?? []);
  const [specifications, setSpecifications] = React.useState(
    product?.specifications ?? []
  );
  const [included, setIncluded] = React.useState<string[]>(product?.included ?? []);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      slug,
      sku,
      name,
      brandSlug,
      categorySlug,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      shortDescription,
      description,
      dayRate: Number(dayRate) || 0,
      weekRate: Number(weekRate) || 0,
      currency: "USD",
      availability,
      featured,
      specifications,
      included,
      accessorySlugs: product?.accessorySlugs ?? [],
      compatibleSlugs: product?.compatibleSlugs ?? [],
      images,
      archived: product?.archived ?? false,
    };

    try {
      if (isEdit && product) {
        await updateProductAction(product.id, payload);
      } else {
        await createProductAction(payload);
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Couldn't save this product. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" className="mt-1.5" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" className="mt-1.5" value={sku} onChange={(e) => setSku(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" className="mt-1.5" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Select value={brandSlug} onValueChange={setBrandSlug}>
            <SelectTrigger id="brand" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.slug} value={b.slug}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categorySlug} onValueChange={setCategorySlug}>
            <SelectTrigger id="category" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section>
        <Label htmlFor="short-description">Short description</Label>
        <Input
          id="short-description"
          className="mt-1.5"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
        <Label htmlFor="description" className="mt-4 block">
          Description
        </Label>
        <Textarea
          id="description"
          className="mt-1.5"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <Divider />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="day-rate">Daily rate (USD)</Label>
          <Input
            id="day-rate"
            type="number"
            className="mt-1.5"
            value={dayRate}
            onChange={(e) => setDayRate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="week-rate">Weekly rate (USD)</Label>
          <Input
            id="week-rate"
            type="number"
            className="mt-1.5"
            value={weekRate}
            onChange={(e) => setWeekRate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="availability">Availability</Label>
          <Select value={availability} onValueChange={(v) => setAvailability(v as ProductAvailability)}>
            <SelectTrigger id="availability" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {availabilityLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(Boolean(v))} />
        Featured on the homepage
      </label>

      <Divider />

      <section>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Images</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImages((imgs) => [...imgs, { url: "", alt: "" }])}
          >
            <Plus /> Add image
          </Button>
        </div>
        <p className="text-meta mt-1">
          Image URLs only — no file storage connected yet.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {images.map((image, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="https://…"
                aria-label="Image URL"
                value={image.url}
                onChange={(e) =>
                  setImages((imgs) => imgs.map((img, j) => (j === i ? { ...img, url: e.target.value } : img)))
                }
              />
              <Input
                placeholder="Alt text"
                aria-label="Image alt text"
                value={image.alt}
                onChange={(e) =>
                  setImages((imgs) => imgs.map((img, j) => (j === i ? { ...img, alt: e.target.value } : img)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove image"
                onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Specifications</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSpecifications((specs) => [...specs, { label: "", value: "", group: "" }])
            }
          >
            <Plus /> Add spec
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {specifications.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Group (e.g. Imaging)"
                aria-label="Specification group"
                className="w-32"
                value={spec.group ?? ""}
                onChange={(e) =>
                  setSpecifications((specs) =>
                    specs.map((s, j) => (j === i ? { ...s, group: e.target.value } : s))
                  )
                }
              />
              <Input
                placeholder="Label"
                aria-label="Specification label"
                value={spec.label}
                onChange={(e) =>
                  setSpecifications((specs) =>
                    specs.map((s, j) => (j === i ? { ...s, label: e.target.value } : s))
                  )
                }
              />
              <Input
                placeholder="Value"
                aria-label="Specification value"
                value={spec.value}
                onChange={(e) =>
                  setSpecifications((specs) =>
                    specs.map((s, j) => (j === i ? { ...s, value: e.target.value } : s))
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove specification"
                onClick={() => setSpecifications((specs) => specs.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">What&rsquo;s included</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIncluded((list) => [...list, ""])}
          >
            <Plus /> Add item
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {included.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                aria-label="Included item"
                value={item}
                onChange={(e) =>
                  setIncluded((list) => list.map((it, j) => (j === i ? e.target.value : it)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove included item"
                onClick={() => setIncluded((list) => list.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { ProductForm };
