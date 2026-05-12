import { create } from "zustand";
import { tokenManager } from "../services/tokenManager";

export interface AuthUser {
	id: string;
	correo: string;
	nombre?: string;
	roles?: string[];
}

interface AuthState {
	isAuthenticated: boolean;
	user: AuthUser | null;
	token: string | null;
	isLoading: boolean;
	error: string | null;
	setUser: (user: AuthUser, token: string, expiresIn?: number) => void;
	logout: () => void;
	checkToken: () => boolean;
	clearError: () => void;
	setError: (error: string | null) => void;
	setLoading: (loading: boolean) => void;
	initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	isAuthenticated: false,
	user: null,
	token: null,
	isLoading: false,
	error: null,

	setUser: (user, token, expiresIn = 3600) => {
		tokenManager.setToken(token, expiresIn);
		tokenManager.setUser(user);

		set({
			isAuthenticated: true,
			user,
			token,
			error: null,
		});
	},

	logout: () => {
		tokenManager.clearToken();
		set({
			isAuthenticated: false,
			user: null,
			token: null,
			error: null,
		});
	},

	checkToken: () => {
		const token = tokenManager.getToken();
		const isExpired = tokenManager.isTokenExpired();

		if (!token || isExpired) {
			set({
				isAuthenticated: false,
				user: null,
				token: null,
			});
			return false;
		}

		const user = tokenManager.getUser() as AuthUser | null;
		set({
			isAuthenticated: true,
			user,
			token,
		});
		return true;
	},

	clearError: () => set({ error: null }),

	setError: (error) => set({ error }),

	setLoading: (loading) => set({ isLoading: loading }),

	initializeAuth: () => {
		const token = tokenManager.getToken();

		if (token && !tokenManager.isTokenExpired()) {
			const user = tokenManager.getUser() as AuthUser | null;
			set({
				isAuthenticated: true,
				user,
				token,
			});
			return;
		}

		set({
			isAuthenticated: false,
			user: null,
			token: null,
		});
	},
}));
