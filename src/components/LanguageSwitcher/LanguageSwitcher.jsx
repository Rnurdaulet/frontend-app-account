import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { publish } from '@edx/frontend-platform';
import { getLocale, LOCALE_CHANGED, handleRtl } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import './LanguageSwitcher.scss';

function normalizeLanguages(languages) {
  if (!Array.isArray(languages)) {
    return [];
  }
  return languages.map((item) => {
    if (item.code && item.name) {
      return { code: item.code, name: item.name, released: item.released };
    }
    if (item.value && item.label) {
      return { code: item.value, name: item.label, released: item.released };
    }
    return item;
  });
}

async function patchPreferences(username, code) {
  const processedParams = { 'pref-lang': code };
  await getAuthenticatedHttpClient()
    .patch(`${getConfig().LMS_BASE_URL}/api/user/v1/preferences/${username}`, processedParams, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    });
}

async function postSetLang(code) {
  const formData = new FormData();
  formData.append('language', code);
  const url = `${getConfig().LMS_BASE_URL}/i18n/setlang/`;
  await getAuthenticatedHttpClient().post(url, formData, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
}

const LanguageSwitcher = ({
  languages,
  reloadOnChange = false,
  showUnreleased = true,
  onLanguageApplied,
  buttonSize = 'sm',
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentLocale = getLocale();
  const fallbackLanguages = [
    { code: 'en', name: 'English', released: true },
    { code: 'ru', name: 'Русский', released: true },
    { code: 'kk-kz', name: 'Қазақша', released: true },
  ];
  const normalized = normalizeLanguages(languages && languages.length ? languages : fallbackLanguages);
  const visibleLanguages = useMemo(
    () => normalized.filter((l) => (showUnreleased ? true : (l.released ?? true))),
    [normalized, showUnreleased],
  );

  // Keep original order so items don't change places on selection
  const displayLanguages = visibleLanguages;

  const getShortLabel = (code, name) => {
    if (code === 'en' || name === 'English') return 'Eng';
    if (code === 'ru') return 'Рус';
    if (code === 'kk-kz' || code === 'kk_KZ') return 'Қаз';
    return name || code;
  };

  const handleClick = async (code) => {
    if (isSubmitting || code === currentLocale) {
      return;
    }
    setIsSubmitting(true);
    try {
      const { username } = getAuthenticatedUser();
      await patchPreferences(username, code);
      await postSetLang(code);

      publish(LOCALE_CHANGED, code);
      handleRtl();

      if (typeof onLanguageApplied === 'function') {
        onLanguageApplied(code);
      }

      if (reloadOnChange) {
        // Allow network to settle before reload
        setTimeout(() => {
          window.location.reload();
        }, 50);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!displayLanguages.length) {
    return null;
  }

  return (
    <div className={`language-selector ${className || ''}`} data-testid="language-switcher">
      {displayLanguages.map(({ code, name }) => (
        <span
          key={code}
          role="button"
          tabIndex={0}
          onClick={() => handleClick(code)}
          onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(code); }}
          className={`language-item ${code === currentLocale ? 'active' : ''}`}
          aria-pressed={code === currentLocale}
        >
          {getShortLabel(code, name)}
        </span>
      ))}
    </div>
  );
};

LanguageSwitcher.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.shape({ code: PropTypes.string.isRequired, name: PropTypes.string.isRequired, released: PropTypes.bool }),
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired, released: PropTypes.bool }),
  ])),
  reloadOnChange: PropTypes.bool,
  showUnreleased: PropTypes.bool,
  onLanguageApplied: PropTypes.func,
  buttonSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default LanguageSwitcher;


