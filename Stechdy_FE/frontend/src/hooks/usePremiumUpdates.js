import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

/**
 * Custom hook to handle real-time premium status updates
 * Shows a success popup when premium is activated by admin
 */
const usePremiumUpdates = () => {
  const { onPremiumUpdate, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Register callback for premium updates
    onPremiumUpdate((data) => {
      // Update localStorage with new premium status
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.premiumStatus = data.premiumStatus;
          user.premiumExpiryDate = data.premiumExpiryDate;
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error updating user in localStorage:', error);
        }
      }

      // Show success toast notification
      toast.success(
        <div>
          <strong>🎉 Premium Activated!</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Your <strong>{data.planName}</strong> subscription is now active!
            <br />
            Valid until: {new Date(data.premiumExpiryDate).toLocaleDateString('vi-VN')}
          </p>
        </div>,
        {
          position: 'top-center',
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)'
          }
        }
      );

      // Reload the page after 2 seconds to refresh all premium-related UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });
  }, [isConnected, onPremiumUpdate]);
};

export default usePremiumUpdates;
