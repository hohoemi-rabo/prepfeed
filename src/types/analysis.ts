// AI Analysis Types

import type { Platform, AnalysisType, JobStatus } from './common';

export interface SimpleAnalysisResult {
  trend_score: number;
  summary: string;
  top_contents: Array<{
    id: string;
    title: string;
    reason: string;
  }>;
  keywords: string[];
  generated_at: string;
}

export interface DetailedAnalysisResult {
  trend_analysis: {
    summary: string;
    rising_topics: Array<{
      topic: string;
      growth: string;
      platforms: Platform[];
    }>;
    declining_topics: Array<{
      topic: string;
      decline: string;
    }>;
  };
  content_ideas: Array<{
    title: string;
    reason: string;
    platform_recommendation: Platform;
    estimated_potential: string;
  }>;
  competitor_analysis: {
    top_performers: Array<{
      name: string;
      platform: Platform;
      stats: string;
    }>;
    posting_patterns: string;
    common_tags: string[];
  };
  recommendations: string[];
  generated_at: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  setting_id?: string;
  analysis_type: AnalysisType;
  status: JobStatus;
  result?: SimpleAnalysisResult | DetailedAnalysisResult;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface AnalysisJob {
  id: string;
  user_id: string;
  analysis_id: string;
  job_type: AnalysisType;
  status: JobStatus;
  priority: number;
  payload: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}
