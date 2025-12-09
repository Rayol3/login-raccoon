import { productsApi } from '../../api/productsApi';
import * as SecureStore from 'expo-secure-store';
import { AxiosError } from 'axios';

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export class AuthService {
    static async login(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('Sending login request to:', productsApi.defaults.baseURL);
            const { data } = await productsApi.post<AuthResponse>('/auth/login', { email, password });
            console.log('Login response data:', data);
            await SecureStore.setItemAsync('token', data.token);
            return data;
        } catch (error) {
            console.error('AuthService login error:', error);
            if (error instanceof AxiosError) {
                console.log('Axios error details:', error.response?.data);
                throw new Error(error.response?.data?.error || 'Login failed');
            }
            throw new Error('Login failed');
        }
    }

    static async register(name: string, email: string, password: string): Promise<AuthResponse> {
        try {
            const { data } = await productsApi.post<AuthResponse>('/auth/register', { name, email, password });
            await SecureStore.setItemAsync('token', data.token);
            return data;
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data);
                throw new Error(error.response?.data?.error || 'Registration failed');
            }
            throw new Error('Registration failed');
        }
    }

    static async checkStatus(): Promise<AuthResponse | null> {
        const token = await SecureStore.getItemAsync('token');
        if (!token) return null;

        try {
            // Assuming there is a check-status endpoint or just validating token presence for now
            // If you implement a check-status endpoint, call it here.
            // For now, we'll just return null if we can't validate it against the backend easily without an endpoint.
            // Or we can decode it if we had a library, but let's keep it simple.
            return null;
        } catch (error) {
            return null;
        }
    }

    static async logout() {
        await SecureStore.deleteItemAsync('token');
    }
}
