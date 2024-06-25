<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toolbar class="mb-4">
          <template v-slot:start>
            <div class="my-2">
              <Button
                label="Novo"
                icon="pi pi-plus"
                class="mr-2"
                severity="success"
                @click="openNew"
              />
              <Button
                label="Excluir"
                icon="pi pi-trash"
                severity="danger"
                @click="confirmDeleteSelected"
                :disabled="!selectedLancamentos || !selectedLancamentos.length"
              />
            </div>
          </template>
          <template v-slot:end>
            <Button
              label="Exportar"
              icon="pi pi-upload"
              severity="contrast"
              @click="exportCSV($event)"
            />
          </template>
        </Toolbar>
        <DataTable
          ref="dt"
          :value="lancamentos"
          v-model:selection="selectedLancamentos"
          dataKey="id"
          :paginator="true"
          :rows="10"
          :filters="filters"
          exportFilename="lancamentos"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Mostrando de {first} à {last} de {totalRecords} lançamentos"
          :sortField="sortField"
          :sortOrder="sortOrder"
          @sort="onSort"
        >
          <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
              <h5 class="m-0">Lançamentos</h5>
              <IconField iconPosition="left" class="block mt-2 md:mt-0">
                <InputIcon class="pi pi-search" />
                <InputText
                  class="w-full sm:w-auto"
                  v-model="filters['global'].value"
                  placeholder="Procurar..."
                />
              </IconField>
            </div>
          </template>
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column
            field="description"
            header="Descrição"
            :sortable="true"
            headerStyle="width:14%; min-width:10rem;"
          >
            <template #body="slotProps">
              <span class="p-column-title">Descrição</span>
              {{ slotProps.data.description }}
            </template>
          </Column>
          <Column
            field="category"
            header="Categoria"
            :sortable="true"
            headerStyle="width:14%; min-width:10rem;"
          >
            <template #body="slotProps">
              <span class="p-column-title">Categoria</span>
              {{ slotProps.data.category }}
            </template>
          </Column>
          <Column
            field="type"
            header="Tipo"
            :sortable="true"
            headerStyle="width:14%; min-width:10rem;"
          >
            <template #body="slotProps">
              <span class="p-column-title">Tipo</span>
              {{ slotProps.data.type }}
            </template>
          </Column>
          <Column
            field="value"
            header="Valor"
            :sortable="true"
            headerStyle="width:14%; min-width:8rem;"
          >
            <template #body="slotProps">
              <span class="p-column-title">Valor</span>
              {{ formatCurrency(slotProps.data.value) }}
            </template>
          </Column>
          <Column
            field="date"
            header="Data"
            dataType="date"
            :sortable="true"
            style="min-width: 10rem"
          >
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
            <template #filter="{ filterModel }">
              <Calendar
                v-model="filterModel.value"
                dateFormat="dd/mm/yy"
                placeholder="dd/mm/yyyy"
              />
            </template>
          </Column>
          <Column
            field="status"
            header="Status"
            :sortable="true"
            headerStyle="width:14%; min-width:10rem;"
          >
            <template #body="slotProps">
              <span class="p-column-title">Status</span>
              <Tag :severity="getBadgeSeverity(slotProps.data.status)">{{
                slotProps.data.status
              }}</Tag>
            </template>
          </Column>
          <Column headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                class="mr-2"
                severity="success"
                rounded
                @click="editLancamento(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="mt-2"
                severity="danger"
                rounded
                @click="confirmDeleteLancamento(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
        <Dialog
          v-model:visible="lancamentoDialog"
          :style="{ width: '1000px' }"
          header="Detalhes do lançamento"
          :modal="true"
          class="p-fluid"
        >
          <div class="formgrid grid">
            <div class="field col-9">
              <label for="descricao">Descrição</label>
              <InputText
                id="descricao"
                v-model.trim="lancamento.description"
                required="true"
                autofocus
                :invalid="submitted && !lancamento.description"
              />
              <small class="p-invalid" v-if="submitted && !lancamento.description"
                >Descrição é obrigatória.</small
              >
            </div>
            <div class="field col-3">
              <label for="valor">Valor</label>
              <InputNumber
                id="valor"
                v-model="lancamento.value"
                mode="currency"
                currency="BRL"
                locale="pt-BR"
                :invalid="submitted && !lancamento.value"
                :required="true"
              />
              <small class="p-invalid" v-if="submitted && !lancamento.value"
                >Valor é obrigatório.</small
              >
            </div>
          </div>
          <div class="formgrid grid">
            <div class="field col-6">
              <label for="counterparty">Favorecido / Pagador</label>
              <InputText
                id="counterparty"
                v-model.trim="lancamento.counterparty"
                required="true"
                autofocus
                :invalid="submitted && !lancamento.counterparty"
              />
              <small
                class="p-invalid"
                v-if="submitted && !lancamento.counterparty"
                >Favorecido / Pagador é obrigatório.</small
              >
            </div>
            <div class="field col-3">
              <label for="tipo" class="">Tipo</label>
              <Dropdown
                id="tipo"
                v-model="lancamento.type"
                :options="tipos"
                optionLabel="label"
                placeholder="Selecione um tipo"
                :invalid="submitted && !lancamento.type"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value && slotProps.value.value">
                    <span
                      :class="'product-badge status-' + slotProps.value.value"
                      >{{ slotProps.value.label }}</span
                    >
                  </div>
                  <div v-else-if="slotProps.value && !slotProps.value.value">
                    <span
                      :class="'product-badge status-' + slotProps.value.toLowerCase()"
                      >{{ slotProps.value }}</span
                    >
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
              </Dropdown>
              <small class="p-invalid" v-if="submitted && !lancamento.type">Tipo é obrigatório.</small>
            </div>
            <div class="field col-3">
              <label for="data" class="">Data</label>
              <Calendar
                :showIcon="true"
                showButtonBar
                locale="pt_BR"
                dateFormat="dd/mm/yy"
                v-model="lancamento.date"
                :invalid="submitted && !lancamento.date"
              ></Calendar>
              <small class="p-invalid" v-if="submitted && !lancamento.date">Data é obrigatória.</small>
            </div>
          </div>
          <div class="formgrid grid">
            <div class="field col-6">
              <label for="conta" class="">Conta</label>
              <Dropdown
                id="conta"
                v-model="lancamento.conta"
                :options="contas"
                optionLabel="label"
                placeholder="Selecione uma conta bancária"
                :invalid="submitted && !lancamento.conta"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value && slotProps.value.id">
                    <span
                      :class="'product-badge status-' + slotProps.value.id"
                      >{{ slotProps.value.label }}</span
                    >
                  </div>
                  <div v-else-if="slotProps.value && !slotProps.value.id">
                    <span
                      :class="'product-badge status-' + slotProps.value"
                      >{{ slotProps.value }}</span
                    >
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
              </Dropdown>
              <small class="p-invalid" v-if="submitted && !lancamento.conta">Conta é obrigatória.</small>
            </div>
            <div class="field col-6">
              <label for="categoria" class="">Categoria</label>
              <Dropdown
                id="categoria"
                v-model="lancamento.category"
                :options="categorias"
                optionLabel="label"
                placeholder="Selecione uma Categoria"
                :invalid="submitted && !lancamento.category"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value && slotProps.value.value">
                    <span
                      :class="'product-badge status-' + slotProps.value.value"
                      >{{ slotProps.value.label }}</span
                    >
                  </div>
                  <div v-else-if="slotProps.value && !slotProps.value.value">
                    <span
                      :class="'product-badge status-' + slotProps.value.toLowerCase()"
                      >{{ slotProps.value }}</span
                    >
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
              </Dropdown>
              <small class="p-invalid" v-if="submitted && !lancamento.category">Categoria é obrigatória.</small>
            </div>
          </div>
          <div class="formgrid grid">
            <div class="field col-6">
              <label for="status" class="">Status</label>
              <Dropdown
                id="status"
                v-model="lancamento.status"
                :options="statusOptions"
                optionLabel="label"
                placeholder="Selecione um Status"
                :invalid="submitted && !lancamento.status"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value && slotProps.value.value">
                    <span
                      :class="'product-badge status-' + slotProps.value.value"
                      >{{ slotProps.value.label }}</span
                    >
                  </div>
                  <div v-else-if="slotProps.value && !slotProps.value.value">
                    <span
                      :class="'product-badge status-' + slotProps.value.toLowerCase()"
                      >{{ slotProps.value }}</span
                    >
                  </div>
                  <span v-else>
                    {{ slotProps.placeholder }}
                  </span>
                </template>
              </Dropdown>
              <small class="p-invalid" v-if="submitted && !lancamento.status">Status é obrigatório.</small>
            </div>
          </div>
          <template #footer>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              text=""
              @click="hideDialog"
            />
            <Button
              label="Salvar"
              icon="pi pi-check"
              text=""
              @click="saveLancamento"
            />
          </template>
        </Dialog>
        <Dialog
          v-model:visible="deleteLancamentoDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="lancamento"
              >Tem certeza que deseja excluir
              <b>{{ lancamento.descricao }}</b
              >?</span
            >
          </div>
          <template #footer>
            <Button
              label="Não"
              icon="pi pi-times"
              text
              @click="deleteLancamentoDialog = false"
            />
            <Button
              label="Sim"
              icon="pi pi-check"
              text
              @click="deleteLancamento"
            />
          </template>
        </Dialog>
        <Dialog
          v-model:visible="deleteLancamentosDialog"
          :style="{ width: '450px' }"
          header="Confirm"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="lancamento"
              >Tem certeza que deseja excluir os lançamentos
              selecionados?</span
            >
          </div>
          <template #footer>
            <Button
              label="Não"
              icon="pi pi-times"
              text
              @click="deleteLancamentosDialog = false"
            />
            <Button
              label="Sim"
              icon="pi pi-check"
              text
              @click="deleteSelectedLancamentos"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "primevue/api";
