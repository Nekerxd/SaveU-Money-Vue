<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const name = ref('');
const checked = ref(false);
const confirmPassword = ref('');
const passwordMismatch = ref(false);
const errorMessage = ref(null);
const loading = ref(false);
const authStore = useAuthStore();
const submitted = ref(false);

const $router = useRouter();

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo_branca' : 'logo_azul'}.svg`;
});

const handleRegister = async () => {
    submitted.value = true;
    console.log(checked.value)
    if (name.value && email.value && email.value.trim() && password.value && confirmPassword.value && checked.value) {    
        console.log('Entrou')
        errorMessage.value = null;
        loading.value = true;
        if (password.value === confirmPassword.value) {
            passwordMismatch.value = false;
            try {
                await authStore.register(name.value, email.value, password.value);
                await authStore.login(email.value, password.value)
                $router.push('/')
            } catch (error) {
                console.error('Erro no cadastro: ', error);
                errorMessage.value = error.message || 'Erro ao fazer cadastro. Verifique as credenciais';
            } finally {
                loading.value = false;
            }
        } else {
            passwordMismatch.value = true;
        }
    }
};

const redirectLogin = async () => {
    $router.push('/auth/login')
} 

</script>

<template>
    <div class="auth-bg surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card pt-5 pb-7 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center">
                            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
                    </div>
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Cadastre-se</div>
                        <span class="text-600 font-medium">Insira seus dados para continuar</span>
                    </div>

                    <div>
                        <label for="name" class="block text-900 text-xl font-medium mb-2">Nome de usuário</label>
                        <InputText id="name" type="text" placeholder="Insira seu nome de usuário" class="w-full md:w-30rem mb-3" style="padding: 1rem" v-model="name" :invalid="submitted && !name"/>

                        <label for="email" class="block text-900 text-xl font-medium mb-2">E-mail</label>
                        <InputText id="email" type="email" placeholder="Insira o endereço de e-mail" class="w-full md:w-30rem mb-3" style="padding: 1rem" v-model="email" :invalid="submitted && !email" />

                        <label for="password" class="block text-900 font-medium text-xl mb-2">Senha</label>
                        <Password id="password" v-model="password" placeholder="Insira sua senha" :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }" :invalid="submitted && !password"></Password>

                        <label for="confirmPassword" class="block text-900 font-medium text-xl mb-2">Confirmar Senha</label>
                        <InputText id="confirmPassword" type="password" v-model="confirmPassword" placeholder="Confirme sua senha" :toggleMask="true" class="w-full md:w-30rem mb-1" style="padding: 1rem" :invalid="submitted && !confirmPassword"></InputText>

                        <p v-if="passwordMismatch" class="font-medium text-red-500">As senhas não coincidem.</p>

                        <div class="flex mt-3 align-items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2" :invalid="submitted && !checked"></Checkbox>
                                <label for="rememberme1">Li e concordo com os <a class="font-bold text-primary" href="">termos de uso</a></label>
                        </div>

                        <div class="mt-6 flex-group">
                            <Button label="Voltar" class="bg-primary-reverse w-6 p-3 text-xl" :onclick="redirectLogin"/>
                            <Button label="Cadastre-se" class="w-6 p-3 text-xl" :onclick="handleRegister"/>
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
