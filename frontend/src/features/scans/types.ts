/**
 * Scan-related types
 */

export interface Project {
  domain_id?: number;
  domain: string;
  title: string;
  description: string;
  lastScanDate?: Date;
}

export interface ScanSummary {
  scanid: number;
  date: Date;
  target_url: string;
  user_id: number;
  scan_type: string;
  total_risk_score?: number | null;
  overall_risk_level?: string | null;
  critical_alert_count?: number | null;
  high_risk_count?: number | null;
  medium_risk_count?: number | null;
  low_risk_count?: number | null;
}

export interface PagedResponse<T> {
  total: number;
  page: number;
  size: number;
  result: T[];
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

// Raw ZAP alert as emitted by the backend stream
export interface ZapAlert {
  name: string;
  risk: "High" | "Medium" | "Low" | "Informational";
  description: string;
  solution?: string;
  cweid?: string;
  url?: string;
  confidence?: string;
  evidence?: string;
  // Additional verbose fields present in DB-stored alerts
  nodeName?: string;
  method?: string;
  riskdesc?: string;
  reference?: string;
  alert?: string;
  id?: string;
  pluginid?: string;
}

export type ScanStreamEvent =
  | { type: "progress"; progress: string }
  | { type: "alert"; alert: ZapAlert }
  | { type: "done"; total: number }
  | { type: "error"; message: string };

export interface ScanStatus {
  running: boolean;
  status: "idle" | "spidering" | "scanning" | "done" | "error";
  zap_scan_id?: string;
  progress?: number;
  url?: string;
  scan_id?: number;
}

// AI Chat types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AIChatStreamEvent =
  | { type: "token"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type SummaryType = "technical" | "non-technical";

export interface RiskMetric {
  date: string;
  risk_score: number | null;
  risk_label: string | null;
}

export type ScanDetail = ScanSummary;
export interface AISummaryResponse {
  scan_id: number;
  summary_type: string;
  content: string;
  created_at: string;
}
