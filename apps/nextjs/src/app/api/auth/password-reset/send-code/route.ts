import { sendPasswordResetCode } from '@saasfly/auth/src/api/password-reset';

export async function POST(request: Request) {
  return sendPasswordResetCode(request as any);
}