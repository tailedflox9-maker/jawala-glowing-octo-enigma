import { supabase } from './supabaseClient';

// ============================================
// Types
// ============================================

export interface UserTrackingData {
  id?: string;
  user_name: string;
  device_id: string;
  first_visit_at?: string;
  last_visit_at?: string;
  total_visits?: number;
  user_agent?: string;
}

export interface VisitLog {
  id?: string;
  device_id: string;
  user_name?: string;
  visited_at?: string;
  page_path?: string;
  referrer?: string;
}

export interface AnalyticsSummary {
  total_unique_users: number;
  total_visits: number;
  last_updated: string;
}

// ============================================
// Device ID Management (localStorage)
// ============================================

const DEVICE_ID_KEY = 'jawala_device_id';
const USER_NAME_KEY = 'jawala_user_name';

export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Generate unique device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

export const getUserName = (): string | null => {
  return localStorage.getItem(USER_NAME_KEY);
};

export const setUserName = (name: string): void => {
  localStorage.setItem(USER_NAME_KEY, name);
};

export const hasUserName = (): boolean => {
  return !!getUserName();
};

// ============================================
// Tracking Functions
// ============================================

export const trackUserVisit = async (userName: string): Promise<void> => {
  try {
    const deviceId = getDeviceId();
    const userAgent = navigator.userAgent;
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_tracking')
      .select('*')
      .eq('device_id', deviceId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
    }
    
    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('user_tracking')
        .update({
          user_name: userName,
          last_visit_at: new Date().toISOString(),
          total_visits: (existingUser.total_visits || 0) + 1,
        })
        .eq('device_id', deviceId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
      }
    } else {
      // Create new user
      const { error: insertError } = await supabase
        .from('user_tracking')
        .insert([{
          user_name: userName,
          device_id: deviceId,
          user_agent: userAgent,
          total_visits: 1,
        }]);
      
      if (insertError) {
        console.error('Error creating user:', insertError);
      }
    }
    
    // Log the visit
    await logVisit(deviceId, userName);
    
    // Save to localStorage
    setUserName(userName);
    
  } catch (error) {
    console.error('Error tracking user visit:', error);
  }
};

export const logVisit = async (deviceId: string, userName?: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('visit_logs')
      .insert([{
        device_id: deviceId,
        user_name: userName || getUserName(),
        page_path: window.location.pathname,
        referrer: document.referrer || null,
      }]);
    
    if (error) {
      console.error('Error logging visit:', error);
    }
  } catch (error) {
    console.error('Error in logVisit:', error);
  }
};

// ============================================
// Analytics Functions
// ============================================

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary | null> => {
  try {
    const { data, error } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAnalyticsSummary:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserTrackingData[]> => {
  try {
    const { data, error } = await supabase
      .from('user_tracking')
      .select('*')
      .order('last_visit_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

export const getRecentVisits = async (limit: number = 50): Promise<VisitLog[]> => {
  try {
    const { data, error } = await supabase
      .from('visit_logs')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getRecentVisits:', error);
    return [];
  }
};

// ============================================
// Initialization
// ============================================

export const initializeTracking = async (): Promise<void> => {
  try {
    const deviceId = getDeviceId();
    const userName = getUserName();
    
    if (userName) {
      // User already has a name, just log the visit
      await logVisit(deviceId, userName);
      
      // Update last visit time
      await supabase
        .from('user_tracking')
        .update({
          last_visit_at: new Date().toISOString(),
          total_visits: supabase.rpc('increment_visits', { device_id: deviceId })
        })
        .eq('device_id', deviceId);
    }
    // If no userName, the popup will handle first-time tracking
    
  } catch (error) {
    console.error('Error initializing tracking:', error);
  }
};

// SQL function to increment visits (add this to your Supabase SQL editor):
/*
CREATE OR REPLACE FUNCTION increment_visits(device_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_visits INTEGER;
BEGIN
  SELECT total_visits INTO current_visits 
  FROM user_tracking 
  WHERE user_tracking.device_id = increment_visits.device_id;
  
  RETURN COALESCE(current_visits, 0) + 1;
END;
$$ LANGUAGE plpgsql;
*/
