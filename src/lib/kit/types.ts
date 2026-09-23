export interface KitLineItem {
  productSlug: string;
  quantity: number;
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
  projectInfo: ProjectInfo;
}

export const emptyProjectInfo: ProjectInfo = {
  customerName: "",
  customerPhone: "",
  projectName: "",
  productionType: "",
  notes: "",
};
