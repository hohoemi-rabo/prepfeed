// Platform & Common Types

export type Platform = 'youtube' | 'qiita' | 'zenn' | 'note';

export type MonitorType = 'keyword' | 'channel' | 'user';

export type FetchCount = 50 | 100 | 200;

export type AnalysisType = 'simple' | 'detailed';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type FetchLogStatus = 'success' | 'error';
