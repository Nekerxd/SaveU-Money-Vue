<script setup>
import { FilterMatchMode } from "primevue/api";
import { ref, onMounted, onBeforeMount, computed } from "vue";
import { useToast } from "primevue/usetoast";
import UserService from "../service/UserService";
import MetasService from "../service/MetasService";

const toast = useToast();
const userData = ref([]);
const metas = ref([]);
const meta = ref({});
const metaDialog = ref(false);
const submitted = ref(false);
const selectedMetas = ref(null);
const deleteMetasDialog = ref(false);
const deleteMetaDialog = ref(false);
const lancamentos = ref([]);

const dt = ref(null);
const filters = ref({});

const tipos = ref([
  { label: "Despesa", value: "ROLE_DESPESA" },
  { label: "Receita", value: "ROLE_RECEITA" },
]);

const categorias = ref([
{ label: "Alimentação", value: "CATEGORY_DESPESA_ALIMENTACAO" },
{ label: "Lazer", value: "CATEGORY_DESPESA_LAZER" },
{ label: "Moradia", value: "CATEGORY_DESPESA_MORADIA" },
{ label: "Transporte", value: "CATEGORY_DESPESA_TRANSPORTE" },
{ label: "Saúde", value: "CATEGORY_DESPESA_SAUDE" },
{ label: "Educação", value: "CATEGORY_DESPESA_EDUCACAO" },
{ label: "Vestuário", value: "CATEGORY_DESPESA_VESTUARIO" },
{ label: "Serviços", value: "CATEGORY_DESPESA_SERVICOS" },
{ label: "Imprevistos", value: "CATEGORY_DESPESA_IMPREVISTOS" },
{ label: "Seguros", value: "CATEGORY_DESPESA_SEGUROS" },
{ label: "Taxas", value: "CATEGORY_DESPESA_TAXAS" },
{ label: "Empréstimos", value: "CATEGORY_DESPESA_EMPRESTIMOS" },
{ label: "Diversos", value: "CATEGORY_DESPESA_DIVERSOS" },
{ label: "Viagem", value: "CATEGORY_DESPESA_VIAGEM" },
{ label: "Investimentos", value: "CATEGORY_DESPESA_INVESTIMENTOS" },
{ label: "Doações", value: "CATEGORY_DESPESA_DOACOES" },
{ label: "Utilidades", value: "CATEGORY_DESPESA_UTILIDADES" },
{ label: "Assinaturas", value: "CATEGORY_DESPESA_ASSINATURAS" },
{ label: "Higiene", value: "CATEGORY_DESPESA_HIGIENE" },
{ label: "Pets", value: "CATEGORY_DESPESA_PETS" },
{ label: "Ferramentas", value: "CATEGORY_DESPESA_FERRAMENTAS" },
{ label: "Outras Despesas", value: "CATEGORY_DESPESA_OUTRAS_DESPESAS" },
{ label: "Salário", value: "CATEGORY_RECEITA_SALARIO" },
{ label: "Freelancer", value: "CATEGORY_RECEITA_FREELANCER" },
{ label: "Investimentos", value: "CATEGORY_RECEITA_INVESTIMENTOS" },
{ label: "Aluguel", value: "CATEGORY_RECEITA_ALUGUEL" },
{ label: "Prêmios", value: "CATEGORY_RECEITA_PREMIOS" },
{ label: "Presentes", value: "CATEGORY_RECEITA_PRESENTES" },
{ label: "Pensões", value: "CATEGORY_RECEITA_PENSOES" },
{ label: "Dividendos", value: "CATEGORY_RECEITA_DIVIDENDOS" },
{ label: "Juros", value: "CATEGORY_RECEITA_JURUS" },
{ label: "Venda", value: "CATEGORY_RECEITA_VENDA" },
{ label: "Reembolso", value: "CATEGORY_RECEITA_REEMBOLSO" },
{ label: "Outras Receitas", value: "CATEGORY_RECEITA_OUTRAS_RECEITAS" },
]);

const categoriasPorTipo = () => {
  const result = {};
  categorias.forEach(categoria => {
    if (!result[categoria.type]) {
      result[categoria.type] = [];
    }
    result[categoria.type].push(categoria);
  });
  return result;
};

const categoriasFiltradas = ref([]);

// Função para atualizar as categorias quando o tipo muda
const updateCategorias = () => {
  categoriasFiltradas.value = categoriasPorTipo.value[meta.type] || [];
};

onMounted(async () => {
  await loadLancamentos();  
  await loadMetas();  
});

const loadMetas = async () => {
  try {
    userData.value = await UserService.getUser();
    metas.value = userData.value.metas.map(meta => ({
      ...meta,
      progress: calcMetaProgress(meta)
    }))
    console.log(metas)
  } catch (error) {
    console.error("Erro ao carregar metas:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao carregar metas.",
      life: 3000,
    });
  }
}

