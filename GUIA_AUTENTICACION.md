# Guía de Autenticación

## Concepto

Un token es un identificador que el backend devuelve cuando el usuario inicia sesión. El frontend lo guarda para poder enviar solicitudes autenticadas sin pedir la contraseña otra vez.

## Qué hace esta implementación

- Guarda el token en `localStorage`.
- Guarda la fecha de expiración.
- Guarda los datos del usuario.
- Incluye el token automáticamente en las peticiones HTTP.
- Si el servidor responde `401`, limpia la sesión y redirige a login.

## Archivos creados

- `src/presentation/services/tokenManager.ts`
- `src/presentation/services/axiosInterceptor.ts`
- `AUTENTICACION_REFERENCIA.md`

## Flujo

1. El usuario inicia sesión.
2. El backend responde con `token`, `user` y opcionalmente `expiresIn`.
3. El frontend guarda el token y el usuario.
4. Axios añade el token en cada request.
5. Si el token expira, se cierra sesión.
