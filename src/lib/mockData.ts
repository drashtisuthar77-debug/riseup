export type UserRole = 'municipality' | 'contractor' | 'field' | 'ministry';

export type TaskStatus = 'Completed' | 'Pending' | 'Delayed' | 'No-Show';

export interface WastePickupTask {
  id: string;
  ward: string;
  zone: string;
  locality: string;
  contractor: string;
  scheduledTime: string;
  status: TaskStatus;
  completedTime?: string;
  remarks?: string;
  wasteType: 'Dry' | 'Wet' | 'Mixed' | 'Hazardous';
  quantityKg: number;
  vehicleNumber: string;
  date: Date;
}

export interface Contractor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  assignedWards: string[];
  complianceScore: number;
  totalTasks: number;
  completedOnTime: number;
  delayed: number;
  noShow: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface Truck {
  id: string;
  vehicleNumber: string;
  driver: string;
  contractor: string;
  status: 'En Route' | 'Loading' | 'Returning' | 'Idle';
  currentLocation: { x: number; y: number };
  speed: number;
  lastUpdate: Date;
  capacity: number;
  currentLoad: number;
  assignedWard: string;
}

export interface HistoricalReport {
  date: Date;
  totalPickups: number;
  completed: number;
  delayed: number;
  noShow: number;
  wasteCollectedKg: number;
  avgResponseTime: number;
}

