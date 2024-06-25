<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import UserService from '../service/UserService';
import { useToast } from "primevue/usetoast";
import Quotes from './Quotes.vue';

const { isDarkTheme } = useLayout();

const products = ref(null);
const loading = ref(true);
const usuario = ref({});
const toast = useToast();
const contas = ref({});
const lancamentos = ref([]);
const lancamento = ref([]);
const metas = ref([]);
const meta = ref([]);
const metaDialog = ref(false);
const historyChartType = ref(false);
const categoryChartType = ref(false);
const lancamentoDialog = ref(false);
const barData = reactive({
    labels: [`Janeiro`, 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    datasets: [
        {
            label: 'Despesa',
            data: Array(12).fill(0),
            fill: false,
            backgroundColor: '#ff8780',
            borderColor: '#ff8780',
            tension: 0.4
        },
        {
            label: 'Receita',
            data: Array(12).fill(0),
            fill: false,
            backgroundColor: '#76db9b',
            borderColor: '#76db9b',
            tension: 0.4
        },
    ]
});

const pieData = reactive({
  datasets: [{
    data: [],
    backgroundColor: [], // Cores serão definidas dinamicamente
    label: 'Categorias'
  }],
  labels: []
});

const switchPieChart = (tipo) => {
    categoryChartType.value = !categoryChartType.value;
    updatePieChart(tipo);
}

const saldoAtual = ref(0);
const despesasMensais = ref(0);
const receitasMensais = ref(0);

const gastosSemana = ref(0); // Gastos da última semana
const despesasAPagar = ref(0); // Total de despesas a pagar
const receitasAReceber = ref(0); // Total de receitas a receber 

const updatePieChart = (tipo) => {
    const categoryData = {};
    lancamentos.value.forEach(lancamento => {
        if (lancamento.type.toLowerCase() === tipo) {
            if (!categoryData[lancamento.category]) {
                categoryData[lancamento.category] = 0;
            }
            categoryData[lancamento.category] += lancamento.value;
        }
    });

    // Ordena as categorias por valor (da maior para a menor)
    const sortedCategories = Object.entries(categoryData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Pega apenas as 5 maiores categorias

    const colors = ['#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#ef4444'];
    shuffleArray(colors);

    // Atualiza os dados do gráfico
    pieData.labels = sortedCategories.map(([category]) => category);
    pieData.datasets[0].data = sortedCategories.map(([, value]) => value);
    pieData.datasets[0].backgroundColor = colors.slice(0, sortedCategories.length);
};
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const updateDashboard = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - 6);

    barData.datasets[0].data.fill(0);
    barData.datasets[1].data.fill(0);

    let totalBalance = usuario.value.contas.reduce((acc, conta) => acc + conta.balance, 0);

    lancamentos.value.forEach((lancamento) => {
        console.log(lancamento)
        const date = new Date(lancamento.date);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (currentYear === year) {
            if (lancamento.type.toLowerCase() === 'despesa') {
                if (lancamento.status === 'Pago') {
                  barData.datasets[0].data[month] += lancamento.value;
                  totalBalance -= lancamento.value;
                  if (date >= startOfWeek) {
                    gastosSemana.value += lancamento.value;
                  }
                } else if (lancamento.status === 'A pagar') {
                  despesasAPagar.value += lancamento.value;
                }
            } else if (lancamento.type.toLowerCase() === 'receita') {
                if (lancamento.status === 'Recebido') {
                  barData.datasets[1].data[month] += lancamento.value;
                  totalBalance += lancamento.value;
                } else if (lancamento.status === 'A receber') {
                  receitasAReceber.value += lancamento.value;
                }
            }
        }
    });

    saldoAtual.value = totalBalance;
    despesasMensais.value = barData.datasets[0].data[currentMonth];
    receitasMensais.value = barData.datasets[1].data[currentMonth];

    // Corta meses desnecessários do gráfico
    barData.labels = barData.labels.slice(0, currentMonth + 1);
    barData.datasets[0].data = barData.datasets[0].data.slice(0, currentMonth + 1);
    barData.datasets[1].data = barData.datasets[1].data.slice(0, currentMonth + 1);
};



const loadMetas = async () => {
  try {
    metas.value = usuario.value.metas.map((meta) => ({
      ...meta,
      progress: calcMetaProgress(meta),
    }));
  } catch (error) {
    console.error("Erro ao carregar metas:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao carregar metas.",
      life: 3000,
    });
  }
};

