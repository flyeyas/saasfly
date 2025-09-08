import { checkEmailAvailability } from '@saasfly/auth/src/api/register';

export async function GET(request: Request) {
  return checkEmailAvailability(request as any);
}