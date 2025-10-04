// Development environment configuration
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  curriculumApiUrl: 'http://localhost:3000/api/v1/curriculum',
  contentApiUrl: 'http://localhost:3000/api/v1/content',
  swaggerUrl: 'http://localhost:3000/api/v1/docs',

  // Feature flags
  features: {
    enableOfflineMode: true,
    enableAnalytics: true,
    enablePushNotifications: false,
  },

  // API timeouts (in milliseconds)
  timeouts: {
    default: 30000,
    upload: 60000,
    download: 45000,
  },
};
