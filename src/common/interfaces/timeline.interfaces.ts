import { IPosition, ICompany } from './position.interfaces';
import { IScheduleTemplate } from './schedule.interfaces';

export interface IWorkSchedule {
  id?: number;
  positionId: number;
  employeeId?: number;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakStart?: string; // HH:mm format
  breakEnd?: string; // HH:mm format
  scheduleTemplateId?: number;
  status: 'active' | 'inactive';
}

export interface ITimelineRow {
  id: string;
  position: IPosition;
  employee?: {
    id: number;
    name: string;
    document?: string;
  };
  scheduleData: {
    monday: ITimeBlock[];
    tuesday: ITimeBlock[];
    wednesday: ITimeBlock[];
    thursday: ITimeBlock[];
    friday: ITimeBlock[];
    saturday: ITimeBlock[];
    sunday: ITimeBlock[];
  };
}

export interface ITimeBlock {
  id?: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'work' | 'break' | 'off';
  scheduleTemplateId?: number;
  workScheduleId?: number;
}

export interface ITimelineFilter {
  companyId?: number;
}

export interface ITimelineData {
  positions: ITimelineRow[];
  companies: ICompany[];
  weekStart: string; // ISO date for Monday of the displayed week
}