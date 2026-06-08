export interface IReportType {
  key: string;
  label: string;
  icon: string;
}

export interface IReportData {
  type: string;
  data: unknown;
}

export interface IReportParams {
  startDate: string;
  endDate: string;
  residencialId?: number;
  type: string;
}
