// Monitor Settings Types

import type { Platform, MonitorType, FetchCount, FetchLogStatus } from './common';

export interface MonitorSetting {
  id: string;
  user_id: string;
  platform: Platform;
  type: MonitorType;
  value: string;
  display_name?: string;
  fetch_count: FetchCount;
  is_active: boolean;
  last_fetched_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMonitorSettingRequest {
  platform: Platform;
  type: MonitorType;
  value: string;
  display_name?: string;
  fetch_count?: FetchCount;
}

export interface UpdateMonitorSettingRequest {
  display_name?: string;
  fetch_count?: FetchCount;
  is_active?: boolean;
}

export interface FetchLog {
  id: string;
  user_id: string;
  setting_id: string;
  platform: Platform;
  status: FetchLogStatus;
  records_count?: number;
  error_message?: string;
  executed_at: string;
}
