import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

// Force Node.js runtime pour éviter les problèmes Edge Runtime avec Supabase
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  // Routes protégées
  const protectedRoutes = ['/dashboard', '/api/process-image', '/api/user-data', '/api/logout', '/api/analyze-image', '/api/upload-image', '/api/chat', '/api/qwen-chat'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    try {
      // Récupérer le token depuis les cookies
      const token = request.cookies.get('session_token')?.value;
      
      if (!token) {
        console.log('🔒 Pas de token trouvé, redirection vers login');
        return redirectToLogin(request);
      }
      
      // Vérifier l'utilisateur par token
      const user = await DatabaseService.getUserByToken(token);
      
      if (!user) {
        console.log('🔒 Utilisateur non trouvé, redirection vers login');
        return redirectToLogin(request);
      }
      
      console.log('✅ Utilisateur authentifié:', { id: user.id, email: user.email });
      
      // Vérifier si la session n'est pas trop ancienne (24h)
      const lastActivity = new Date(user.last_activity);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.log('⏰ Session expirée, invalidation');
        // Session expirée, invalider
        await DatabaseService.invalidateSession(token);
        return redirectToLogin(request);
      }
      
      // Ajouter les headers utilisateur (sans les infos sensibles)
      request.headers.set('x-user-id', user.id);
      request.headers.set('x-user-email', user.email);
      request.headers.set('x-session-token', token);
      
      console.log('📤 Headers ajoutés:', {
        'x-user-id': user.id,
        'x-user-email': user.email,
        'x-session-token': token
      });
      
      // Mettre à jour la dernière activité
      await DatabaseService.updateLastActivity(user.id);
      
      return NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      
    } catch (error) {
      console.error('💥 Erreur middleware:', error);
      return redirectToLogin(request);
    }
  }
  
  // Routes publiques
  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Configuration du middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 