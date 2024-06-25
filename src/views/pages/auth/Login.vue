<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const $router = useRouter();

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const checked = ref(false);
const errorMessage = ref(null);
const loading = ref(false);
const authStore = useAuthStore();
const submitted = ref(false);

const handleLogin = async () => {
    submitted.value = true;
    if (email.value && email.value.trim() && password.value) {
        errorMessage.value = null;
        loading.value = true;
        try {
            await authStore.login(email.value, password.value);
            $router.push('/')
        } catch (error) {
            console.error('Erro no login: ', error);
            errorMessage.value = error.message || 'Erro ao fazer login. Verifique as credenciais';
        } finally {
            loading.value = false;
        }
    }
};

const registerRedirect = async () => {
    $router.push('/auth/register')
}



const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo_branca' : 'logo_azul'}.svg`;
});
</script>

<template>
    <div class="auth-bg surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center">
                        <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
                    </div>
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Acessar Conta</div>
                        <span class="text-600 font-medium">Insira seus dados para continuar</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-900 text-xl font-medium mb-2">E-mail</label>
                        <InputText id="email1" type="text" placeholder="Endereço de e-mail" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" :invalid="submitted && !email"/>

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Senha</label>
                        <Password id="password1" v-model="password" placeholder="Senha" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" :invalid="submitted && !password"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Lembre-se de mim</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Esqueceu sua senha?</a>
                        </div>

                        <div class="flex-group">
                            <Button label="Cadastre-se" :onclick="registerRedirect" class="bg-primary-reverse w-6 p-3 text-xl"></Button>
                            <Button label="Entrar" :onclick="handleLogin" :loading="loading" class="w-6 p-3 text-xl"></Button>
                        </div>
                    </div>
                </div>
                <div class="auth-layout-footer">
                        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
                        by
                        <span class="font-medium ml-2">SaveU Money</span>
                    </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
