export interface EmergencyStep {
  id?: number; // Optional since API might not return this
  instruction: string;
  type: 'warning' | 'action' | 'info';
  visualUrl?: string;        
  alternativeUrls?: string[]; 
}

export interface EmergencyScenario {
  id?: string; // Optional since API might not return this
  title: string;
  steps: EmergencyStep[];
}

// API Response type 
export interface ApiEmergencyResponse {
  title: string;
  steps: Array<{
    instruction: string;
    type: 'warning' | 'action' | 'info';
    visualUrl?: string;
    alternativeUrls?: string[];
  }>;
}