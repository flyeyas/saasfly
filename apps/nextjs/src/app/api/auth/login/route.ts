import { loginUser } from '@saasfly/auth/src/api/login';

export async function POST(request: Request) {
  return loginUser(request as any);
}