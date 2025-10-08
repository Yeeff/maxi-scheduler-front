export interface IBreakPeriod {
  id?: number;
  description: string;
  startTime: string; // LocalTime as string "HH:mm:ss"
  endTime: string; // LocalTime as string "HH:mm:ss"
}

export interface IShift {
  id?: number;
  name: string;
  startTime: string; // LocalTime as string "HH:mm:ss"
  endTime: string; // LocalTime as string "HH:mm:ss"
  lunchTimeInit?: string; // Lunch start time
  lunchTimeEnd?: string;   // Lunch end time
  lunchDescription?: string; // Lunch description
}

export interface IScheduleDay {
  id?: number;
  dayOfWeek: string; // "MONDAY", "TUESDAY", etc.
  shifts: IShift[];
}

export interface IScheduleTemplate {
  id?: number;
  name: string;
  description: string;
  details: IScheduleDay[];
}

export interface IScheduleFilter {
  name?: string;
  page: number;
  perPage: number;
}

// For form state management
export interface IShiftForm {
  name: string;
  startTime: string;
  endTime: string;
  lunchDescription: string;
  lunchTimeInit: string;
  lunchTimeEnd: string;
}