import { IScheduleTemplate } from "./schedule.interfaces";

export interface ICompany {
  id: number;
  name: string;
}

export interface IPosition {
  id?: number;
  name: string;
  location?: string;
  status?: boolean;
  company: ICompany;
  scheduleTemplate: IScheduleTemplate;
  idUser?: number;
}

export interface IPositionFilter {
  name?: string;
  companyId?: number;
  page: number;
  perPage: number;
}

// For form state management
export interface IPositionForm {
  name: string;
  location: string;
  companyId: number;
  scheduleTemplateId: number;
}