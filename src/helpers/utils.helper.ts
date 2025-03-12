import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import moment from 'moment';

/**
 * encrypt password
 *
 * @param textToEncrypt
 * @returns
 */
export const encrypt = async (textToEncrypt: string) => {
  const AES_ENC_KEY_BUFFER = Buffer.from(process.env.AES_ENC_KEY, 'hex');
  const AES_IV_BUFFER = Buffer.from(process.env.AES_IV, 'hex');

  const cipher = createCipheriv(
    'aes-256-cbc',
    AES_ENC_KEY_BUFFER,
    AES_IV_BUFFER,
  );
  let encrypted = cipher.update(textToEncrypt, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

/**
 * decrypt password
 * @param encryptToText
 * @returns
 */
export const decrypt = async (encryptToText: string) => {
  const AES_ENC_KEY_BUFFER = Buffer.from(process.env.AES_ENC_KEY, 'hex');
  const AES_IV_BUFFER = Buffer.from(process.env.AES_IV, 'hex');

  const decipher = createDecipheriv(
    'aes-256-cbc',
    AES_ENC_KEY_BUFFER,
    AES_IV_BUFFER,
  );
  const decrypted = decipher.update(encryptToText, 'base64', 'utf8');
  return decrypted + decipher.final('utf8');
};

/**
 * date to timestamp convert
 * @param date
 * @returns
 */
export const generateOtp = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

/**
 * Generate unique ID
 * @param prefix
 * @returns
 */
export const generateUniqueId = (prefix: string) => {
  return `${prefix}${randomBytes(4).toString('hex')}${moment().unix()}`;
};

/**
 * Check if external url is valid or not
 * @param url
 * @returns
 */
export const isUrlValid = (url: string) => {
  if (url?.indexOf('http') == 0) return true;
  return false;
};

/**
 * Check if email is valid or not
 * @param url
 * @returns
 */
export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};
