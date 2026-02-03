// User Profile Types

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  google_refresh_token?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}
