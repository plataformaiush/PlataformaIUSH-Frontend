import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createUser,
  CreateUserPayload,
  getRoles,
  getUsers,
  ManagedUser,
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
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleDeleteLocal = (userId: string) => {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setMessage(
      "Usuario removido de la vista. Falta endpoint DELETE para eliminarlo en backend."
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crea usuarios, visualiza el listado y filtra por nombre.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Crear Usuario</h2>

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, nombre: event.target.value }))
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
              <input
                type="email"
                value={formData.correo}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, correo: event.target.value }))
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500"
                placeholder="usuario@correo.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contraseña temporal
              </label>
              <input
                type="text"
                value={formData.contrasena}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, contrasena: event.target.value }))
                }
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Rol</label>

              <div className="flex flex-wrap gap-2">
                {roles.map((role) => {
                  const selected = formData.roles.includes(role);

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                      }`}
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
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios creados</h2>

            <input
              type="text"
              value={filterName}
              onChange={(event) => setFilterName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 caret-gray-900 outline-none focus:border-blue-500 md:w-80"
              placeholder="Filtrar por nombre"
            />
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Cargando usuarios...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-500">No hay usuarios para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-gray-900">
                    <th className="px-3 py-2 font-semibold">Nombre</th>
                    <th className="px-3 py-2 font-semibold">Correo</th>
                    <th className="px-3 py-2 font-semibold">Rol</th>
                    <th className="px-3 py-2 font-semibold">Estado</th>
                    <th className="px-3 py-2 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-2 text-gray-900">{user.nombre}</td>
                      <td className="px-3 py-2 text-gray-900">{user.correo}</td>
                        <td className="px-3 py-2 text-gray-900">{user.roles.join(", ") || "Sin rol"}</td>
                        <td className="px-3 py-2 text-gray-900">{user.activo ? "Activo" : "Inactivo"}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={async () => {
                              // Toggle active state via backend
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
                            className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                          >
                            {user.activo ? (togglingId === user.id ? 'Procesando...' : 'Desactivar') : (togglingId === user.id ? 'Procesando...' : 'Activar')}
                          </button>
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
