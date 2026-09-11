import React from 'react';
import { BalcaoPanel } from '../balcao/BalcaoPanel';

// KitchenPanel alias pointing to BalcaoPanel for backward compatibility
export const KitchenPanel: React.FC = () => {
  return <BalcaoPanel />;
};
