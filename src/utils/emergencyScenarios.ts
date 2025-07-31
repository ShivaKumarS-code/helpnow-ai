// will be replaced after model integration

export interface EmergencyStep {
  id: number;
  instruction: string;
  type: 'warning' | 'action' | 'info';
}

export interface EmergencyScenario {
  id: string;
  title: string;
  steps: EmergencyStep[];
}

export const emergencyScenarios: EmergencyScenario[] = [
  {
    id: 'choking',
    title: 'Choking Emergency',
    steps: [
      {
        id: 1,
        instruction: "If the person can cough, speak, or breathe, encourage them to keep coughing to clear the blockage.",
        type: 'info'
      },
      {
        id: 2,
        instruction: "If they cannot breathe, cough, or speak, stand behind them and place your arms around their waist.",
        type: 'action'
      },
      {
        id: 3,
        instruction: "Make a fist with one hand and place it just above their navel, thumb side against the abdomen.",
        type: 'action'
      },
      {
        id: 4,
        instruction: "Grasp your fist with your other hand and give quick upward thrusts into the abdomen.",
        type: 'action'
      },
      {
        id: 5,
        instruction: "Continue until the object is expelled or the person becomes unconscious. Call 911 immediately if unsuccessful.",
        type: 'warning'
      }
    ]
  },
  {
    id: 'cuts',
    title: 'Severe Bleeding',
    steps: [
      {
        id: 1,
        instruction: "Apply direct pressure to the wound with a clean cloth or bandage.",
        type: 'action'
      },
      {
        id: 2,
        instruction: "If blood soaks through, add more layers without removing the first cloth.",
        type: 'warning'
      },
      {
        id: 3,
        instruction: "Elevate the injured area above heart level if possible.",
        type: 'action'
      },
      {
        id: 4,
        instruction: "If bleeding doesn't stop, apply pressure to pressure points between the wound and the heart.",
        type: 'action'
      },
      {
        id: 5,
        instruction: "Call 911 immediately for severe bleeding that won't stop.",
        type: 'warning'
      }
    ]
  },
  {
    id: 'burns',
    title: 'Burn Treatment',
    steps: [
      {
        id: 1,
        instruction: "Remove the person from the source of the burn and ensure the area is safe.",
        type: 'warning'
      },
      {
        id: 2,
        instruction: "Cool the burn with cool (not cold) running water for 10-20 minutes.",
        type: 'action'
      },
      {
        id: 3,
        instruction: "Remove jewelry and loose clothing from the burned area before swelling begins.",
        type: 'action'
      },
      {
        id: 4,
        instruction: "Cover the burn with a sterile, non-adhesive bandage or clean cloth.",
        type: 'action'
      },
      {
        id: 5,
        instruction: "Seek immediate medical attention for burns larger than 3 inches or on face, hands, feet, or genitals.",
        type: 'warning'
      }
    ]
  }
];

export const getRandomScenario = (): EmergencyScenario => {
  const randomIndex = Math.floor(Math.random() * emergencyScenarios.length);
  return emergencyScenarios[randomIndex];
};