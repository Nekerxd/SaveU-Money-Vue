<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

const model = ref([
    {
        label: 'Início',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Navegação',
        items: [
            { label: 'Relatórios', icon: 'pi pi-fw pi-chart-bar', to: '/error' },
            { label: 'Contas', icon: 'pi pi-fw pi-wallet', to: '/contas' },
            { label: 'Metas', icon: 'pi pi-fw pi-star', to: '/metas' },
            {
                label: 'Lançamentos',
                icon: 'pi pi-fw pi-list',
                items: [
                    {
                        label: 'Todos',
                        icon: 'pi pi-fw pi-table',
                        to: '/lancamentos'
                    },
                    {
                        label: 'Despesas',
                        icon: 'pi pi-fw pi-search-minus',
                        to: '/despesas'
                    },
                    {
                        label: 'Receitas',
                        icon: 'pi pi-fw pi-search-plus',
                        to: '/receitas'
                    }
                ]
            },
            { label: 'Investimentos', icon: 'pi pi-fw pi-chart-line', to: '/error' },
            { label: 'Sair', to: '/auth/login', icon: 'pi pi-fw pi-sign-out', command: () => authStore.logout()},
        ]
    }
]);

</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item class="text-3x1" v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>