export interface KitLineItem {
  productSlug: string;
  quantity: number;
  /** Set when this line came from "Add Entire Package to Cart" while the
   * bundle was still unmodified — lets the cart keep pricing the group at
   * OUTTA's flat quoted rate instead of summing each item's own day rate. */
  packageSlug?: string;
  packageTierSlug?: string;
}

export interface ProjectInfo {
  customerName: string;
  customerPhone: string;
  projectName: string;
  productionType: string;
  notes: string;
}

export interface KitState {
  items: KitLineItem[];
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  startTime: string; // 24h HH:MM pickup
  endTime: string; // 24h HH:MM return
  projectInfo: ProjectInfo;
}

export const emptyProjectInfo: ProjectInfo = {
  customerName: "",
  customerPhone: "",
  projectName: "",
  productionType: "",
  notes: "",
};