const loadLancamentos = async () => {
  userData.value = await UserService.getUser();
  lancamentos.value = userData.value.contas.flatMap(conta => conta.movimentacoes
  .map(movimentacao => ({...movimentacao, conta: {id: conta.id, name: conta.name}})))
  
  return lancamentos.value
}

const calcMetaProgress = (meta) => {
  const startDate = new Date(meta.startDate);
  const endDate = new Date(meta.endDate);
  let total = lancamentos.value
    .filter(lancamento => {
      const lancamentoDate = new Date(lancamento.date);
      const validStatus = ['A pagar', 'A receber', 'Atrasado'];
      if (lancamentoDate >= startDate && lancamentoDate <= endDate && lancamento.category === meta.category && lancamento.type === meta.role && !validStatus.includes(lancamento.status)) {
        return true;
      }
      return false;
    })
    .reduce((sum, lancamento) => sum + lancamento.value, 0);
  total = (total * 100 / meta.goal).toFixed(0)
  return total > 100 ? 100 : total;
}

const editMeta = (metaToEdit) => {
  console.log(metaToEdit)
meta.value = {
  ...metaToEdit,
  date: [new Date(metaToEdit.startDate), new Date(metaToEdit.endDate)],
  category: categorias.value.find(categoria => categoria.label === metaToEdit.category),
  role: tipos.value.find(tipo => tipo.label === metaToEdit.role)
};
metaDialog.value = true;
};
   
const saveMeta = async () => {
  submitted.value = true;

  if (
    meta.value.title &&
    meta.value.title.trim() &&
    meta.value.goal
  ) {
    try {
      if (meta.value.id) {
        meta.value = {
          ...meta.value,
          usuario: {
            id: localStorage.getItem('userId')
          },
          startDate: meta.value.date[0],
          endDate: meta.value.date[1],
          category: meta.value.category.value,
          role: meta.value.role.value
        }
        await MetasService.updateMovimentacao(
          meta.value.id,
          meta.value
        );
        toast.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Meta atualizada com sucesso.",
          life: 3000,
        });
      } else {
        console.log(meta.value)
        meta.value = {
          ...meta.value,
          usuario: {
            id: localStorage.getItem('userId')
          },
          startDate: meta.value.date[0],
          endDate: meta.value.date[1],
          category: categorias.value.find(categoria => categoria.label === meta.value.category.label).value,
          role: meta.value.role.value,
        };
        console.log(meta.value)

        await MetasService.create(meta.value);
        toast.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Meta criada com sucesso.",
          life: 3000,
        });
      }
      await loadMetas();
      hideDialog();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast.add({
        severity: "error",
        summary: "Erro",
        detail:
          "Erro ao salvar meta. Verifique os dados informados.",
        life: 3000,
      });
    }
  }
};

const hideDialog = () => {
  metaDialog.value = false;
  submitted.value = false;
};

const characterLimit = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatCurrency = (value) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

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

const menu = ref(null);

const items = [
  {
    label: 'Editar',
    icon: 'pi pi-fw pi-pencil',
    command: () => {
      editMeta(meta.value)
    },
  },
  {
    label: 'Excluir',
    icon: 'pi pi-fw pi-trash',
    command: () => {
      confirmDeleteMeta(meta.value);
    },
  },
];

const confirmDeleteMeta = (metaToDelete) => {
  meta.value = metaToDelete;
  deleteMetaDialog.value = true;
};

const showMenu = (event, metaMenu) => {
  if (menu.value) {
    meta.value = metaMenu
    menu.value.show(event);
  }
};

const openNew = () => {
  meta.value = {};
  submitted.value = false;
  metaDialog.value = true;
};

const confirmDeleteSelected = () => {
  deleteMetasDialog.value = true;
};

const deleteSelectedMetas = async () => {
  console.log(selectedMetas)
  try {
    for (const metaToDelete of selectedMetas.value) {
      await MetasService.deleteMeta(metaToDelete);
    }
    await loadMetas();
    deleteMetasDialog.value = false;
    selectedMetas.value = null;
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Metas excluídas com sucesso.",
      life: 3000,
    });
  } catch (error) {
    console.error("Erro ao excluir metas:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao excluir metas.",
      life: 3000,
    });
  }
};

