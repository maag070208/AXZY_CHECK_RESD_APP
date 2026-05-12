export type RoundStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Location {
  id: string;
  name: string;
  tasks?: any[];
}

export interface RecurringLocation {
  id: string;
  locationId: string;
  recurringConfigurationId: string;
  order: number;
  location: Location;
  tasks?: any[];
}

export interface RecurringConfiguration {
  id: string;
  title: string;
  recurringLocations?: RecurringLocation[];
}

export interface Round {
  id: string;
  guardId: string;
  status: RoundStatus;
  recurringConfigurationId?: string;
  recurringConfiguration?: RecurringConfiguration;
  kardex?: any[];
}
