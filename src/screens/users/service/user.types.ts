import { IResidencial } from '../../residenciales/service/residencial.types';

export interface IRole {
  id: string;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface IUser {
  id: string;
  name: string;
  lastName: string | null;
  username: string;
  active: boolean;
  softDelete: boolean;
  shiftStart: string | null;
  shiftEnd: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isLoggedIn: boolean;
  scheduleId: string | null;
  residencialId: string | null;
  roleId: string;
  role: IRole;
  residencial?: IResidencial;
  schedule?: ISchedule;
  _count?: {
    rounds: number;
    incidents: number;
    assignments: number;
  };
}

export interface CreateUserDTO {
  name: string;
  lastName?: string;
  username: string;
  password?: string;
  roleId: string;
  residencialId?: string;
  scheduleId?: string;
}

export interface UpdateUserDTO {
  name?: string;
  lastName?: string;
  username?: string;
  roleId?: string;
  residencialId?: string;
  scheduleId?: string;
  active?: boolean;
}

export interface IRoleOption {
  label: string;
  value: string | null;
}
