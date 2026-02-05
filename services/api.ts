
import { InitialDataResponse } from '../types.ts';

const API_URL = 'https://script.google.com/macros/s/AKfycbzkVbJZs4PLMe01oIhcFGnrvEruksyzkQkjKP04Rs8278Od8702LvWkLbBgWuMbxfeVXg/exec';

export const getInitialData = async (): Promise<InitialDataResponse> => {
  const response = await fetch(`${API_URL}?action=getInitialData`);
  if (!response.ok) {
    throw new Error('Failed to fetch initial data');
  }
  return response.json();
};

export const submitEvaluation = async (payload: any): Promise<void> => {
  await fetch(API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'submitEvaluation',
      ...payload
    }),
  });
};
