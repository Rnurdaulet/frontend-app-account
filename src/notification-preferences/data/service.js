import { getConfig, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import snakeCase from 'lodash.snakecase';

const buildConfigurationsUrl = (apiVersion) => (
  `${getConfig().LMS_BASE_URL}/api/notifications/${apiVersion}/configurations/`
);

export const getNotificationPreferences = async () => {
  const client = getAuthenticatedHttpClient();
  try {
    const { data } = await client.get(buildConfigurationsUrl('v2'));
    return data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const { data } = await client.get(buildConfigurationsUrl('v1'));
      return data;
    }
    throw error;
  }
};

export const postPreferenceToggle = async (
  notificationApp,
  notificationType,
  notificationChannel,
  value,
  emailCadence,
) => {
  const patchData = snakeCaseObject({
    notificationApp,
    notificationType: snakeCase(notificationType),
    notificationChannel,
    value,
    emailCadence,
  });
  const client = getAuthenticatedHttpClient();
  try {
    const { data } = await client.put(buildConfigurationsUrl('v2'), patchData);
    return data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const { data } = await client.put(buildConfigurationsUrl('v1'), patchData);
      return data;
    }
    throw error;
  }
};
