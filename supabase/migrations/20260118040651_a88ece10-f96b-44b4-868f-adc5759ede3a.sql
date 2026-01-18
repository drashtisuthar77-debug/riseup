-- Create enum types for status values
CREATE TYPE public.bin_status AS ENUM ('Active', 'Full', 'Maintenance');
CREATE TYPE public.bin_type AS ENUM ('General', 'Recyclable', 'Organic', 'Hazardous');
CREATE TYPE public.report_status AS ENUM ('Pending', 'In Progress', 'Resolved');
CREATE TYPE public.report_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE public.task_status AS ENUM ('Completed', 'Pending', 'Delayed', 'No-Show');
CREATE TYPE public.waste_type AS ENUM ('Dry', 'Wet', 'Mixed', 'Hazardous');
CREATE TYPE public.truck_status AS ENUM ('En Route', 'Loading', 'Returning', 'Idle');
CREATE TYPE public.risk_level AS ENUM ('Low', 'Medium', 'High');

-- 1. Create bins table
CREATE TABLE public.bins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bin_code TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  ward TEXT NOT NULL,
  zone TEXT NOT NULL,
  fill_level INTEGER NOT NULL DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
  type public.bin_type NOT NULL DEFAULT 'General',
  status public.bin_status NOT NULL DEFAULT 'Active',
  last_collected TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create reports table (citizen waste issue reports)
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT,
  reporter_phone TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  ward TEXT,
  waste_type public.waste_type,
  severity public.report_severity NOT NULL DEFAULT 'Medium',
  status public.report_status NOT NULL DEFAULT 'Pending',
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create contractors table
CREATE TABLE public.contractors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  assigned_wards TEXT[] NOT NULL DEFAULT '{}',
  compliance_score INTEGER NOT NULL DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_on_time INTEGER NOT NULL DEFAULT 0,
  delayed INTEGER NOT NULL DEFAULT 0,
  no_show INTEGER NOT NULL DEFAULT 0,
  risk_level public.risk_level NOT NULL DEFAULT 'Low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create trucks table
CREATE TABLE public.trucks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  truck_code TEXT NOT NULL UNIQUE,
  vehicle_number TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE SET NULL,
  status public.truck_status NOT NULL DEFAULT 'Idle',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  speed DOUBLE PRECISION NOT NULL DEFAULT 0,
  capacity_kg INTEGER NOT NULL DEFAULT 5000,
  current_load_kg INTEGER NOT NULL DEFAULT 0,
  assigned_ward TEXT,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create waste_pickup_tasks table
