import { messages as paragonMessages } from '@openedx/paragon';

import ruMessages from './messages/ru.json';
import kk_KZMessages from './messages/kk_KZ.json';

const appMessages = {
  'ru': ruMessages,
  'kk-kz': kk_KZMessages,
  'kk_KZ': kk_KZMessages,
  // 'en': {} // по умолчанию берутся defaultMessage из кода
};

export default [
  paragonMessages,
  appMessages,
];
