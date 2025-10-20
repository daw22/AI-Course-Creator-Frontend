import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import useUserStore from './state/user';

export async function middleware(request: NextRequest) {
  const user = useUserStore.getState().user;

  // if (!user && request.nextUrl.pathname.startsWith('/CreateCourse')) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }

  // if (!user && request.nextUrl.pathname.startsWith('/MyCourses')) {
  //   return NextResponse.redirect(new URL('/', request.url));
  // }
  return NextResponse.next();
}