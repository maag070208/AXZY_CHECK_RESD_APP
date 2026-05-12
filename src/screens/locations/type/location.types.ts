export interface ILocation {
  id: string;
  name: string;
  zoneId: string;
  zone?: any;
  reference?: string;
  active: boolean;
}

export interface ILocationCreate {
  zoneId: string;
  name: string;
  reference?: string;
  active?: boolean;
}
