// Simple dictionary for localized error messages
const ErrorDictionary = {
  NETWORK_ERROR: {
    ua: 'Проблема зі з\'єднанням. Будь ласка, перевірте підключення до інтернету.',
    en: 'Connection issue. Please check your internet connection.',
  },
  VALIDATION_ERROR: {
    ua: 'Дані введено некоректно. Перевірте форму та спробуйте ще раз.',
    en: 'Invalid data entered. Please check the form and try again.',
  },
  AUTH_ERROR: {
    ua: 'Помилка авторизації. Ваша сесія могла закінчитися, увійдіть знову.',
    en: 'Authorization error. Your session might have expired, please log in again.',
  },
  GENERIC_ERROR: {
    ua: 'Виникла непередбачувана помилка. Ми вже працюємо над її вирішенням.',
    en: 'An unexpected error occurred. We are working on fixing it.',
  },
};

const getLocale = () => {
  const customLang = localStorage.getItem('APP_LANG');
  if (customLang === 'ua' || customLang === 'en') {return customLang;}
  return navigator.language.startsWith('uk') || navigator.language.startsWith('ru') ? 'ua' : 'en';
};

export const getLocalizedErrorMessage = (errorCode) => {
  const lang = getLocale();
  const translations = ErrorDictionary[errorCode] || ErrorDictionary.GENERIC_ERROR;
  return translations[lang];
};

export const getUiText = (key) => {
  const lang = getLocale();
  const dict = {
    errorBoundaryTitle: { ua: 'Ой! Щось пішло не так.', en: 'Oops! Something went wrong.' },
    errorBoundaryDesc: { ua: 'Ми знайшли проблему і вже її залогували. Спробуйте оновити сторінку або повернутися на головну.', en: 'We found an issue and have logged it. Try refreshing the page or navigating to home.' },
    errorIdLabel: { ua: 'Код помилки для підтримки:', en: 'Error ID for support:' },
    reloadButton: { ua: 'Оновити сторінку', en: 'Reload Page' },
    reportButton: { ua: 'Повідомити про проблему', en: 'Report Problem' },
  };
  return dict[key]?.[lang] || key;
};
