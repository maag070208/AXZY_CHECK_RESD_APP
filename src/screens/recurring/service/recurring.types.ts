export interface IRecurringConfiguration {
  id: string;
  title: string;
  residencialId: string | null;
  active: boolean;
  locations?: IRecurringLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface IRecurringLocation {
  id: string;
  recurringConfigurationId: string;
  locationId: string;
  order: number;
  tasks?: IRecurringTask[];
  location?: { id: string; name: string };
}

export interface IRecurringTask {
  id: string;
  recurringLocationId: string;
  description: string;
  reqPhoto: boolean;
}

export interface IRecurringConfigurationCreate {
  title: string;
  residencialId?: string;
  active?: boolean;
}

export interface IRecurringConfigurationUpdate {
  title?: string;
  active?: boolean;
}
