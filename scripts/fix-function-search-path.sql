-- Fix Function Search Path Security Warnings
-- This script corrects the search_path parameter for functions to improve security

-- Drop and recreate the update_updated_at_column function with secure search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Drop and recreate the update_deal_activities_updated_at function with secure search_path
DROP FUNCTION IF EXISTS public.update_deal_activities_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_deal_activities_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the deal's updated_at when activities are modified
    UPDATE public.deals 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate triggers that use these functions
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_deals_updated_at ON public.deals;
DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS update_deal_activities_trigger ON public.activities;

-- Recreate all triggers with the corrected functions
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update deal's updated_at when activities are modified
CREATE TRIGGER update_deal_activities_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_deal_activities_updated_at();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_deal_activities_updated_at() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Securely updates the updated_at column with fixed search_path';
COMMENT ON FUNCTION public.update_deal_activities_updated_at() IS 'Securely updates deal updated_at when activities change with fixed search_path';
