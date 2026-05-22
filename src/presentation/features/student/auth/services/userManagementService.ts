import { axiosInstance } from "./authService";

export interface ManagedUser {
  id: string;
  nombre: string;
  correo: string;
  roles: string[];
  activo: boolean;
}

export interface CreateUserPayload {
  nombre: string;
  correo: string;
  contrasena: string;
  roles: string[];
}

export interface UpdateUserPayload {
  nombre: string;
  roles: string[];
}

const normalizeRole = (value: string) => value.trim().toLowerCase().replace(/[\s_]/g, "");

const isRestrictedRole = (value: string) => normalizeRole(value) === "superadmin";

interface RawUser {
  id?: string | number;
  _id?: string | number;
  nombre?: string;
  name?: string;
  correo?: string;
  email?: string;
  roles?: string[];
  activo?: boolean;
  rol?: string;
}

interface RawRole {
  id?: string | number;
  nombre?: string;
  name?: string;
  codigo?: string;
  code?: string;
  activo?: boolean;
}

const normalizeUser = (raw: RawUser, index: number): ManagedUser => {
  const rawId = raw.id ?? raw._id ?? `${index}`;
  const roles = Array.isArray(raw.roles)
    ? raw.roles
    : raw.rol
      ? [raw.rol]
      : [];

  return {
    id: String(rawId),
    nombre: raw.nombre ?? raw.name ?? "Sin nombre",
    correo: raw.correo ?? raw.email ?? "sin-correo@local",
    roles: roles.filter((role) => !isRestrictedRole(role)),
    activo: typeof raw.activo === 'boolean' ? raw.activo : true,
  };
};

const extractArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const candidate = data as Record<string, unknown>;

    if (Array.isArray(candidate.users)) return candidate.users as T[];
    if (Array.isArray(candidate.roles)) return candidate.roles as T[];
    if (Array.isArray(candidate.data)) return candidate.data as T[];
    if (Array.isArray(candidate.items)) return candidate.items as T[];
    if (Array.isArray(candidate.results)) return candidate.results as T[];
  }

  return [];
};

export const getUsers = async (): Promise<ManagedUser[]> => {
  const response = await axiosInstance.get("/api/users");
  const rawUsers = extractArray<RawUser>(response.data);

  return rawUsers.map((user, index) => normalizeUser(user, index));
};

export const getRoles = async (): Promise<string[]> => {
  const response = await axiosInstance.get("/api/roles");

  const rawRoles = extractArray<string | RawRole>(response.data);

  return rawRoles
    .map((role) => {
      if (typeof role === "string") return role;

      return (
        role.codigo ??
        role.code ??
        role.nombre ??
        role.name ??
        ""
      );
    })
    .filter((role) => role.length > 0 && !isRestrictedRole(role));
};

export const createUser = async (
  payload: CreateUserPayload
): Promise<ManagedUser> => {
  const response = await axiosInstance.post("/api/users", payload);

  const created = response.data && typeof response.data === "object"
    ? (response.data as Record<string, unknown>)
    : {};

  const rawCandidate = (
    (created.data as RawUser | undefined) ??
    (created.user as RawUser | undefined) ??
    (created as RawUser)
  );

  return normalizeUser(rawCandidate, Date.now());
};

export const updateUser = async (
  id: string,
  payload: UpdateUserPayload
): Promise<ManagedUser> => {
  const response = await axiosInstance.put(`/api/users/${id}`, payload);

  const updated = response.data && typeof response.data === "object"
    ? (response.data as Record<string, unknown>)
    : {};

  const rawCandidate = (
    (updated.data as RawUser | undefined) ??
    (updated.user as RawUser | undefined) ??
    (updated as RawUser)
  );

  return normalizeUser(rawCandidate, Date.now());
};

export const setUserActive = async (id: string, activo: boolean): Promise<{ success?: boolean; activo?: boolean }> => {
  const response = await axiosInstance.patch(`/api/users/${id}/activo`, { activo });
  return response.data as { success?: boolean; activo?: boolean };
};
