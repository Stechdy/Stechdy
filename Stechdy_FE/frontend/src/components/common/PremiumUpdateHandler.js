import React from 'react';
import usePremiumUpdates from '../../hooks/usePremiumUpdates';

/**
 * Component to handle real-time premium status updates
 * This component uses the socket connection to listen for premium activation events
 * and shows appropriate notifications to the user
 */
const PremiumUpdateHandler = ({ children }) => {
  // Initialize premium updates listener
  usePremiumUpdates();

  return <>{children}</>;
};

export default PremiumUpdateHandler;