import { ref, onMounted, onBeforeMount } from "vue";
import { useToast } from "primevue/usetoast";
import LancamentosService from "@/service/LancamentosService";
import UserService from "../../service/UserService";

const toast = useToast();
const userData = ref([]);
const lancamentos = ref([]);
const lancamentoDialog = ref(false);
const deleteLancamentoDialog = ref(false);
const deleteLancamentosDialog = ref(false);
const lancamento = ref({});
const selectedLancamentos = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);
// Dropdown Options
const statusOptions = ref([
  { label: "Pago", value: "STATUS_DESPESA_PAGO" },
  { label: "Recebido", value: "STATUS_RECEITA_RECEBIDO" },
  { label: "A pagar", value: "STATUS_DESPESA_APAGAR" },
  { label: "A receber", value: "STATUS_RECEITA_ARECEBER" },
  { label: "Atrasado", value: "STATUS_ATRASADO" },
]);
const tipos = ref([
  { label: "Despesa", value: "TYPE_DESPESA" },
  { label: "Receita", value: "TYPE_RECEITA" },
]);
const contas = ref([]);
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


onBeforeMount(() => {
  initFilters();
});

onMounted(async () => {
  await loadLancamentos();
});

const loadLancamentos = async () => {
  try {
    userData.value = await UserService.getUser();
    contas.value = userData.value.contas.map(conta => ({label: conta.name, id: conta.id}))
    lancamentos.value = userData.value.contas
    .flatMap(conta => conta.movimentacoes
    .map(movimentacao => ({...movimentacao, conta: {id: conta.id, name: conta.name}})))

    lancamentos.value = lancamentos.value.map(lancamento => {
      return lancamento;
    }
  );

  } catch (error) {
    console.error("Erro ao carregar lançamentos:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao carregar lançamentos.",
      life: 3000,
    });
  }
}