const calcMetaProgress = (meta) => {
  const startDate = new Date(meta.startDate);
  const endDate = new Date(meta.endDate);
  let total = lancamentos.value
    .filter(lancamento => {
      const lancamentoDate = new Date(lancamento.date);
      if (lancamentoDate >= startDate && lancamentoDate <= endDate && lancamento.category === meta.category) {
        return true;
      }
      return false;
    })
    .reduce((sum, lancamento) => sum + lancamento.value, 0);
  total = (total * 100 / meta.goal).toFixed(0)
  return total > 100 ? 100 : total;
}

const calculateValueColor = (progressValue, role) => {
  // Define as cores de referência para despesas
  const expenseColorMap = {
    10: [200, 255, 228], // c8ffe4
    20: [185, 255, 213], // b9ffd5
    30: [174, 254, 202], // aefdca
    50: [162, 241, 190], // a2f1be
    60: [255, 217, 150], // ffd996
    65: [255, 201, 150], // ffc996
    70: [255, 191, 140], // ffbf8c
    76: [254, 178, 127], // feb27f
    80: [255, 170, 165], // ffaaa5
    86: [255, 160, 155], // ffa09b
    93: [255, 147, 142], // ff938e
    100: [255, 128, 123], // ff807b
  };

  // Define as cores de referência para receitas (invertidas)
  const receitaColorMap = {
    10: [255, 128, 123], // ff807b
    20: [255, 147, 142], // ff938e
    30: [255, 160, 155], // ffa09b
    50: [255, 170, 165], // ffaaa5
    60: [254, 178, 127], // feb27f
    65: [255, 191, 140], // ffbf8c
    70: [255, 201, 150], // ffc996
    76: [255, 217, 150], // ffd996
    80: [162, 241, 190], // a2f1be
    86: [174, 254, 202], // aefdca
    93: [185, 255, 213], // b9ffd5
    100: [200, 255, 228], // c8ffe4
  };

  // Seleciona o mapa de cores correto com base no tipo da meta
  const colorMap = role === 'Receita' ? receitaColorMap : expenseColorMap;

  // Encontra a cor correspondente ao progresso
  const progressKeys = Object.keys(colorMap).sort((a, b) => a - b);
  for (let i = 0; i < progressKeys.length; i++) {
    const key = parseInt(progressKeys[i]);
    if (progressValue <= key) {
      const color = colorMap[key];
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
  }

  // Retorna a última cor do mapa se o progresso for maior que o último valor da chave
  return `rgb(${colorMap[progressKeys[progressKeys.length - 1]].join(',')})`;
};


const items = ref([
    { label: 'Editar', icon: 'pi pi-fw pi-pencil' },
    { label: 'Excluir', icon: 'pi pi-fw pi-trash' }
]);

const barOptions = ref(null);
const pieOptions = ref(null);



onMounted(async () => {
    try {

    usuario.value = await UserService.getUser();
    contas.value = usuario.value.contas.map(conta => ({label: conta.name, id: conta.id}))

    lancamentos.value = usuario.value.contas
    .flatMap(conta => conta.movimentacoes
    .map(movimentacao => ({...movimentacao, conta: {id: conta.id, name: conta.name}})))

    lancamentos.value = lancamentos.value.map(lancamento => {
        return lancamento;
    })

    updateDashboard();
    updatePieChart('despesa');
    loadMetas();

    } catch (error) {
        console.error("Erro ao carregar lançamentos:", error);
        toast.add({
            severity: "error",
            summary: "Erro",
            detail: "Erro ao carregar lançamentos.",
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
});    

const showMetaDetails = (metaToView) => {
    console.log(metaToView)
    meta.value = {
        ...metaToView,
        date: [new Date(metaToView.startDate), new Date(metaToView.endDate)],
    };
    metaDialog.value = true;
}

const hideMetaDialog = () => {
    metaDialog.value = false;
}
const hideLancamentoDialog = () => {
    lancamentoDialog.value = false;
}

const showLancamentoDetails = (lancamentoToView) => {
    console.log(lancamentoToView)
    lancamento.value = {
        ...lancamentoToView,
        date: new Date(lancamentoToView.date),
    };
    lancamentoDialog.value = true;
}
const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const applyLightTheme = () => {
    barOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };
    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#495057'
                }
            }
        }
    };
};

const getBadgeSeverity = (status) => {
    const statusMap = {
        "pago": 'success',
        "recebido": 'success',
        "a pagar": 'warning',
        "a receber": 'warning',
        "atrasado": 'danger',
    };

    return statusMap[status.toLowerCase()] || 'info';
};

