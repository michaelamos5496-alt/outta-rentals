import { redirect } from "next/navigation";

// Matte Boxes was folded into Camera Accessories — keep the old URL working
// for anyone with it bookmarked or linked.
export default function MatteBoxesPage() {
  redirect("/equipment/camera-accessories");
}
