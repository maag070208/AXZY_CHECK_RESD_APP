export type FeeType = "ONE_TIME" | "MONTHLY";

export interface IFee {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  type: FeeType;
  dueDate: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFeeCreate {
  name: string;
  description?: string;
  amount: number;
  type?: FeeType;
  dueDate?: string;
  active?: boolean;
}

export interface IFeeUpdate {
  name?: string;
  description?: string;
  amount?: number;
  type?: FeeType;
  dueDate?: string;
  active?: boolean;
}
