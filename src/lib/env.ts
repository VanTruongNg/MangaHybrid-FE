const requiredEnvs = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_JWT_EXPIRES_IN'
] as const;

export function validateEnv() {
  const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

  if (missingEnvs.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvs.join(', ')}`
    );
  }
}

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  jwtExpiresIn: process.env.NEXT_PUBLIC_JWT_EXPIRES_IN,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL
} as const; 