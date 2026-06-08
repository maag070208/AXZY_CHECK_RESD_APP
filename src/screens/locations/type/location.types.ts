export interface ILocation {
  id: string;
  zoneId?: string;
  zone?: { name: string };
  name: string;
  reference?: string;
  aisle?: string;
  spot?: string;
  number?: string;
  isOccupied?: boolean;
  active?: boolean;
  _count?: { tasks: number };
}

export interface ILocationCreate {
  zoneId: string;
  name: string;
  reference?: string;
  aisle?: string;
  spot?: string;
  number?: string;
  active?: boolean;
}
