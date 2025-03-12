import bcrypt from 'bcrypt';

/**
 * Encode Password
 * @param password
 * @returns
 */
export const encodePassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

/**
 * Compare Password
 * @param password
 * @param hashPassword
 * @returns
 */
export const comparePassword = (password: string, hashPassword: string) => {
  return bcrypt.compareSync(password, hashPassword);
};
