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

export interface ITimelineEmployee {
  id: number;
  name: string;
  document: string;
  isCurrentEmployee: boolean;
  scheduleData: {
    MONDAY: ITimeBlock[];
    TUESDAY: ITimeBlock[];
    WEDNESDAY: ITimeBlock[];
    THURSDAY: ITimeBlock[];
    FRIDAY: ITimeBlock[];
    SATURDAY: ITimeBlock[];
    SUNDAY: ITimeBlock[];
  };
}

export interface ITimelineRow {
  id: string;
  position: IPosition;
  employees: ITimelineEmployee[];
}

export interface ITimeBlock {
  id?: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'work' | 'break' | 'off';
  scheduleTemplateId?: number;
  workScheduleId?: number;
  employeeId?: number;
  employeeName?: string;
  isCurrentEmployee?: boolean;
}

export interface ITimelineFilter {
  companyId?: number;
}

export interface ITimelineData {
  positions: ITimelineRow[];
  weekStart: string; // ISO date for Monday of the displayed week
}