import React from 'react';
import { getCurrentUser } from '@/backend/auth/authService';
import { HeaderClient } from './HeaderClient';

export async function SiteHeader() {
  const user = await getCurrentUser();
  return <HeaderClient user={user} />;
}
