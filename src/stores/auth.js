import { defineStore } from "pinia";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import api from "../service/axios";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: localStorage.getItem('userId') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(email, password) {
            try {
                const response = await api.post(`/auth`, {email, password});
                
                this.token = response.data.token;
                localStorage.setItem('token', this.token);

                const decodedToken = jwtDecode(this.token);
                this.user = decodedToken.id
                localStorage.setItem('userId', this.user);
            } catch (error) {
                console.error('Erro no login:', error);
                throw error;
            }
        },
        async register(name, email, password) {
            try {
                await api.post(`/usuarios`, {name, email, password});
            } catch (error) {
                console.error('Erro no cadastro:', error);
                throw error;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
        },
    },
});
