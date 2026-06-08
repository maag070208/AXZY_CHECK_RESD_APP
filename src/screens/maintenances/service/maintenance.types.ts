export type MaintenanceStatus = "PENDING" | "ATTENDED";

export interface IMaintenance {
  id: string;
  guardId: string;
  title: string;
  categoryId: string | null;
  typeId: string | null;
  category: string | null;
  description: string | null;
  media: string[] | null;
  latitude: number | null;
  longitude: number | null;
  status: MaintenanceStatus;
  resolvedAt: string | null;
  resolvedById: string | null;
  guard?: { id: string; name: string; lastName: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface IMaintenanceCreate {
  title: string;
  description?: string;
  media?: string[];
  categoryId?: string;
  typeId?: string;
  latitude?: number;
  longitude?: number;
  guardId?: string;
}

export interface IMaintenanceUpdate {
  title?: string;
  description?: string;
  status?: MaintenanceStatus;
}

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  PENDING: "Pendiente",
  ATTENDED: "Atendido",
};

export const MAINTENANCE_STATUS_VARIANT: Record<MaintenanceStatus, "warning" | "success"> = {
  PENDING: "warning",
  ATTENDED: "success",
};
