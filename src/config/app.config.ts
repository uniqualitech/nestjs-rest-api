import { BASE_URL } from 'src/constants/app.constant';

/**
 * Get storage path
 * @param value string
 * @returns string
 */
export const storagePath = (value = '') => {
  return BASE_URL + `/storage/${value}`;
};

/**
 * Get public path
 * @param value
 * @returns string
 */
export const publicPath = (value = '') => {
  return BASE_URL + +`/${value}`;
};
