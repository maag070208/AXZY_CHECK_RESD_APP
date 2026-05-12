export interface IZone {
  id: string;
  name: string;
  active: boolean;
}

export interface IZoneCreate {
  name: string;
  active?: boolean;
}
