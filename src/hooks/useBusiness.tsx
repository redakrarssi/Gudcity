import { useContext } from 'react';
import { useBusinessContext } from '../contexts/BusinessContext';

export const useBusiness = () => {
  return useBusinessContext();
}; 