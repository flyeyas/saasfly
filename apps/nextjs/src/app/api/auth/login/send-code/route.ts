import { sendLoginVerificationCode } from '@saasfly/auth/src/api/login';

export async function POST(request: Request) {
  return sendLoginVerificationCode(request as any);
}