const formatCurrency = (value) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const openNew = () => {
  lancamento.value = {};
  submitted.value = false;
  lancamentoDialog.value = true;
};

const hideDialog = () => {
  lancamentoDialog.value = false;
  submitted.value = false;
};

const saveLancamento = async () => {
  submitted.value = true;

  if (
    lancamento.value.description &&
    lancamento.value.description.trim() &&
    lancamento.value.value
  ) {
    try {
      if (lancamento.value.id) {
        await LancamentosService.updateMovimentacao(
          lancamento.value.id,
          lancamento.value
        );
        toast.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Lançamento atualizado com sucesso.",
          life: 3000,
        });
      } else { 

        console.log(lancamento.value)

        lancamento.value = {
          ...lancamento.value,
          date: new Date(lancamento.value.date),
          category: categorias.value.find(categoria => categoria.label === lancamento.value.category.label).value,
          status: statusOptions.value.find(status => status.label === lancamento.value.status.label).value,
          type: tipos.value.find(tipo => tipo.label === lancamento.value.type.label).value,
          conta: contas.value.find(conta => conta.label === lancamento.value.conta.label)
        };

        await LancamentosService.create(lancamento.value);
        toast.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Lançamento criado com sucesso.",
          life: 3000,
        });
      }
      await loadLancamentos();
      hideDialog();
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error);
      toast.add({
        severity: "error",
        summary: "Erro",
        detail:
          "Erro ao salvar lançamento. Verifique os dados informados.",
        life: 3000,
      });
    }
  }
};

