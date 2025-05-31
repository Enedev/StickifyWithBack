// src/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// No necesitas Observable de rxjs a menos que uses Pipes o Interceptores que lo requieran
// import { Observable } from 'rxjs'; // Puedes quitar esta línea si no la usas

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private jwtService:JwtService){} // JwtService se inyecta aquí

  canActivate(context: ExecutionContext): boolean {
    let request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if(authorization){
      try{
        const token = this.getToken(authorization);
        // Verificar el token aquí. Si falla, lanzará un error que será capturado por el catch.
        this.jwtService.verify(token);
        return true; // El token es válido
      }catch(error){
        // Si el token no es válido o está expirado
        throw new UnauthorizedException({code:'503', detail:'Acceso no autorizado: Token inválido o expirado'});
      }
    }
    // Si no hay encabezado de autorización
    throw new UnauthorizedException({code:'503', detail:'Acceso no autorizado: No se proporcionó token'});
  }

  private getToken(authorization:string):string{
    const token = authorization.split(' ');
    // Asegúrate de que el formato es "Bearer <token>"
    return token[1] ? token[1]:'';
  }
}