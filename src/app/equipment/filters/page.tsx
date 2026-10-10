import { redirect } from "next/navigation";

// Filters was folded into Camera Accessories — keep the old URL working for
// anyone with it bookmarked or linked.
export default function FiltersPage() {
  redirect("/equipment/camera-accessories");
}
