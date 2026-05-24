import { useState, useEffect, useCallback, useRef } from 'react';
import pb from '@/lib/pocketbaseClient';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const debounceRef = useRef({});

  const fetchUnreadNotifications = useCallback(async (userId, circleId) => {
    if (!userId) return;
    
    try {
      let filter = `recipient_id="${userId}" && is_read=false`;
      if (circleId) {
        filter += ` && circle_id="${circleId}"`;
      }

      const records = await pb.collection('notifications').getList(1, 50, {
        filter,
        sort: '-created',
        $autoCancel: false
      });

      setNotifications(records.items);
      setUnreadCount(records.items.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  const createNotification = useCallback(async (data) => {
    // Debounce to prevent duplicate notifications for the same action
    const debounceKey = `${data.recipient_id}_${data.type}_${data.round_id}`;
    const now = Date.now();
    
    if (debounceRef.current[debounceKey] && (now - debounceRef.current[debounceKey] < 5000)) {
      return null; // Skip if created within last 5 seconds
    }
    
    debounceRef.current[debounceKey] = now;

    try {
      const record = await pb.collection('notifications').create({
        ...data,
        is_read: false
      }, { $autoCancel: false });
      return record;
    } catch (error) {
      console.error("Failed to create notification:", error);
      return null;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await pb.collection('notifications').update(notificationId, {
        is_read: true,
        read_at: new Date().toISOString()
      }, { $autoCancel: false });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async (userId, circleId) => {
    if (!userId || notifications.length === 0) return;

    try {
      // Update all unread notifications in state immediately for UI responsiveness
      const unreadIds = notifications.map(n => n.id);
      setNotifications([]);
      setUnreadCount(0);

      // Process updates in background
      await Promise.all(
        unreadIds.map(id => 
          pb.collection('notifications').update(id, {
            is_read: true,
            read_at: new Date().toISOString()
          }, { $autoCancel: false }).catch(e => console.error(`Failed to update ${id}:`, e))
        )
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [notifications]);

  const subscribeToNotifications = useCallback((userId, callback) => {
    if (!userId) return () => {};

    const handleRealtimeEvent = (e) => {
      if (e.action === 'create' && e.record.recipient_id === userId && !e.record.is_read) {
        setNotifications(prev => [e.record, ...prev]);
        setUnreadCount(prev => prev + 1);
        if (callback) callback(e.record);
      } else if (e.action === 'update' && e.record.recipient_id === userId && e.record.is_read) {
        setNotifications(prev => prev.filter(n => n.id !== e.record.id));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    pb.collection('notifications').subscribe('*', handleRealtimeEvent, { $autoCancel: false })
      .catch(err => console.error("Notification subscription failed:", err));

    return () => {
      pb.collection('notifications').unsubscribe('*');
    };
  }, []);

  return {
    notifications,
    unreadCount,
    fetchUnreadNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications
  };
}