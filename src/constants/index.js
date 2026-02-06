
export const GEOLOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 10000, 
  maximumAge: 0, 
  watchInterval: 5000 
}

export const CHECK_IN_STATUS = {
  IDLE: 'idle',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out'
}

export const EVENT_TYPES = {
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out'
}

export const MAP_CONFIG = {
  defaultCenter: {
    lat: 51.1694,
    lng: 71.4491
  },
  defaultZoom: 15,
  maxZoom: 19,
  minZoom: 10,
  tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors'
}

export const LEAFLET_ICONS = {
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
}

export const WORK_ZONE_RADIUS = {
  DEFAULT: 100,
  MIN: 50,
  MAX: 500
}
export const TIMEOUTS = {
  DEBOUNCE_BUTTON: 1000, 
  AUTO_CLOSE_DIALOG: 3000,
  NOTIFICATION_DURATION: 3000,
  API_TIMEOUT: 10000
}

export const ERROR_MESSAGES = {
  GEO_PERMISSION_DENIED: 'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера',
  GEO_POSITION_UNAVAILABLE: 'Информация о местоположении недоступна.',
  GEO_TIMEOUT: 'Превышено время ожидания определения местоположения.',
  GEO_NOT_SUPPORTED: 'Ваш браузер не поддерживает геолокацию.',
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
  ALREADY_CHECKED_IN: 'Вы уже зарегистрированы на работе.',
  NOT_CHECKED_IN: 'Вы не зарегистрированы на работе.',
  OUT_OF_ZONE: 'Вы находитесь вне рабочей зоны.',
  API_ERROR: 'Произошла ошибка при обработке запроса.'
}

export const SUCCESS_MESSAGES = {
  CHECK_IN: 'Вход зарегистрирован',
  CHECK_OUT: 'Выход зарегистрирован',
  DATA_SAVED: 'Данные сохранены',
  LOCATION_UPDATED: 'Местоположение обновлено'
}
export const DATE_FORMATS = {
  FULL_DATETIME: {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  },
  SHORT_DATE: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  },
  TIME_ONLY: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  },
  SHORT_TIME: {
    hour: '2-digit',
    minute: '2-digit'
  }
}

export const LOCALE = 'ru-RU'

export const API_ENDPOINTS = {
  CHECK_IN: '/api/checkin',
  CHECK_OUT: '/api/checkout',
  STATUS: '/api/status',
  HISTORY: '/api/history',
  LOCATIONS: '/api/locations'
}

export const DEFAULT_SETTINGS = {
  showCoordinates: false,
  highAccuracy: true,
  notifications: true,
  autoCenter: true,
  showAccuracyCircle: true,
  gracePeriod: 0 
}
export const UI_COLORS = {
  PRIMARY: '#1976D2',
  SUCCESS: '#21BA45',
  ERROR: '#C10015',
  WARNING: '#F2C037',
  INFO: '#31CCEC',
  USER_MARKER: '#4285f4',
  WORK_ZONE: '#34a853'
}

export const LIMITS = {
  MAX_HISTORY_ITEMS: 100,
  MAX_LOCATIONS: 50,
  MIN_ACCURACY: 100, 
  MAX_ACCURACY: 1000 
}

export const FEATURES = {
  OFFLINE_MODE: false,
  PUSH_NOTIFICATIONS: false,
  BIOMETRIC_AUTH: false,
  MULTI_LANGUAGE: false,
  DARK_MODE: false,
  EXPORT_REPORTS: false
}

export const APP_VERSION = '1.0.0'
export const APP_NAME = 'WebCheckIn'
export const APP_DESCRIPTION = 'Система геолокационной регистрации рабочего времени'

export const USER_ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin'
}

export const PERMISSIONS = {
  VIEW_OWN_DATA: 'view_own_data',
  VIEW_ALL_DATA: 'view_all_data',
  MANAGE_LOCATIONS: 'manage_locations',
  MANAGE_USERS: 'manage_users',
  EXPORT_DATA: 'export_data'
}

export const CITIES = {
  ASTANA: {
    name: 'Астана',
    country: 'Казахстан',
    center: { lat: 51.1694, lng: 71.4491 },
    timezone: 'Asia/Almaty'
  },
  ALMATY: {
    name: 'Алматы',
    country: 'Казахстан',
    center: { lat: 43.2220, lng: 76.8512 },
    timezone: 'Asia/Almaty'
  }
}
export const PATTERNS = {
  LATITUDE: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
  LONGITUDE: /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

export default {
  GEOLOCATION_CONFIG,
  CHECK_IN_STATUS,
  EVENT_TYPES,
  MAP_CONFIG,
  LEAFLET_ICONS,
  WORK_ZONE_RADIUS,
  TIMEOUTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  LOCALE,
  API_ENDPOINTS,
  DEFAULT_SETTINGS,
  UI_COLORS,
  LIMITS,
  FEATURES,
  APP_VERSION,
  APP_NAME,
  APP_DESCRIPTION,
  USER_ROLES,
  PERMISSIONS,
  CITIES,
  PATTERNS
}