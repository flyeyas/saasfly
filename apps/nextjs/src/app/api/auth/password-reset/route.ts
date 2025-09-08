import { resetPassword } from '@saasfly/auth/src/api/password-reset';

export async function POST(request: Request) {
  return resetPassword(request as any);
}