const editLancamento = (lancamentoToEdit) => {
  console.log(lancamentoToEdit)
lancamento.value = {
  ...lancamentoToEdit,
  date: new Date(lancamentoToEdit.date),
  category: categorias.value.find(categoria => categoria.label === lancamentoToEdit.category),
  status: statusOptions.value.find(status => status.label === lancamentoToEdit.status),
  type: tipos.value.find(tipo => tipo.label === lancamentoToEdit.type),
  conta: contas.value.find(conta => conta.label === lancamentoToEdit.conta.name)
};
lancamentoDialog.value = true;
};

const confirmDeleteLancamento = (lancamentoToDelete) => {
  lancamento.value = lancamentoToDelete;
  deleteLancamentoDialog.value = true;
};

const deleteLancamento = async () => {
  try {
    await LancamentosService.deleteMovimentacao(lancamento.value.id);
    await loadLancamentos();
    deleteLancamentoDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Lançamento excluído com sucesso.",
      life: 3000,
    });
  } catch (error) {
    console.error("Erro ao excluir lançamento:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao excluir lançamento.",
      life: 3000,
    });
  }
};

const confirmDeleteSelected = () => {
  deleteLancamentosDialog.value = true;
};

const deleteSelectedLancamentos = async () => {
  try {
    for (const lancamentoToDelete of selectedLancamentos.value) {
      await LancamentosService.deleteMovimentacao(lancamentoToDelete.id);
    }
    await loadLancamentos();
    deleteLancamentosDialog.value = false;
    selectedLancamentos.value = null;
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Lançamentos excluídos com sucesso.",
      life: 3000,
    });
  } catch (error) {
    console.error("Erro ao excluir lançamentos:", error);
    toast.add({
      severity: "error",
      summary: "Erro",
      detail: "Erro ao excluir lançamentos.",
      life: 3000,
    });
  }
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pt-BR");
};

const getBadgeSeverity = (status) => {
  const statusMap = {
    "pago": "success",
    "recebido": "success",
    "a receber": "warning",
    "a pagar": "warning",
    "atrasado": "danger",
  };
  return statusMap[status.toLowerCase()] || "info";
};

const exportCSV = () => {
  console.log(dt.value)
  dt.value.exportCSV();
};
</script>