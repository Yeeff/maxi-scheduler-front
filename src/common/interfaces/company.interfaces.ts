export interface ICompany {
  id?: number;
  name: string;
  nit: string;
  email?: string;
  address?: string;
  phone?: string;
  status?: boolean;
}

export interface ICompanyFilter {
  name?: string;
  nit?: string;
  page: number;
  perPage: number;
}

// For form state management
export interface ICompanyForm {
  name: string;
  nit: string;
  email: string;
  address: string;
  phone: string;
}