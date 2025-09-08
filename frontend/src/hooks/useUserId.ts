import { useEffect, useState } from 'react';

/**
 * A hook to manage an anonymous user ID in localStorage.
 * If a user ID doesn't exist, it creates a new one and saves it.
 * 
 * @returns {string | null} The user's anonymous ID.
 */
const useUserId = (): string | null => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const existingUserId = localStorage.getItem('movesmart_user_id');
    
    if (existingUserId) {
      setUserId(existingUserId);
    } else {
      const newUserId = crypto.randomUUID();
      localStorage.setItem('movesmart_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  return userId;
};

export default useUserId;