// Generate mock tasks
export const generateMockTasks = (days: number = 7): WastePickupTask[] => {
  const contractors = ['GreenCity Waste Solutions', 'Metro Sanitation Pvt Ltd', 'EcoClean Services', 'Urban Hygiene Corp'];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];
  const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
  const localities = ['Rajaji Nagar', 'MG Road', 'Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar', 'JP Nagar', 'HSR Layout'];
  const wasteTypes: Array<'Dry' | 'Wet' | 'Mixed' | 'Hazardous'> = ['Dry', 'Wet', 'Mixed', 'Hazardous'];
  const statuses: TaskStatus[] = ['Completed', 'Pending', 'Delayed', 'No-Show'];

  const tasks: WastePickupTask[] = [];
  
  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    
    const tasksPerDay = Math.floor(Math.random() * 10) + 15;
    
    for (let i = 0; i < tasksPerDay; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const hour = 6 + Math.floor(Math.random() * 12);
      
      tasks.push({
        id: `TASK-${date.toISOString().slice(0, 10)}-${String(i + 1).padStart(3, '0')}`,
        ward: wards[Math.floor(Math.random() * wards.length)],
        zone: zones[Math.floor(Math.random() * zones.length)],
        locality: localities[Math.floor(Math.random() * localities.length)],
        contractor: contractors[Math.floor(Math.random() * contractors.length)],
        scheduledTime: `${String(hour).padStart(2, '0')}:00`,
        status,
        completedTime: status === 'Completed' ? `${String(hour + Math.floor(Math.random() * 2)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : undefined,
        wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
        quantityKg: Math.floor(Math.random() * 500) + 100,
        vehicleNumber: `KA-${Math.floor(Math.random() * 50) + 1}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9000) + 1000}`,
        date,
        remarks: status === 'No-Show' ? 'Vehicle breakdown' : status === 'Delayed' ? 'Traffic congestion' : undefined
      });
    }
  }
  
  return tasks.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const mockContractors: Contractor[] = [
  {
    id: 'C001',
    name: 'GreenCity Waste Solutions',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh@greencity.in',
    assignedWards: ['Ward 1', 'Ward 2'],
    complianceScore: 94,
    totalTasks: 450,
    completedOnTime: 410,
    delayed: 30,
    noShow: 10,
    riskLevel: 'Low'
  },
  {
    id: 'C002',
    name: 'Metro Sanitation Pvt Ltd',
    contactPerson: 'Priya Sharma',
    phone: '+91 98765 43211',
    email: 'priya@metrosanitation.in',
    assignedWards: ['Ward 3', 'Ward 4'],
    complianceScore: 78,
    totalTasks: 380,
    completedOnTime: 280,
    delayed: 70,
    noShow: 30,
    riskLevel: 'Medium'
  },
  {
    id: 'C003',
    name: 'EcoClean Services',
    contactPerson: 'Amit Patel',
    phone: '+91 98765 43212',
    email: 'amit@ecoclean.in',
    assignedWards: ['Ward 5'],
    complianceScore: 62,
    totalTasks: 200,
    completedOnTime: 120,
    delayed: 50,
    noShow: 30,
    riskLevel: 'High'
  },
  {
    id: 'C004',
    name: 'Urban Hygiene Corp',
    contactPerson: 'Sneha Reddy',
    phone: '+91 98765 43213',
    email: 'sneha@urbanhygiene.in',
    assignedWards: ['Ward 6'],
    complianceScore: 88,
    totalTasks: 320,
    completedOnTime: 275,
    delayed: 35,
    noShow: 10,
    riskLevel: 'Low'
  }
];

export const generateMockTrucks = (): Truck[] => {
  const trucks: Truck[] = [
    {
      id: 'T001',
      vehicleNumber: 'KA-01-AB-1234',
      driver: 'Ramesh',
      contractor: 'GreenCity Waste Solutions',
      status: 'En Route',
      currentLocation: { x: 25, y: 30 },
      speed: 20,
      lastUpdate: new Date(),
      capacity: 5000,
      currentLoad: 1200,
      assignedWard: 'Ward 1'
    },
    {
      id: 'T002',
      vehicleNumber: 'KA-01-CD-5678',
      driver: 'Suresh',
      contractor: 'GreenCity Waste Solutions',
      status: 'Loading',
      currentLocation: { x: 45, y: 55 },
      speed: 0,
      lastUpdate: new Date(),
      capacity: 5000,
      currentLoad: 3500,
      assignedWard: 'Ward 2'
    },
    {
      id: 'T003',
      vehicleNumber: 'KA-02-EF-9012',
      driver: 'Mahesh',
      contractor: 'Metro Sanitation Pvt Ltd',
      status: 'Returning',
      currentLocation: { x: 70, y: 40 },
      speed: 35,
      lastUpdate: new Date(),
      capacity: 4500,
      currentLoad: 4200,
      assignedWard: 'Ward 3'
    },
    {
      id: 'T004',
      vehicleNumber: 'KA-02-GH-3456',
      driver: 'Ganesh',
      contractor: 'Metro Sanitation Pvt Ltd',
      status: 'En Route',
      currentLocation: { x: 35, y: 70 },
      speed: 25,
      lastUpdate: new Date(),
      capacity: 5000,
      currentLoad: 800,
      assignedWard: 'Ward 4'
    },
    {
      id: 'T005',
      vehicleNumber: 'KA-03-IJ-7890',
      driver: 'Naresh',
      contractor: 'EcoClean Services',
      status: 'Idle',
      currentLocation: { x: 80, y: 75 },
      speed: 0,
      lastUpdate: new Date(),
      capacity: 4000,
      currentLoad: 0,
      assignedWard: 'Ward 5'
    },
    {
      id: 'T006',
      vehicleNumber: 'KA-04-KL-1234',
      driver: 'Dinesh',
      contractor: 'Urban Hygiene Corp',
      status: 'En Route',
      currentLocation: { x: 55, y: 25 },
      speed: 30,
      lastUpdate: new Date(),
      capacity: 5500,
      currentLoad: 2100,
      assignedWard: 'Ward 6'
    }
  ];
  
  return trucks;
};

export const generateHistoricalReports = (days: number = 30): HistoricalReport[] => {
  const reports: HistoricalReport[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const totalPickups = Math.floor(Math.random() * 30) + 80;
    const completed = Math.floor(totalPickups * (0.7 + Math.random() * 0.2));
    const delayed = Math.floor((totalPickups - completed) * 0.6);
    const noShow = totalPickups - completed - delayed;
    
    reports.push({
      date,
      totalPickups,
      completed,
      delayed,
      noShow,
      wasteCollectedKg: Math.floor(Math.random() * 20000) + 30000,
      avgResponseTime: Math.floor(Math.random() * 30) + 15
    });
  }
  
  return reports.sort((a, b) => b.date.getTime() - a.date.getTime());
};