const getTypeSeverity = (status) => {
    const statusMap = {
        "despesa": 'danger',
        "receita": 'success'
    };

    return statusMap[status.toLowerCase()] || 'info';
};


const applyDarkTheme = () => {
    barOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#ebedef'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            },
            y: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            }
        }
    };
    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#ebedef'
                }
            }
        }
    };
};

watch(
    isDarkTheme,
    (val) => {
        if (val) {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    },
    { immediate: true }
);
</script>

<template>


    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Saldo atual</span>
                        <div class="text-900 font-medium text-xl">{{ formatCurrency(saldoAtual) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-wallet text-blue-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium"> - {{ formatCurrency(gastosSemana) }} </span>
                <span class="text-500"> na última semana</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Despesas mensais</span>
                        <div class="text-900 font-medium text-xl"> {{ formatCurrency(despesasMensais) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-red-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-red-500 text-xl"></i>
                    </div>
                </div>
                <span class="text-red-500 font-medium"> {{ formatCurrency(despesasAPagar) }} </span>
                <span class="text-500"> a pagar</span>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-4">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Receitas mensais</span>
                        <div class="text-900 font-medium text-xl"> {{ formatCurrency(receitasMensais) }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round"
                        style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-money-bill text-green-600 text-xl"></i>
                    </div>
                </div>
                <span class="text-green-500 font-medium"> {{ formatCurrency(receitasAReceber) }} </span>
                <span class="text-500"> pendentes</span>
            </div>
        </div>

        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Últimos lançamentos</h5>
                <DataTable :value="lancamentos" :rows="5" :totalPages="1" :paginator="true" responsiveLayout="scroll">
                    <Column field="type" header="Tipo" :sortable="true" style="width: 20%">
                        <template #body="slotProps">
                            <Tag :icon="slotProps.data.type === 'Receita' ? 'pi pi-plus' : 'pi pi-minus'"
                                :severity="getTypeSeverity(slotProps.data.type)" class="p-button-text"></Tag>
                            {{ slotProps.data.type }}
                        </template>
                    </Column>
                    <Column field="description" header="Descrição" :sortable="true" style="width: 40%"></Column>
                    <Column field="value" header="Valor" :sortable="true" style="width: 20%">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.value) }}
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true" style="width: 10%">
                        <template #body="slotProps">
                            <Tag :severity="getBadgeSeverity(slotProps.data.status)">{{
                                slotProps.data.status
                                }}</Tag>
                        </template>
                    </Column>
                    <Column style="width: 10%">
                        <template #header></template>
                        <template #body="slotProps">
                            <Button icon="pi pi-search" type="button" class="p-button-text"
                                @click="showLancamentoDetails(slotProps.data)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>
            
            <div class="card">
                <h5>Metas atuais</h5>
                <DataTable :value="metas" :rows="5" :totalPages="1" :paginator="true" responsiveLayout="scroll">
                    <Column field="title" header="Título" :sortable="true" style="width: 20%"></Column>
                    <Column field="role" header="Tipo" :sortable="true" style="width: 10%"></Column>
                    <Column field="category" header="Categoria" :sortable="true" style="width: 15%">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.category) }}
                        </template>
                    </Column>
                    <Column field="goal" header="Meta" :sortable="true" style="width: 10%">
                        <template #body="slotProps">
                            {{ formatCurrency(slotProps.data.goal) }}
                        </template>
                    </Column>
                    <Column header="Progresso" style="width: 25%">
                        <template #body="slotProps">
                            <div class="flex my-2 align-items-center">
                                <div class="surface-300 border-round overflow-hidden lg:w-full" style="height: 0.8rem">
                                    <div class="h-full"
                                        :style="{ width: slotProps.data.progress + '%', backgroundColor: calculateValueColor(slotProps.data.progress, slotProps.data.role) }">
                                    </div>
                                </div>
                                <span class="ml-3 max-w-2rem font-medium">{{ slotProps.data.progress }}%</span>
                            </div>
                        </template>
                    </Column>
                    <Column style="width: 5%">
                        <template #header></template>
                        <template #body="slotProps">
                            <Button icon="pi pi-search" type="button" class="p-button-text"
                                @click="showMetaDetails(slotProps.data)"></Button>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <div class="card">
                <div class="flex justify-content-between align-items-center mb-1">
                    <h5>{{categoryChartType ? 'Relatório de centros de lucro' : 'Relatório de centros de custo'}}</h5>
                    <Button @click="switchPieChart(categoryChartType?'despesa':'receita')" label="" :icon="categoryChartType ? 'pi pi-shopping-cart' : 'pi pi-wallet'"></Button>
                </div>
                <div class="flex justify-content-center">
                    <Chart class="max-w-30rem" type="pie" :data="pieData" :options="pieOptions"></Chart>
                </div>
            </div>
        </div>
        <div class="col-12 xl:col-6">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-1">
                    <h5>Histórico mensal</h5>
                    <Button @click="historyChartType ? (historyChartType = false) : (historyChartType = true)" label="" :icon="historyChartType ? 'pi pi-chart-bar' : 'pi pi-chart-line'"></Button>
                </div>
                <Chart :type="historyChartType ? 'line' : 'bar'" :data="barData" :options="barOptions"></Chart>
            </div>

            <Quotes></Quotes>

            <div class="px-4 py-5 shadow-2 flex flex-column md:flex-row md:align-items-center justify-content-between mb-3"
                style="border-radius: 1rem">
                <a target="_blank" href="https://www.fatecjales.edu.br/"><img class="w-full" src="/layout/images/fatecnologia.svg" alt="banner fatecnologia"></a>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="metaDialog" :style="{ width: '70rem' }" header="Detalhes da meta" :modal="true"
        class="p-fluid">
        <div class="formgrid grid">
            <div class="field col-9">
                <label for="descricao">Título</label>
                <InputText id="descricao" v-model.trim="meta.title"/>
            </div>
            <div class="field col-3">
                <label for="valor">Valor</label>
                <InputNumber id="valor" v-model="meta.goal" mode="currency" currency="BRL" locale="pt-BR" />
            </div>
            <div class="field col-12">
                <label for="descricao">Descrição</label>
                <Textarea id="descricao" :value="meta.description" autoResize />
            </div>
            <div class="field col-4">
                <label for="tipo" class="">Tipo</label>
                <InputText id="tipo" :value="meta.role" />
            </div>
            <div class="field col-4">
                <label for="tipo" class="">Categoria</label>
                <InputText id="tipo" :value="meta.category" />
            </div>
            <div class="field col-4">
                <label for="data" class="">Data</label>
                <Calendar :showIcon="true" v-model="meta.date" selectionMode="range" showButtonBar locale="pt_BR"
                    dateFormat="dd/mm/yy"></Calendar>
            </div>
        </div>
        <template #footer>
            <Button label="Fechar" icon="pi pi-times" text="" @click="hideMetaDialog()" />
        </template>
    </Dialog>

    <Dialog v-model:visible="lancamentoDialog" :style="{ width: '1000px' }" header="Detalhes do lançamento"
        :modal="true" class="p-fluid">
        <div class="formgrid grid">
            <div class="field col-9">
                <label for="descricao">Descrição</label>
                <InputText id="descricao" v-model.trim="lancamento.description" />
            </div>
            <div class="field col-3">
                <label for="valor">Valor</label>
                <InputNumber id="valor" v-model="lancamento.value" mode="currency" currency="BRL" locale="pt-BR" />
            </div>
        </div>
        <div class="formgrid grid">
            <div class="field col-6">
                <label for="counterparty">Favorecido / Pagador</label>
                <InputText id="counterparty" v-model.trim="lancamento.counterparty" />
            </div>
            <div class="field col-3">
                <label for="tipo" class="">Tipo</label>
                <InputText id="tipo" v-model="lancamento.type" />
            </div>
            <div class="field col-3">
                <label for="data" class="">Data</label>
                <Calendar :showIcon="true" showButtonBar locale="pt_BR" dateFormat="dd/mm/yy" v-model="lancamento.date">
                </Calendar>
            </div>
        </div>
        <div class="formgrid grid">
            <div class="field col-4">
                <label for="conta" class="">Conta</label>
                <InputText id="conta" v-model="lancamento.conta.name" />
            </div>
            <div class="field col-4">
                <label for="categoria" class="">Categoria</label>
                <InputText id="categoria" v-model="lancamento.category" />
            </div>
            <div class="field col-4">
                <label for="status" class="">Status</label>
                <InputText id="status" v-model="lancamento.status" />
            </div>
        </div>
        <template #footer>
            <Button label="Fechar" icon="pi pi-times" text="" @click="hideLancamentoDialog()" />
        </template>
    </Dialog>
</template>
