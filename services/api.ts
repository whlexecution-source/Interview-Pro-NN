
import { InitialDataResponse } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycby8Sct6bQeE8AvjbK3OgR9zPzenO5-AV9oLRKukfCqgBeBXV1dOpz7EcSfD52wF1d_mYA/exec';

export const getInitialData = async (): Promise<InitialDataResponse> => {
  const response = await fetch(`${API_URL}?action=getInitialData`);
  if (!response.ok) {
    throw new Error('Failed to fetch initial data');
  }
  return response.json();
};

export const submitEvaluation = async (payload: any): Promise<void> => {
  // Using no-cors as requested for simple GAS integration
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
