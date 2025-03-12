import moment from 'moment';

/**
 * date to timestamp convert
 * @param date
 * @returns
 */
export const dateToTimestamp = (date: Date | number) => {
  return moment.utc(date).valueOf();
};

/**
 * set date format
 * @param date
 * @param formate
 * @returns
 */
export const dateFormat = (date: Date, formate = 'DD/MM/YYYY') => {
  return moment.utc(date).format(formate);
};
