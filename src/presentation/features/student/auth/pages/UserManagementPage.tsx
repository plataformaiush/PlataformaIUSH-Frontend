import { FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useUsersViewPreference } from "../../../../../context/UsersViewPreferenceContext";
import { useAuthStore } from "../../../../stores/auth.store";
import {
  createUser,
  CreateUserPayload,
  getRoles,
  getUsers,
  ManagedUser,
  updateUser,
  setUserActive,
} from "../services/userManagementService";

const initialForm: CreateUserPayload = {
  nombre: "",
  correo: "",
  contrasena: "",
  roles: [],
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateUserPayload>(initialForm);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editFormData, setEditFormData] = useState<CreateUserPayload>(initialForm);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const { viewType, setViewType } = useUsersViewPreference();
  const { user } = useAuthStore();
  
  const isSuperAdmin = user?.roles?.includes('SuperAdmin') ?? false;

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersResult, rolesResult] = await Promise.all([
          getUsers(),
          getRoles(),
        ]);

        setUsers(usersResult);
        setRoles(rolesResult);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
        setError("No se pudieron cargar usuarios o roles.");
      } finally {
        setLoading(false);
      }
    };

    void loadPageData();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = filterName.trim().toLowerCase();
    if (!search) return users;

    return users.filter((user) =>
      user.nombre.toLowerCase().includes(search)
    );
  }, [filterName, users]);

  const toggleRole = (role: string) => {
    setFormData((current) => {
      const alreadySelected = current.roles.includes(role);

      return {
        ...current,
        roles: alreadySelected
          ? current.roles.filter((selectedRole) => selectedRole !== role)
          : [...current.roles, role],
      };
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.roles.length === 0) {
      setError("Selecciona al menos un rol para el usuario.");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      setMessage(null);

      if (!formData.contrasena.trim()) {
        setError("La contraseña es obligatoria para crear un usuario.");
        return;
      }

      const createdUser = await createUser(formData);
      setUsers((current) => [createdUser, ...current]);
      setFormData(initialForm);
      setMessage("Usuario creado correctamente.");
    } catch (err) {
      console.error("Error creando usuario:", err);
      setError("No se pudo crear el usuario.");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setEditFormData({
      nombre: user.nombre,
      correo: user.correo,
      contrasena: "",
      roles: user.roles,
    });
    setMessage(null);
    setError(null);
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    setEditFormData(initialForm);
    setMessage(null);
    setError(null);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    if (editFormData.roles.length === 0) {
      setError("Selecciona al menos un rol para el usuario.");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setMessage(null);

      const updatePayload: any = {
        nombre: editFormData.nombre,
        roles: editFormData.roles,
      };

      if (editFormData.contrasena && editFormData.contrasena.trim()) {
        updatePayload.contrasena = editFormData.contrasena;
      }

      const updatedUser = await updateUser(editingUser.id, updatePayload);

      setUsers((current) =>
        current.map((user) => (user.id === editingUser.id ? updatedUser : user))
      );
      setMessage("Usuario actualizado correctamente.");
      handleCloseEditModal();
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      setError("No se pudo actualizar el usuario.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleEditRole = (role: string) => {
    // Only a single role is allowed in edit mode: replace the roles array
    setEditFormData((current) => ({ ...current, roles: [role] }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 md:px-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-tertiary/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-6">
        <header className="overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-tertiary px-3 py-1 text-xs font-semibold text-primary">
                Superadmin / Admin
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary">Gestión de Usuarios</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Crea, edita y activa usuarios desde una interfaz unificada con el diseño global del proyecto.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                {loading ? "Cargando datos..." : `${users.length} usuarios cargados`}
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => setViewType(viewType === 'management' ? 'original' : 'management')}
                  className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderColor: 'var(--color-primary)'
                  }}
                  title={`Cambiar a vista ${viewType === 'management' ? 'original' : 'de gestión'}`}
                >
                  Vista Usuarios
                </button>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 shadow-sm">
            {message}
          </div>
        )}

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-7">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-primary">Crear Usuario</h2>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, nombre: event.target.value }))
                }
                required
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-foreground placeholder:text-muted-foreground caret-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-primary">Correo</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, correo: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-foreground placeholder:text-muted-foreground caret-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary disabled:cursor-not-allowed disabled:bg-muted/60"
                placeholder="usuario@correo.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-primary">
                Contraseña temporal
              </label>
              <input
                type="password"
                value={formData.contrasena}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, contrasena: event.target.value }))
                }
                required
                minLength={6}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-foreground placeholder:text-muted-foreground caret-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary disabled:cursor-not-allowed disabled:bg-muted/60"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-primary">Rol</label>

              <div className="flex flex-wrap gap-2">
                {roles.map((role) => {
                  const selected = formData.roles.includes(role);

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-border bg-surface text-foreground hover:border-secondary hover:bg-tertiary/30"
                      }`}
                      style={selected ? { color: 'var(--color-text-on-dark)' } : {}}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-text-on-dark)'
                }}
              >
                {creating ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        </section>

        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/55 px-4 py-8 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-[0_30px_80px_color-mix(in_srgb,var(--color-foreground)_25%,transparent)] md:p-8">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-tertiary px-3 py-1 text-xs font-semibold text-primary">
                    Edición de usuario
                  </span>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-primary">
                    Editar usuario
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Modifica los datos permitidos y confirma para guardar los cambios.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary transition hover:bg-tertiary/50 hover:text-primary"
                  aria-label="Cerrar edición"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">Nombre</label>
                  <input
                    type="text"
                    value={editFormData.nombre}
                    onChange={(event) =>
                      setEditFormData((current) => ({ ...current, nombre: event.target.value }))
                    }
                    required
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-foreground placeholder:text-muted-foreground caret-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">Correo</label>
                  <input
                    type="email"
                    value={editFormData.correo}
                    disabled
                    className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-foreground placeholder:text-muted-foreground caret-foreground outline-none opacity-80"
                    placeholder="usuario@correo.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-primary">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      value={editFormData.contrasena}
                      onChange={(event) =>
                        setEditFormData((current) => ({ ...current, contrasena: event.target.value }))
                      }
                      minLength={6}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 pr-24 text-foreground placeholder:text-muted-foreground caret-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary"
                      placeholder="Ingresar contraseña nueva"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-semibold transition"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {showEditPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-primary">Rol</label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => {
                      const selected = editFormData.roles.includes(role);

                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleEditRole(role)}
                          className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                            selected
                              ? "border-primary bg-primary"
                              : "border-border bg-surface text-foreground hover:border-secondary hover:bg-tertiary/30"
                          }`}
                          style={selected ? { color: 'var(--color-text-on-dark)' } : {}}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-text-on-dark)'
                    }}
                  >
                    {updating ? "Guardando cambios..." : "Confirmar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-7">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-primary">Usuarios creados</h2>

            <input
              type="text"
              value={filterName}
              onChange={(event) => setFilterName(event.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground caret-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary md:w-80"
              placeholder="Filtrar por nombre"
            />
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="text-left text-gray-900">
                    <th className="px-3 py-2 font-semibold text-primary">Nombre</th>
                    <th className="px-3 py-2 font-semibold text-primary">Correo</th>
                    <th className="px-3 py-2 font-semibold text-primary">Rol</th>
                    <th className="px-3 py-2 font-semibold text-primary">Estado</th>
                    <th className="px-3 py-2 font-semibold text-primary">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-2 text-foreground">{user.nombre}</td>
                      <td className="px-3 py-2 text-foreground">{user.correo}</td>
                      <td className="px-3 py-2 text-foreground">{user.roles.join(", ") || "Sin rol"}</td>
                      <td className="px-3 py-2 text-foreground">{user.activo ? "Activo" : "Inactivo"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="rounded-lg border border-secondary/40 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-tertiary/40"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setTogglingId(user.id);
                                setError(null);
                                const target = !user.activo;
                                await setUserActive(user.id, target);
                                setUsers((current) =>
                                  current.map((u) => (u.id === user.id ? { ...u, activo: target } : u))
                                );
                                setMessage(`Usuario ${target ? 'activado' : 'desactivado'} correctamente.`);
                              } catch (err) {
                                console.error('Error actualizando estado:', err);
                                setError('No se pudo actualizar el estado del usuario.');
                              } finally {
                                setTogglingId(null);
                              }
                            }}
                            disabled={togglingId === user.id}
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                          >
                            {user.activo ? (togglingId === user.id ? 'Procesando...' : 'Desactivar') : (togglingId === user.id ? 'Procesando...' : 'Activar')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
