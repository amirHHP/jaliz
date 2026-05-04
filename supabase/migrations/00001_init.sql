-- Enable PostGIS extension for geolocation features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    location_coords GEOGRAPHY(Point, 4326), -- PostGIS Point (Longitude, Latitude)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User_Plants Table
CREATE TABLE public.user_plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plant_name TEXT NOT NULL,
    type TEXT,
    last_watered TIMESTAMP WITH TIME ZONE,
    health_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Marketplace_Listings Table
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Seed', 'Tool', 'Cutting')),
    description TEXT,
    image_url TEXT,
    location_coords GEOGRAPHY(Point, 4326), -- PostGIS Point for Proximity Search
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for proximity search
CREATE INDEX idx_marketplace_location ON public.marketplace_listings USING GIST (location_coords);
