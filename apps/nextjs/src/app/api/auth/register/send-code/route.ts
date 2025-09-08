import { sendRegisterVerificationCode } from '@saasfly/auth/src/api/register';

export async function POST(request: Request) {
  return sendRegisterVerificationCode(request as any);
}