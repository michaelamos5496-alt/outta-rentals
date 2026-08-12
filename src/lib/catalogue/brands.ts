import type { Brand } from "@/types";

export const brands: Brand[] = [
  { id: "brand-sony", name: "Sony", slug: "sony" },
  { id: "brand-canon", name: "Canon", slug: "canon" },
  { id: "brand-arri", name: "ARRI", slug: "arri" },
  { id: "brand-red", name: "RED", slug: "red" },
  { id: "brand-sigma", name: "Sigma", slug: "sigma" },
  { id: "brand-aputure", name: "Aputure", slug: "aputure" },
  { id: "brand-amaran", name: "Amaran", slug: "amaran" },
  { id: "brand-godox", name: "Godox", slug: "godox" },
  { id: "brand-smallhd", name: "SmallHD", slug: "smallhd" },
  { id: "brand-dji", name: "DJI", slug: "dji" },
  { id: "brand-sachtler", name: "Sachtler", slug: "sachtler" },
  { id: "brand-sennheiser", name: "Sennheiser", slug: "sennheiser" },
  { id: "brand-blackmagic", name: "Blackmagic Design", slug: "blackmagic" },
  { id: "brand-dzofilm", name: "DZOFilm", slug: "dzofilm" },
  { id: "brand-laowa", name: "Laowa", slug: "laowa" },
  { id: "brand-wooden-camera", name: "Wooden Camera", slug: "wooden-camera" },
  { id: "brand-tilta", name: "Tilta", slug: "tilta" },
  { id: "brand-tiffen", name: "Tiffen", slug: "tiffen" },
  { id: "brand-nanlux", name: "Nanlux", slug: "nanlux" },
  { id: "brand-infinibar", name: "Infinibar", slug: "infinibar" },
  { id: "brand-nanlite", name: "Nanlite", slug: "nanlite" },
  { id: "brand-atomos", name: "Atomos", slug: "atomos" },
  { id: "brand-teradek", name: "Teradek", slug: "teradek" },
  { id: "brand-freefly", name: "Freefly", slug: "freefly" },
  { id: "brand-outta", name: "OUTTA Essentials", slug: "outta-essentials" },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}