const deleteMeta = async () => {
  try {
    await MetasService.deleteMeta(meta.value.id);
    await loadMetas();
    deleteMetaDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Meta excluída com sucesso.",
      life: 3000,
    });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao excluir meta.",
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="card">
    <Toolbar class="mb-4">
      <template v-slot:start>
        <div class="my-2">
          <Button label="Novo" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" />
          <Button label="Excluir" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
            :disabled="!selectedMetas || !selectedMetas.length" />
        </div>
      </template>
    </Toolbar>
    <div class="flex justify-content-between align-items-center mb-3">
      <h2>Metas atuais</h2>
    </div>
    <div class="p-grid">
      <div v-for="meta in metas" :key="meta.id">
        <div class="card meta-card">
          <div class="flex justify-content-between align-items-center mb-1">
            <div>
              <Checkbox v-model="selectedMetas" :value="meta.id" />
            </div>
            <div>
              <Button class="p-button-text p-button-rounded" type="button" icon="pi pi-ellipsis-v"
                @click="showMenu($event, meta)" aria-haspopup="true" aria-controls="overlay_menu" text />
            </div>
          </div>

          <div class="flex justify-content-center mb-5">
            <Knob v-model="meta.progress" valueTemplate="{value}%" size="150" showValue="" max="100" shape="card.shape"
              textColor="#000" rangeColor="#e2e8f0" :valueColor="calculateValueColor(meta.progress, meta.role)" step="1"
              angle="180" />
          </div>

          <div class="card-body" :v-slot="end">
            <div class="card-title flex justify-content-between align-items-center">
              <h5 class="">{{ characterLimit(meta.title, 30) }}</h5>
              <h5 class="">{{ formatCurrency(meta.goal) }}</h5>
            </div>
            <p class="p-text-center">{{ characterLimit(meta.description, 87) }}</p>
          </div>
        </div>
      </div>
      <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
    </div>
    <Dialog v-model:visible="metaDialog" :style="{ width: '1000px' }" header="Detalhes da meta" :modal="true"
      class="p-fluid">
      <div class="formgrid grid">
        <div class="field col-9">
          <label for="descricao">Título</label>
          <InputText id="descricao" v-model.trim="meta.title" required="true" autofocus
            :invalid="submitted && !meta.title" />
          <small class="p-invalid" v-if="submitted && !meta.title">Título é obrigatório.</small>
        </div>
        <div class="field col-3">
          <label for="valor">Valor</label>
          <InputNumber id="valor" v-model="meta.goal" mode="currency" currency="BRL" locale="pt-BR"
            :invalid="submitted && !meta.goal" :required="true" />
          <small class="p-invalid" v-if="submitted && !meta.goal">Valor é obrigatório.</small>
        </div>
        <div class="field col-12">
          <label for="descricao">Descrição</label>
          <Textarea rows="2" autoResize id="descricao" v-model.trim="meta.description" required="true" autofocus
            :invalid="submitted && !meta.description" />
          <small class="p-invalid" v-if="submitted && !meta.description">Descrição é obrigatória.</small>
        </div>
        <div class="formgrid grid">
        </div>
        <div class="field col-4">
          <label for="tipo" class="">Tipo</label>
          <Dropdown id="tipo" v-model="meta.role" :options="tipos" optionLabel="label" placeholder="Selecione um tipo"
            :invalid="submitted && !meta.role">
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.role">
                <span :class="'product-badge status-' + slotProps.value.role">{{ slotProps.value.label }}</span>
              </div>
              <div v-else-if="slotProps.value && !slotProps.value.role">
                <span :class="'product-badge status-' + slotProps.value">{{ slotProps.value.label }}</span>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Dropdown>
          <small class="p-invalid" v-if="submitted && !meta.role">Tipo é obrigatório.</small>
        </div>
        <div class="field col-4">
          <label for="tipo" class="">Categoria</label>
          <Dropdown id="tipo" v-model="meta.category" :options="categorias" optionLabel="label"
            placeholder="Selecione uma categoria" :invalid="submitted && !meta.category">
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.category">
                <span :class="'product-badge status-' + slotProps.value.category">{{ slotProps.value.label }}</span>
              </div>
              <div v-else-if="slotProps.value && !slotProps.value.category">
                <span :class="'product-badge status-' + slotProps.value">{{ slotProps.value.label }}</span>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </Dropdown>
          <small class="p-invalid" v-if="submitted && !meta.category">Categoria é obrigatória.</small>
        </div>
        <div class="field col-4">
          <label for="data" class="">Data</label>
          <Calendar locale="pt-BR" :showIcon="true" selectionMode="range" :manualInput="false" showButtonBar
            dateFormat="dd/mm/yy" v-model="meta.date"
            :invalid="submitted && (!meta.date || !meta.date[0] || !meta.date[1])"></Calendar>
          <small class="p-invalid" v-if="submitted && !meta.category">Insira data de início e fim.</small>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" text="" @click="hideDialog" />
        <Button label="Salvar" icon="pi pi-check" text="" @click="saveMeta" />
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteMetaDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="meta">Tem certeza que deseja excluir
          <b>{{ meta.title }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteMetaDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteMeta" />
      </template>
    </Dialog>
    <Dialog v-model:visible="deleteMetasDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="meta">Tem certeza que deseja excluir os metas selecionadas?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteMetasDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedMetas" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Estilos para o grid */
.p-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
  gap: 20px;
}

.card .meta-card {
  padding-top: 1rem;
  padding-right: 1rem;
  height: 25rem;
}

.card-title {
  max-width: 95%;
}
.card-title > h5 {
  margin: 0;
}

.card-body {
  max-width: 100%;
  overflow: hidden;
}

.selected-card {
  border: 2px solid blue;
}
</style>