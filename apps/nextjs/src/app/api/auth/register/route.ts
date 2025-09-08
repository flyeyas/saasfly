import { registerUser } from '@saasfly/auth/src/api/register';

export async function POST(request: Request) {
  return registerUser(request as any);
}