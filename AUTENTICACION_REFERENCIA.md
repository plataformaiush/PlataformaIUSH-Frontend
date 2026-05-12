# Autenticación: referencia rápida

## Uso

- `tokenManager.setToken(token, expiresIn)` guarda el token.
- `tokenManager.getToken()` obtiene el token.
- `tokenManager.isTokenExpired()` valida expiración.
- `useAuthStore().setUser(user, token, expiresIn)` registra la sesión.
- `logout()` limpia todo.

## Comportamiento

- Login exitoso: guarda token y usuario.
- Request autenticada: agrega `Authorization: Bearer ...`.
- Respuesta `401`: limpia sesión y vuelve a login.
