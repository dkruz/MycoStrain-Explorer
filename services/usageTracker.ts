/**
 * Gemini Usage Tracker & UI Widget
 * Tracks Session, Daily, and Weekly token usage including "Thinking" tokens.
 */

export interface UsageStats {
  session: { tokens: number; thoughtTokens: number; calls: number };
  day: { tokens: number; thoughtTokens: number; calls: number; date: string };
  week: { tokens: number; thoughtTokens: number; calls: number; timestamp: number };
  widget: { tokens: number; thoughtTokens: number; calls: number };
}

export const UsageTracker = {
  // 1. Storage Logic
  getStats: (): UsageStats => {
    const now = new Date();
    const defaults: UsageStats = {
      session: { tokens: 0, thoughtTokens: 0, calls: 0 },
      day: { tokens: 0, thoughtTokens: 0, calls: 0, date: now.toDateString() },
      week: { tokens: 0, thoughtTokens: 0, calls: 0, timestamp: Date.now() },
      widget: { tokens: 0, thoughtTokens: 0, calls: 0 }
    };
    
    const saved = localStorage.getItem('gemini_usage_stats');
    if (!saved) return defaults;

    try {
      const parsed = JSON.parse(saved);
      const stats: UsageStats = {
        session: { ...defaults.session, ...parsed.session },
        day: { ...defaults.day, ...parsed.day },
        week: { ...defaults.week, ...parsed.week },
        widget: { ...defaults.widget, ...parsed.widget }
      };

      // Reset Day if date changed since last save
      if (stats.day.date !== now.toDateString()) {
        stats.day = { ...defaults.day };
      }

      // Reset Week if > 7 days since last reset
      if (Date.now() - stats.week.timestamp > 604800000) {
        stats.week = { ...defaults.week };
      }

      return stats;
    } catch (e) {
      return defaults;
    }
  },

  saveStats: (stats: UsageStats) => {
    localStorage.setItem('gemini_usage_stats', JSON.stringify(stats));
    UsageTracker.updateUI();
  },

  // 2. The Tracker Function
  recordUsage: (metadata: any, isWidgetCall = false) => {
    if (!metadata) return;
    
    let stats = UsageTracker.getStats();
    
    // Explicitly sum all token types to ensure "Thinking Tokens" are captured
    const promptTokens = metadata.promptTokenCount || 0;
    const candidateTokens = metadata.candidatesTokenCount || 0;
    const thoughtTokens = metadata.thoughtsTokenCount || metadata.thoughtTokenCount || 0; 
    
    const totalTokens = metadata.totalTokenCount || (promptTokens + candidateTokens + thoughtTokens);

    // Update counts
    const update = (obj: { tokens: number; thoughtTokens: number; calls: number }) => {
      obj.tokens += totalTokens;
      obj.thoughtTokens += thoughtTokens;
      obj.calls += 1;
    };

    update(stats.session);
    update(stats.day);
    update(stats.week);
    if (isWidgetCall) update(stats.widget);

    UsageTracker.saveStats(stats);
  },

  // 3. The UI Widget
  render: () => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('gemini-usage-widget')) return;
    
    const div = document.createElement('div');
    div.id = 'gemini-usage-widget';
    div.style.cssText = 'position:fixed; bottom:20px; left:20px; background:#1a1a1a; color:#0f0; padding:12px; border-radius:8px; font-family:monospace; font-size:11px; z-index:9999; border:1px solid #333; box-shadow:0 4px 15px rgba(0,0,0,0.5); pointer-events:none;';
    document.body.appendChild(div);
    UsageTracker.updateUI();
  },

  updateUI: () => {
    if (typeof document === 'undefined') return;
    const s = UsageTracker.getStats();
    const widget = document.getElementById('gemini-usage-widget');
    if (!widget) return;

    const format = (val: number | undefined) => (val || 0).toLocaleString();

    widget.innerHTML = `
        <div style="border-bottom:1px solid #333; margin-bottom:5px; font-weight:bold; color:#aaa;">GEMINI 3.1 MONITOR</div>
        SESSION: ${format(s.session.tokens)} t / ${s.session.calls || 0} c<br>
        TODAY:   ${format(s.day.tokens)} t / ${s.day.calls || 0} c<br>
        WEEKLY:  ${format(s.week.tokens)} t / ${s.week.calls || 0} c<br>
        THINKING: <span style="color:#0af">${format(s.session.thoughtTokens)} t</span>
    `;
  }
};
