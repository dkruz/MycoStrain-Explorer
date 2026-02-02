/**
 * MycoStrain Analytics Service
 * Tracks researcher behavior to help prioritize field-based citizen science.
 */

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

export const trackSearch = (species: string, focusArea: string) => {
  trackEvent('myco_search', {
    species_name: species,
    focus_area: focusArea,
    timestamp: new Date().toISOString()
  });
};

export const trackProtocolView = () => {
  trackEvent('view_protocol_guide', { version: '4.2.0' });
};

export const trackProtocolExport = (format: string) => {
  trackEvent('export_protocol', { format, version: '4.2.0' });
};
