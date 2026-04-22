// Este archivo fue eliminado para evitar interferencia con los equipos
// Cada equipo creará sus propios stores específicos según sus necesidades
// 
// Ejemplo para Equipo 8 (Auth, Usuarios, Roles):
// - src/presentation/stores/auth.store.ts (autenticación)
// - src/presentation/stores/user.store.ts (gestión de usuarios)
// - src/presentation/stores/role.store.ts (gestión de roles)
//
// Ejemplo para Equipo 1 (Cursos, Módulos, Contenidos):
// - src/presentation/stores/course.store.ts
// - src/presentation/stores/module.store.ts
// - src/presentation/stores/content.store.ts
//
// Los equipos deben seguir la arquitectura hexagonal:
// - Stores solo en presentation layer
// - Importar solo de domain layer para tipos
// - No importar de infrastructure o application
// - Usar Zustand con TypeScript estricto
