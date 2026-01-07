
export interface ChannelData {
  name: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
  cancelledOrders: number;
  cancelledValue: number;
}

export interface BranchData {
  name: string;
  arabicName: string;
  channels: ChannelData[];
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
}

export interface WebsiteData {
  totalOrders: number;
  visits: number;
  completedOrders: number;
  conversionRate: number;
  totalSales: number;
  avgOrderValue: number;
  cancelledOrders: number;
  cancellationRate: number;
  cancelledValue: number;
}


export interface SalesReport {
  branches: BranchData[];
  website: WebsiteData;
}

// User & Authentication Types
export type UserRole = 'admin' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isViewer: boolean;
  isAdmin: boolean;
}
