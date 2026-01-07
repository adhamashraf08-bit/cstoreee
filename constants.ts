
import { SalesReport } from './types';

export const DASHBOARD_DATA: SalesReport = {
  branches: [
    {
      name: "Maadi",
      arabicName: "المعادي",
      channels: [
        { name: "Call Centre", sales: 139322.55, orders: 198, avgOrderValue: 703.7, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Insta", sales: 270006.16, orders: 536, avgOrderValue: 503.7, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Talabat", sales: 240079, orders: 695, avgOrderValue: 345.4, cancelledOrders: 0, cancelledValue: 0 }
      ],
      totalSales: 649407.71,
      totalOrders: 1429,
      avgOrderValue: 454.7
    },
    {
      name: "Heliopolis",
      arabicName: "مصر الجديدة",
      channels: [
        { name: "Call Centre", sales: 226896.76, orders: 335, avgOrderValue: 677.3, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Insta", sales: 332023.66, orders: 631, avgOrderValue: 526.2, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Talabat", sales: 389231.71, orders: 1197, avgOrderValue: 325.2, cancelledOrders: 0, cancelledValue: 0 }
      ],
      totalSales: 948152.13,
      totalOrders: 2163,
      avgOrderValue: 438.3
    },
    {
      name: "Tagamoa",
      arabicName: "التجمع",
      channels: [
        { name: "Call Centre", sales: 173787.06, orders: 230, avgOrderValue: 755.6, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Insta", sales: 314532, orders: 581, avgOrderValue: 541.4, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Talabat", sales: 273711.53, orders: 817, avgOrderValue: 335.0, cancelledOrders: 0, cancelledValue: 0 }
      ],
      totalSales: 762030.59,
      totalOrders: 1628,
      avgOrderValue: 468.1
    },
    {
      name: "Dark",
      arabicName: "Dark Store",
      channels: [
        { name: "Call Centre", sales: 221016.15, orders: 386, avgOrderValue: 572.9, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Insta", sales: 339310, orders: 724, avgOrderValue: 468.7, cancelledOrders: 0, cancelledValue: 0 },
        { name: "Talabat", sales: 618680.25, orders: 1994, avgOrderValue: 310.3, cancelledOrders: 0, cancelledValue: 0 }
      ],
      totalSales: 1179006.4,
      totalOrders: 3104,
      avgOrderValue: 379.7
    }
  ],
  website: {
    totalOrders: 206,
    visits: 23000,
    completedOrders: 184,
    conversionRate: 0.90,
    totalSales: 135591.82,
    avgOrderValue: 736.91,
    cancelledOrders: 22,
    cancellationRate: 10.7,
    cancelledValue: 11695.9
  }
};
