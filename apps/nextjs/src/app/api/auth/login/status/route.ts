import { checkLoginStatus } from '@saasfly/auth/src/api/login';

export async function GET(request: Request) {
  return checkLoginStatus(request as any);
}