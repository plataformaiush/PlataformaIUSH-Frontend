import { create } from "zustand";
import {
  TeacherDashboardData,
  TeacherHealthResponse,
} from "../../../../domain/teacher/teacherTypes";
import { teacherApi } from "./teacherApi";

interface TeacherStore {
  dashboard: TeacherDashboardData | null;
  health: TeacherHealthResponse | null;
  loading: boolean;
  error: string | null;
  notification: string | null;

  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  checkHealth: () => Promise<void>;
  clearNotification: () => void;
  notify: (message: string) => void;
  goToExternalModule: (
    url: string | null | undefined,
    fallbackMessage: string
  ) => void;
}

export const useTeacherStore = create<TeacherStore>((set, get) => ({
  dashboard: null,
  health: null,
  loading: false,
  error: null,
  notification: null,

  loadDashboard: async () => {
    if (get().loading) return;

    set({
      loading: true,
      error: null,
    });

    try {
      const dashboard = await teacherApi.getDashboardSummary();

      set({
        dashboard,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        dashboard: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "No fue posible cargar el resumen docente.",
      });
    }
  },

  refreshDashboard: async () => {
    set({
      notification: "Actualizando información del dashboard docente...",
    });

    await get().loadDashboard();
  },

  checkHealth: async () => {
    try {
      const health = await teacherApi.getHealth();
      set({ health });
    } catch {
      set({ health: null });
    }
  },

  clearNotification: () => {
    set({ notification: null });
  },

  notify: (message) => {
    set({ notification: message });
  },

  goToExternalModule: (url, fallbackMessage) => {
    if (!url) {
      set({ notification: fallbackMessage });
      return;
    }

    window.location.href = url;
  },
}));