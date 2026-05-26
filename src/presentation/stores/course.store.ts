import { create } from "zustand";
import type { Course } from "../../domain/courses/types";
import type { Module } from "../../domain/modules/types";
import {
  fetchCursos,
  toggleCursoActivo,
  deleteCurso,
  updateCurso,
  reorderCursos,
} from "../services/courseService";
import {
  fetchModulos,
  reorderModulos,
} from "../services/moduleService";
import { logger } from "../utils/logger";

/**
 * Filtros y vista usados por la UI de cursos.
 * Centralizados aquí para que persistan al navegar entre páginas.
 */
export type CourseFilter = "all" | "active" | "inactive";
export type CourseViewMode = "grid" | "table";

interface ModulesCacheEntry {
  modules: Module[];
  fetchedAt: number;
}

interface CourseStoreState {
  // Datos
  courses: Course[];
  modulesByCourse: Record<string, ModulesCacheEntry>;

  // Estado de red
  loading: boolean;
  reorderSaving: boolean;
  error: string | null;
  fetchedAt: number | null;

  // Filtros/vista persistentes
  filter: CourseFilter;
  searchTerm: string;
  viewMode: CourseViewMode;

  // Acciones
  loadCourses: (force?: boolean) => Promise<void>;
  invalidate: () => void;
  setFilter: (filter: CourseFilter) => void;
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: CourseViewMode) => void;

  toggleStatus: (courseId: string, nextActivo: boolean) => Promise<void>;
  removeCourse: (courseId: string) => Promise<void>;
  patchCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<{ persisted: boolean }>;

  // Módulos (cache simple por curso)
  loadModules: (courseId: string, force?: boolean) => Promise<Module[]>;
  reorderModules: (courseId: string, orderedIds: string[]) => Promise<void>;
}

const STALE_AFTER_MS = 60_000; // 1 min

export const useCourseStore = create<CourseStoreState>((set, get) => ({
  courses: [],
  modulesByCourse: {},

  loading: false,
  reorderSaving: false,
  error: null,
  fetchedAt: null,

  filter: "all",
  searchTerm: "",
  viewMode: "table",

  loadCourses: async (force = false) => {
    const { fetchedAt, loading } = get();
    if (loading) return;
    const isFresh = fetchedAt && Date.now() - fetchedAt < STALE_AFTER_MS;
    if (!force && isFresh) return;

    set({ loading: true, error: null });
    try {
      const data = await fetchCursos({ limit: 100 });
      set({ courses: data, fetchedAt: Date.now(), loading: false });
    } catch (error) {
      logger.error("course.store.loadCourses error", { error });
      set({
        loading: false,
        error: "No se pudieron cargar los cursos. Por favor intenta nuevamente.",
      });
    }
  },

  invalidate: () => set({ fetchedAt: null, modulesByCourse: {} }),

  setFilter: (filter) => set({ filter }),
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setViewMode: (viewMode) => set({ viewMode }),

  toggleStatus: async (courseId, nextActivo) => {
    const prev = get().courses;
    // Optimistic
    set({
      courses: prev.map((c) =>
        c.id === courseId
          ? { ...c, status: nextActivo ? "active" : "inactive" }
          : c,
      ),
    });
    try {
      await toggleCursoActivo(courseId, nextActivo);
    } catch (error) {
      logger.error("course.store.toggleStatus error", { error, courseId });
      set({ courses: prev });
      throw error;
    }
  },

  removeCourse: async (courseId) => {
    const prev = get().courses;
    set({ courses: prev.filter((c) => c.id !== courseId) });
    try {
      await deleteCurso(courseId);
    } catch (error) {
      logger.error("course.store.removeCourse error", { error, courseId });
      set({ courses: prev });
      throw error;
    }
  },

  patchCourse: async (courseId, updates) => {
    const prev = get().courses;
    set({
      courses: prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c)),
    });
    try {
      await updateCurso(courseId, updates);
    } catch (error) {
      logger.error("course.store.patchCourse error", { error, courseId });
      set({ courses: prev });
      throw error;
    }
  },

  reorder: async (orderedIds) => {
    const prev = get().courses;
    const lookup = new Map(prev.map((c) => [c.id, c]));
    const reordered = orderedIds
      .map((id) => lookup.get(id))
      .filter((c): c is Course => Boolean(c));

    set({ courses: reordered, reorderSaving: true });

    const payload = reordered.map((c, idx) => ({
      id_curso: c.id,
      orden: idx + 1,
    }));
    try {
      const updated = await reorderCursos(payload);
      set({
        courses: updated,
        reorderSaving: false,
        fetchedAt: Date.now(),
      });
      return { persisted: true };
    } catch (error: any) {
      set({ reorderSaving: false });
      if (error?.notImplemented) {
        logger.warn("course.store.reorder: backend sin endpoint, orden solo local");
        return { persisted: false };
      }
      logger.error("course.store.reorder error", { error });
      // Revertir
      set({ courses: prev });
      throw error;
    }
  },

  loadModules: async (courseId, force = false) => {
    const entry = get().modulesByCourse[courseId];
    const isFresh = entry && Date.now() - entry.fetchedAt < STALE_AFTER_MS;
    if (!force && isFresh) return entry.modules;

    try {
      const modules = await fetchModulos(courseId);
      set((state) => ({
        modulesByCourse: {
          ...state.modulesByCourse,
          [courseId]: { modules, fetchedAt: Date.now() },
        },
      }));
      return modules;
    } catch (error) {
      logger.error("course.store.loadModules error", { error, courseId });
      throw error;
    }
  },

  reorderModules: async (courseId, orderedIds) => {
    const entry = get().modulesByCourse[courseId];
    if (!entry) return;
    const lookup = new Map(entry.modules.map((m) => [m.id, m]));
    const reordered = orderedIds
      .map((id) => lookup.get(id))
      .filter((m): m is Module => Boolean(m))
      .map((m, idx) => ({ ...m, order: idx + 1 }));

    set((state) => ({
      modulesByCourse: {
        ...state.modulesByCourse,
        [courseId]: { modules: reordered, fetchedAt: Date.now() },
      },
      reorderSaving: true,
    }));

    try {
      const payload = reordered.map((m, idx) => ({
        id_modulo: m.id,
        orden: idx + 1,
      }));
      const updated = await reorderModulos(courseId, payload);
      set((state) => ({
        modulesByCourse: {
          ...state.modulesByCourse,
          [courseId]: { modules: updated, fetchedAt: Date.now() },
        },
        reorderSaving: false,
      }));
    } catch (error) {
      logger.error("course.store.reorderModules error", { error, courseId });
      set({ reorderSaving: false });
      // Re-load to undo optimistic
      try {
        await get().loadModules(courseId, true);
      } catch {}
      throw error;
    }
  },
}));