CREATE TABLE public.waste_pickup_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_code TEXT NOT NULL UNIQUE,
  ward TEXT NOT NULL,
  zone TEXT NOT NULL,
  locality TEXT NOT NULL,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE SET NULL,
  truck_id UUID REFERENCES public.trucks(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_time TIME NOT NULL,
  status public.task_status NOT NULL DEFAULT 'Pending',
  completed_time TIME,
  remarks TEXT,
  waste_type public.waste_type NOT NULL DEFAULT 'Mixed',
  quantity_kg INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create collection_routes table
CREATE TABLE public.collection_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_code TEXT NOT NULL UNIQUE,
  route_name TEXT NOT NULL,
  truck_id UUID REFERENCES public.trucks(id) ON DELETE SET NULL,
  assigned_bins UUID[] DEFAULT '{}',
  route_status TEXT NOT NULL DEFAULT 'Scheduled',
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_pickup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_routes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access for all tables (for map display and dashboard)
CREATE POLICY "Allow public read access to bins" ON public.bins FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public read access to contractors" ON public.contractors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to trucks" ON public.trucks FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tasks" ON public.waste_pickup_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read access to routes" ON public.collection_routes FOR SELECT USING (true);

-- RLS Policies: Allow public insert for citizen reports
CREATE POLICY "Allow public to create reports" ON public.reports FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_bins_updated_at BEFORE UPDATE ON public.bins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.waste_pickup_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for waste photos
INSERT INTO storage.buckets (id, name, public) VALUES ('waste-photos', 'waste-photos', true);

-- Storage policies for waste-photos bucket
CREATE POLICY "Public can view waste photos" ON storage.objects FOR SELECT USING (bucket_id = 'waste-photos');
CREATE POLICY "Public can upload waste photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'waste-photos');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trucks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_pickup_tasks;

-- SEED DATA: Contractors
INSERT INTO public.contractors (contractor_code, name, contact_person, phone, email, assigned_wards, compliance_score, total_tasks, completed_on_time, delayed, no_show, risk_level) VALUES
('C001', 'GreenCity Waste Solutions', 'Rajesh Kumar', '+91 98765 43210', 'rajesh@greencity.in', ARRAY['Ward 1', 'Ward 2'], 94, 450, 410, 30, 10, 'Low'),
('C002', 'Metro Sanitation Pvt Ltd', 'Priya Sharma', '+91 98765 43211', 'priya@metrosanitation.in', ARRAY['Ward 3', 'Ward 4'], 78, 380, 280, 70, 30, 'Medium'),
('C003', 'EcoClean Services', 'Amit Patel', '+91 98765 43212', 'amit@ecoclean.in', ARRAY['Ward 5'], 62, 200, 120, 50, 30, 'High'),
('C004', 'Urban Hygiene Corp', 'Sneha Reddy', '+91 98765 43213', 'sneha@urbanhygiene.in', ARRAY['Ward 6'], 88, 320, 275, 35, 10, 'Low');

-- SEED DATA: Bins (10 locations across city)
INSERT INTO public.bins (bin_code, latitude, longitude, address, ward, zone, fill_level, type, status, last_collected) VALUES
('BIN-001', 12.9716, 77.5946, 'MG Road Main Junction', 'Ward 1', 'Central Zone', 85, 'General', 'Active', now() - interval '2 days'),
('BIN-002', 12.9815, 77.6094, 'Indiranagar 100ft Road', 'Ward 2', 'East Zone', 45, 'Recyclable', 'Active', now() - interval '1 day'),
('BIN-003', 12.9352, 77.6245, 'Koramangala 5th Block', 'Ward 3', 'South Zone', 92, 'Organic', 'Full', now() - interval '3 days'),
('BIN-004', 12.9611, 77.5986, 'Rajaji Nagar Metro', 'Ward 1', 'North Zone', 30, 'General', 'Active', now() - interval '6 hours'),
('BIN-005', 12.9344, 77.6128, 'Jayanagar 4th Block', 'Ward 4', 'South Zone', 67, 'Hazardous', 'Active', now() - interval '1 day'),
('BIN-006', 12.9141, 77.6410, 'HSR Layout Sector 2', 'Ward 5', 'East Zone', 78, 'Recyclable', 'Active', now() - interval '2 days'),
('BIN-007', 12.9698, 77.7500, 'Whitefield ITPL Road', 'Ward 6', 'East Zone', 55, 'General', 'Active', now() - interval '12 hours'),
('BIN-008', 12.9904, 77.5579, 'Vijayanagar Main Road', 'Ward 2', 'West Zone', 88, 'Organic', 'Active', now() - interval '3 days'),
('BIN-009', 12.9279, 77.5880, 'JP Nagar 6th Phase', 'Ward 4', 'South Zone', 40, 'General', 'Active', now() - interval '8 hours'),
('BIN-010', 13.0067, 77.5694, 'Malleswaram 8th Cross', 'Ward 1', 'North Zone', 15, 'Recyclable', 'Maintenance', now() - interval '5 days');

-- SEED DATA: Trucks
INSERT INTO public.trucks (truck_code, vehicle_number, driver_name, contractor_id, status, latitude, longitude, speed, capacity_kg, current_load_kg, assigned_ward, last_update)
SELECT 
  'TRK-001', 'KA-01-AB-1234', 'Ramesh', c.id, 'En Route', 12.9716, 77.5946, 20, 5000, 1200, 'Ward 1', now()
FROM public.contractors c WHERE c.contractor_code = 'C001';

INSERT INTO public.trucks (truck_code, vehicle_number, driver_name, contractor_id, status, latitude, longitude, speed, capacity_kg, current_load_kg, assigned_ward, last_update)
SELECT 
  'TRK-002', 'KA-01-CD-5678', 'Suresh', c.id, 'Loading', 12.9815, 77.6094, 0, 5000, 3500, 'Ward 2', now()
FROM public.contractors c WHERE c.contractor_code = 'C001';

INSERT INTO public.trucks (truck_code, vehicle_number, driver_name, contractor_id, status, latitude, longitude, speed, capacity_kg, current_load_kg, assigned_ward, last_update)
SELECT 
  'TRK-003', 'KA-02-EF-9012', 'Mahesh', c.id, 'Returning', 12.9352, 77.6245, 35, 4500, 4200, 'Ward 3', now()
FROM public.contractors c WHERE c.contractor_code = 'C002';

INSERT INTO public.trucks (truck_code, vehicle_number, driver_name, contractor_id, status, latitude, longitude, speed, capacity_kg, current_load_kg, assigned_ward, last_update)
SELECT 
  'TRK-004', 'KA-02-GH-3456', 'Ganesh', c.id, 'En Route', 12.9344, 77.6128, 25, 5000, 800, 'Ward 4', now()
FROM public.contractors c WHERE c.contractor_code = 'C002';

INSERT INTO public.trucks (truck_code, vehicle_number, driver_name, contractor_id, status, latitude, longitude, speed, capacity_kg, current_load_kg, assigned_ward, last_update)
SELECT 
  'TRK-005', 'KA-03-IJ-7890', 'Naresh', c.id, 'Idle', 12.9141, 77.6410, 0, 4000, 0, 'Ward 5', now()
FROM public.contractors c WHERE c.contractor_code = 'C003';

INSERT INTO public.trucks (truck_code, vehicle_number, driver_name, contractor_id, status, latitude, longitude, speed, capacity_kg, current_load_kg, assigned_ward, last_update)
SELECT 
  'TRK-006', 'KA-04-KL-1234', 'Dinesh', c.id, 'En Route', 12.9698, 77.7500, 30, 5500, 2100, 'Ward 6', now()
FROM public.contractors c WHERE c.contractor_code = 'C004';

-- SEED DATA: Sample Reports
INSERT INTO public.reports (reporter_name, reporter_email, description, latitude, longitude, address, ward, waste_type, severity, status) VALUES
('Citizen Report 1', 'citizen1@email.com', 'Overflowing bin near bus stop causing bad odor', 12.9716, 77.5946, 'MG Road Bus Stop', 'Ward 1', 'Mixed', 'High', 'Pending'),
('Citizen Report 2', 'citizen2@email.com', 'Illegal dumping of construction waste', 12.9352, 77.6245, 'Koramangala 5th Block Empty Plot', 'Ward 3', 'Hazardous', 'Critical', 'In Progress'),
('Citizen Report 3', 'citizen3@email.com', 'Bin not collected for 3 days', 12.9141, 77.6410, 'HSR Layout Sector 2 Main Road', 'Ward 5', 'Wet', 'Medium', 'Pending');

-- SEED DATA: Sample Waste Pickup Tasks for today and past week
INSERT INTO public.waste_pickup_tasks (task_code, ward, zone, locality, contractor_id, scheduled_date, scheduled_time, status, waste_type, quantity_kg, completed_time, remarks)
SELECT 
  'TASK-' || to_char(CURRENT_DATE, 'YYYY-MM-DD') || '-001',
  'Ward 1', 'Central Zone', 'MG Road', c.id, CURRENT_DATE, '08:00', 'Completed', 'Dry', 350, '08:45', NULL
FROM public.contractors c WHERE c.contractor_code = 'C001';

INSERT INTO public.waste_pickup_tasks (task_code, ward, zone, locality, contractor_id, scheduled_date, scheduled_time, status, waste_type, quantity_kg)
SELECT 
  'TASK-' || to_char(CURRENT_DATE, 'YYYY-MM-DD') || '-002',
  'Ward 2', 'East Zone', 'Indiranagar', c.id, CURRENT_DATE, '09:00', 'Pending', 'Wet', 0
FROM public.contractors c WHERE c.contractor_code = 'C001';

INSERT INTO public.waste_pickup_tasks (task_code, ward, zone, locality, contractor_id, scheduled_date, scheduled_time, status, waste_type, quantity_kg, remarks)
SELECT 
  'TASK-' || to_char(CURRENT_DATE, 'YYYY-MM-DD') || '-003',
  'Ward 3', 'South Zone', 'Koramangala', c.id, CURRENT_DATE, '07:30', 'Delayed', 'Mixed', 200, 'Traffic congestion'
FROM public.contractors c WHERE c.contractor_code = 'C002';

INSERT INTO public.waste_pickup_tasks (task_code, ward, zone, locality, contractor_id, scheduled_date, scheduled_time, status, waste_type, quantity_kg, remarks)
SELECT 
  'TASK-' || to_char(CURRENT_DATE, 'YYYY-MM-DD') || '-004',
  'Ward 5', 'East Zone', 'HSR Layout', c.id, CURRENT_DATE, '06:30', 'No-Show', 'Dry', 0, 'Vehicle breakdown'
FROM public.contractors c WHERE c.contractor_code = 'C003';