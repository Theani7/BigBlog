// =============================================================================
// ALERT CONFIGURATION
// Define alert rules and thresholds for monitoring
// =============================================================================

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  window: number; // minutes
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
}

export interface AlertChannel {
  type: 'email' | 'webhook' | 'slack';
  enabled: boolean;
  config: Record<string, string>;
}

// =============================================================================
// ALERT RULES
// =============================================================================
export const alertRules: AlertRule[] = [
  // -------------------------------------------------------------------------
  // Error Rate Alerts
  // -------------------------------------------------------------------------
  {
    id: 'error-rate-high',
    name: 'High Error Rate',
    description: 'API error rate exceeds 5% over 5 minutes',
    metric: 'api_error_rate',
    condition: 'gt',
    threshold: 0.05,
    window: 5,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'error-rate-warning',
    name: 'Elevated Error Rate',
    description: 'API error rate exceeds 2% over 10 minutes',
    metric: 'api_error_rate',
    condition: 'gt',
    threshold: 0.02,
    window: 10,
    severity: 'warning',
    enabled: true,
  },
  {
    id: 'client-errors-spike',
    name: 'Client Error Spike',
    description: 'More than 50 client errors in 5 minutes',
    metric: 'client_errors',
    condition: 'gt',
    threshold: 50,
    window: 5,
    severity: 'critical',
    enabled: true,
  },

  // -------------------------------------------------------------------------
  // Performance Alerts
  // -------------------------------------------------------------------------
  {
    id: 'lcp-slow',
    name: 'Slow LCP',
    description: 'LCP p75 exceeds 4000ms',
    metric: 'lcp_p75',
    condition: 'gt',
    threshold: 4000,
    window: 15,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'lcp-needs-improvement',
    name: 'LCP Needs Improvement',
    description: 'LCP p75 exceeds 2500ms',
    metric: 'lcp_p75',
    condition: 'gt',
    threshold: 2500,
    window: 15,
    severity: 'warning',
    enabled: true,
  },
  {
    id: 'cls-high',
    name: 'High CLS',
    description: 'CLS p75 exceeds 0.25',
    metric: 'cls_p75',
    condition: 'gt',
    threshold: 0.25,
    window: 15,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'inp-slow',
    name: 'Slow INP',
    description: 'INP p75 exceeds 500ms',
    metric: 'inp_p75',
    condition: 'gt',
    threshold: 500,
    window: 15,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'ttfb-slow',
    name: 'Slow TTFB',
    description: 'TTFB p75 exceeds 1800ms',
    metric: 'ttfb_p75',
    condition: 'gt',
    threshold: 1800,
    window: 15,
    severity: 'critical',
    enabled: true,
  },

  // -------------------------------------------------------------------------
  // API Latency Alerts
  // -------------------------------------------------------------------------
  {
    id: 'api-latency-high',
    name: 'High API Latency',
    description: 'API endpoint p95 latency exceeds 2000ms',
    metric: 'api_latency_p95',
    condition: 'gt',
    threshold: 2000,
    window: 10,
    severity: 'warning',
    enabled: true,
  },
  {
    id: 'api-latency-critical',
    name: 'Critical API Latency',
    description: 'API endpoint p99 latency exceeds 5000ms',
    metric: 'api_latency_p99',
    condition: 'gt',
    threshold: 5000,
    window: 10,
    severity: 'critical',
    enabled: true,
  },

  // -------------------------------------------------------------------------
  // Traffic Alerts
  // -------------------------------------------------------------------------
  {
    id: 'traffic-drop',
    name: 'Traffic Drop',
    description: 'Hourly traffic drops 50% below daily average',
    metric: 'traffic_hourly_ratio',
    condition: 'lt',
    threshold: 0.5,
    window: 60,
    severity: 'warning',
    enabled: true,
  },
  {
    id: 'traffic-spike',
    name: 'Traffic Spike',
    description: 'Hourly traffic exceeds 3x daily average',
    metric: 'traffic_hourly_ratio',
    condition: 'gt',
    threshold: 3,
    window: 60,
    severity: 'info',
    enabled: true,
  },

  // -------------------------------------------------------------------------
  // Search Alerts
  // -------------------------------------------------------------------------
  {
    id: 'search-no-results-high',
    name: 'High No-Result Rate',
    description: 'Search no-result rate exceeds 30%',
    metric: 'search_no_result_rate',
    condition: 'gt',
    threshold: 0.3,
    window: 60,
    severity: 'warning',
    enabled: true,
  },
];

// =============================================================================
// ALERT CHANNELS
// =============================================================================
export const alertChannels: AlertChannel[] = [
  {
    type: 'email',
    enabled: true,
    config: {
      to: process.env.ALERT_EMAIL || 'admin@bigblog.dev',
    },
  },
  {
    type: 'webhook',
    enabled: false,
    config: {
      url: process.env.ALERT_WEBHOOK_URL || '',
    },
  },
];

// =============================================================================
// ALERT HELPER FUNCTIONS
// =============================================================================

export function evaluateAlert(
  rule: AlertRule,
  value: number
): { triggered: boolean; severity: AlertRule['severity'] } {
  let triggered = false;

  switch (rule.condition) {
    case 'gt':
      triggered = value > rule.threshold;
      break;
    case 'lt':
      triggered = value < rule.threshold;
      break;
    case 'eq':
      triggered = value === rule.threshold;
      break;
    case 'gte':
      triggered = value >= rule.threshold;
      break;
    case 'lte':
      triggered = value <= rule.threshold;
      break;
  }

  return { triggered, severity: rule.severity };
}

export function formatAlertMessage(
  rule: AlertRule,
  value: number,
  context?: Record<string, unknown>
): string {
  const base = `[${rule.severity.toUpperCase()}] ${rule.name}: ${rule.description}`;
  const valueStr = `Current value: ${value} (threshold: ${rule.threshold})`;
  const contextStr = context ? `Context: ${JSON.stringify(context)}` : '';

  return [base, valueStr, contextStr].filter(Boolean).join('\n');
}
