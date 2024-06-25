import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/news',
                    name: 'news',
                    component: () => import('@/views/News.vue')
                },
                {
                    path: '/despesas',
                    name: 'despesas',
                    component: () => import('@/views/pages/Despesas.vue')
                },
                {
                    path: '/receitas',
                    name: 'receitas',
                    component: () => import('@/views/pages/Receitas.vue')
                },
                {
                    path: '/lancamentos',
                    name: 'lancamentos',
                    component: () => import('@/views/pages/Lancamentos.vue')
                },
                {
                    path: '/contas',
                    name: 'contas',
                    component: () => import('@/views/pages/Contas.vue')
                },
                {
                    path: '/metas',
                    name: 'metas',
                    component: () => import('@/views/Meta.vue')
                },
                {
                    path: '/pages/movimentacao',
                    name: 'movimentacao',
                    component: () => import('@/views/pages/Lancamentos.vue')
                }
            ]
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
  
    if (to.name !== 'login' && to.name !== 'register' && !authStore.isAuthenticated) {
      next({ name: 'login' });
    } else {
      next();
    }
  });

export default router;
