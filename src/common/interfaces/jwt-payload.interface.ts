export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: 'customer' | 'admin';
  iat?: number;
  exp?: number;
}


