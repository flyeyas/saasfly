import { verifyResetCode } from '@saasfly/auth/src/api/password-reset';

export async function POST(request: Request) {
  return verifyResetCode(request as any);
}