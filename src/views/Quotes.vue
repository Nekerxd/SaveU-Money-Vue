<template>
    <div class="card">
        <h5 class="mb-3">Cotações de Hoje</h5>
        <div v-if="cotacoes.length">
            <div v-for="(cotacao, index) in cotacoes" :key="index" class="cotacao-item p-3 mb-3 border-round">
                <div class="flex align-items-center justify-content-between">
                    <div>
                        <div class="text-xl mb-2">{{ cotacao.name }}</div>
                        <div :class="['text-lg font-bold', cotacao.variation > 0 ? 'text-green-500' : 'text-red-500']">
                            {{ formatCurrency(cotacao.value) }}
                            <i :class="{'pi pi-caret-up': cotacao.variation > 0, 'pi pi-caret-down': cotacao.variation <= 0}"></i>
                            {{ cotacao.variation }}%
                        </div>
                        <div class="text-400">{{ cotacao.code }}</div>
                    </div>
                    <div class="flag-icon">
                        <img :src="cotacao.flag" alt="Flag" />
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>Carregando...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const cotacoes = ref([]);
const apiKey = '689eef4d';
const apiUrl = `/api/finance/quotations?key=${apiKey}`;

const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const fetchCotacoes = async () => {
    try {
        const response = await axios.get(apiUrl);
        const data = response.data.results.currencies;
        console.log(data)
        cotacoes.value = [
            {
                name: 'Dólar',
                value: data.USD.buy,
                variation: data.USD.variation,
                flag: '/layout/images/us.png',
                code: 'USDBRL'
            },
            {
                name: 'Euro',
                value: data.EUR.buy,
                variation: data.EUR.variation,
                flag: '/layout/images/europe.svg',
                code: 'EURBRL'
            },
            {
                name: 'Libra Esterlina',
                value: data.GBP.buy,
                variation: data.GBP.variation,
                flag: '/layout/images/gb.png',
                code: 'GBPBRL'
            },
            {
                name: 'Yuan chinês',
                value: data.CNY.buy,
                variation: data.CNY.variation,
                flag: '/layout/images/cn.png',
                code: 'CNYBRL'
            },
            {
                name: 'Bitcoin',
                value: data.BTC.buy,
                variation: data.BTC.variation,
                flag: '/layout/images/btc.png',
                code: 'BTCBRL'
            }
        ];
    } catch (error) {
        console.error('Erro ao buscar cotações:', error);
    }
};

onMounted(() => {
    fetchCotacoes();
});
</script>

<style scoped>
.cotacao-item {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.flag-icon img {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    object-fit: cover;
}
</style>
