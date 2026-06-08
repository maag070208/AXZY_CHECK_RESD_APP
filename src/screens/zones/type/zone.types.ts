export interface IZone {
  id: string;
  name: string;
  residencialId?: string;
  residencial?: any;
  active: boolean;
}

export interface IZoneCreate {
  name: string;
  residencialId: string;
  active?: boolean;
}
