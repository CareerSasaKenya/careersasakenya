// Utility functions for environment variable handling
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development';
};

export const isProduction = () => {
  return import.meta.env.MODE === 'production';
};

export const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = import.meta.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || defaultValue || '';
};