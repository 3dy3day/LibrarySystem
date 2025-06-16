import 'dotenv/config';
export const env = {
  PORT: process.env.PORT || '3000',
  BASIC_USER: process.env.BASIC_USER ?? '',
  BASIC_PASS: process.env.BASIC_PASS ?? '',
};
