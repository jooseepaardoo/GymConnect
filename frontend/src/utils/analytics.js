import { getAnalytics, logEvent } from 'firebase/analytics';
import { analytics } from '../firebase/config';

export const trackEvent = (eventName, eventParams = {}) => {
  try {
    logEvent(analytics, eventName, {
      timestamp: new Date().toISOString(),
      ...eventParams,
    });
  } catch (error) {
    console.error('Error al registrar evento:', error);
  }
};

export const trackUserAction = (userId, action, params = {}) => {
  trackEvent(action, {
    userId,
    ...params,
  });
};

export const trackError = (error, context = {}) => {
  trackEvent('error', {
    error_message: error.message,
    error_code: error.code,
    error_stack: error.stack,
    ...context,
  });
};

export const trackPageView = (pageName, params = {}) => {
  trackEvent('page_view', {
    page_name: pageName,
    ...params,
  });
};

export const trackMatch = (userId1, userId2) => {
  trackEvent('match_created', {
    user1_id: userId1,
    user2_id: userId2,
    timestamp: new Date().toISOString(),
  });
};

export const trackMessageSent = (conversationId, senderId) => {
  trackEvent('message_sent', {
    conversation_id: conversationId,
    sender_id: senderId,
  });
};

export const trackProfileUpdate = (userId, updatedFields) => {
  trackEvent('profile_updated', {
    user_id: userId,
    updated_fields: Object.keys(updatedFields),
  });
};

export const trackSearch = (userId, searchParams) => {
  trackEvent('search_performed', {
    user_id: userId,
    search_params: searchParams,
  });
};

export const trackFeatureUsage = (featureName, userId) => {
  trackEvent('feature_used', {
    feature_name: featureName,
    user_id: userId,
  });
};

export const initializeAnalytics = (user) => {
  if (user) {
    trackEvent('user_login', {
      user_id: user.uid,
      login_method: user.providerData[0]?.providerId || 'unknown',
    });
  }
};