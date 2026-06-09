export const API_CONSTANTS = {
  APP_VERSION: '1.0.0',
  BASE_URL: 'http://192.168.10.100:4444/api/v1',
  // BASE_URL: 'https://axzycheckresdapi-production.up.railway.app/api/v1',
  ROUND_COOLDOWN_MINUTES: 0,
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51Oo9x0J46V6Ym5Xx7cjwDGBO6QibtCiYrvSG30BxK62zNvmrQZxjPJSbitfeywKvmH7dZNFLlGIANYpMSFOTZm7Y00rQOVvcze',
  URLS: {
    AUTH: {
      LOGIN: '/users/login',
      LOGOUT: '/users/logout',
    },
    ROUNDS: {
      START: '/rounds/start',
      END: '/rounds/end',
      CURRENT: '/rounds/current',
      ALL: '/rounds',
    },
  },
};
