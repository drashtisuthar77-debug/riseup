-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('officer', 'contractor', 'verifier', 'analyst');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  assigned_zone TEXT,
  assigned_wards TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create function to get user's assigned zones
CREATE OR REPLACE FUNCTION public.get_user_zones(_user_id UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(assigned_wards, '{}')
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Officers and Analysts can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'analyst')
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Officers and Analysts can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'officer') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "Allow profile creation during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow role assignment during signup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update bins table RLS to allow contractor updates
CREATE POLICY "Contractors can update bins in their zones"
  ON public.bins
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'contractor') AND
    ward = ANY(public.get_user_zones(auth.uid()))
  );

CREATE POLICY "Officers can update all bins"
  ON public.bins
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'officer'));

-- Update reports table RLS policies
CREATE POLICY "Verifiers can update pending reports"
  ON public.reports
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'verifier') AND
    status = 'Pending'
  );

CREATE POLICY "Officers can update all reports"
  ON public.reports
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'officer'));

-- Update waste_pickup_tasks RLS policies
CREATE POLICY "Contractors can view their assigned tasks"
  ON public.waste_pickup_tasks
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'contractor') AND
    ward = ANY(public.get_user_zones(auth.uid()))
  );

CREATE POLICY "Contractors can update their assigned tasks"
  ON public.waste_pickup_tasks
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'contractor') AND
    ward = ANY(public.get_user_zones(auth.uid()))
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  -- Default role is 'officer' for new users (can be changed by admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'officer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();