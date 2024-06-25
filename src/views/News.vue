<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const news = ref([]);
const loading = ref(true);
const apiKey = 'BKNJRNDBRFE262T9';

const parseDate = (dateString) => {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6) - 1; // Months are zero-indexed in JavaScript Date
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(9, 11);
    const minute = dateString.slice(11, 13);
    const second = dateString.slice(13, 15);
    return new Date(year, month, day, hour, minute, second);
};

const truncateSummary = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const fetchNews = async () => {
    try {
        const response = await axios.get('https://www.alphavantage.co/query', {
            params: {
                function: 'NEWS_SENTIMENT',
                topics: 'Financial Markets',
                apikey: apiKey,
            }
        });
        news.value = response.data.feed;
    } catch (error) {
        console.error("Erro ao carregar notícias:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchNews();
});
</script>

<template>
    <div class="card">
        <h5>Últimas notícias financeiras</h5>
        <ScrollPanel class="news-container">
            <div v-if="loading">Carregando...</div>
            <div v-else class="grid grid-nogutter">
                <div v-for="(article, index) in news" :key="index" class="col-12">
                    <div v-if="article.banner_image" class="flex flex-column sm:flex-row sm:align-items-center p-4 gap-3" :class="{ 'border-top-1 surface-border': index !== 0 }">
                        <div class="md:w-10rem relative">
                            <img class="block xl:block mx-auto border-round w-full" :src="article.banner_image" :alt="article.title" />
                        </div>
                        <div class="flex flex-column md:flex-row justify-content-between md:align-items-center flex-1 gap-4">
                            <div class="flex flex-row md:flex-column justify-content-between align-items-start gap-2">
                                <div>
                                    <a :href="article.url" target="_blank" class="text-blue-500 hover:underline">
                                        <h6 class="text-lg font-medium text-900 mt-2">{{ article.title }}</h6>
                                    </a>
                                    <p>{{ truncateSummary(article.summary, 100) }}</p>
                                    <small>{{ parseDate(article.time_published).toLocaleString() }}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollPanel>
    </div>
</template>


<style scoped>
.card {
    height: 400px; /* Define the fixed height */
    padding: 1rem;
    border: 1px solid #dcdcdc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: white;
}
</style>
