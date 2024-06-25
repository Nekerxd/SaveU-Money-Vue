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
                  :disabled="!selectedContas || !selectedContas.length"
                />
              </div>
            </template>
          </Toolbar>
          <DataTable
            ref="dt"
            :value="contas"
            v-model:selection="selectedContas"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando de {first} à {last} de {totalRecords} contas"
          >
            <template #header>
              <div
                class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
              >
                <h5 class="m-0">Contas</h5>
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
              field="name"
              header="Nome"
              :sortable="true"
              headerStyle="width: 20%; min-width: 10rem"
            >
              <template #body="slotProps">
                <span class="p-column-title">Nome</span>
                {{ slotProps.data.name }}
              </template>
            </Column>
            <Column
              field="banco.name"
              header="Banco"
              :sortable="true"
              headerStyle="width: 20%; min-width: 10rem"
            >
              <template #body="slotProps">
                <span class="p-column-title">Banco</span>
                {{ slotProps.data.banco.name }}
              </template>
            </Column>
            <Column
              field="tipo"
              header="Tipo"
              :sortable="true"
              headerStyle="width: 15%; min-width: 8rem"
            >
              <template #body="slotProps">
                <span class="p-column-title">Tipo</span>
                {{ slotProps.data.type }}
              </template>
            </Column>
            <Column
              field="saldo"
              header="Saldo"
              :sortable="true"
              headerStyle="width: 15%; min-width: 8rem"
            >
              <template #body="slotProps">
                <span class="p-column-title">Saldo</span>
                {{ formatCurrency(slotProps.data.balance) }}
              </template>
            </Column>
            <Column headerStyle="min-width: 10rem">
              <template #body="slotProps">
                <Button
                  icon="pi pi-pencil"
                  class="mr-2"
                  severity="success"
                  rounded
                  @click="editConta(slotProps.data)"
                />
                <Button
                  icon="pi pi-trash"
                  class="mt-2"
                  severity="danger"
                  rounded
                  @click="confirmDeleteConta(slotProps.data)"
                />
              </template>
            </Column>
          </DataTable>
  
          <Dialog
            v-model:visible="contaDialog"
            :style="{ width: '500px' }"
            header="Detalhes da Conta"
            :modal="true"
            class="p-fluid"
          >
            <div class="formgrid grid">
              <div class="field col-12">
                <label for="nome">Nome</label>
                <InputText
                  id="nome"
                  v-model.trim="conta.name"
                  required="true"
                  autofocus
                  :invalid="submitted && !conta.name"
                />
                <small class="p-invalid" v-if="submitted && !conta.name"
                  >Nome é obrigatório.</small
                >
              </div>
              <div class="field col-12">
                <label for="tipo">Tipo</label>
                <Dropdown
                  id="tipo"
                  v-model="conta.type"
                  :options="tipos"
                  optionLabel="label"
                  placeholder="Selecione um tipo"
                  :invalid="submitted && !conta.type"
                />
                <small class="p-invalid" v-if="submitted && !conta.type"
                  >Tipo é obrigatório.</small
                >
              </div>
              <div class="field col-12">
                <label for="banco">Banco</label>
                <AutoComplete
                  v-model="conta.banco"
                  optionLabel="fullName"
                  :suggestions="filteredBancos"
                  :dropdown="true"
                  placeholder="Pesquisar banco"
                  :minLength="1"
                  :forceSelection="true"
                  :invalid="submitted && !conta.banco"
                  @complete="filterBancos"
                />
                <small class="p-invalid" v-if="submitted && !conta.banco">
                  Banco é obrigatório.
                </small>
              </div>
              <div class="field col-12">
                <label for="saldo">Saldo Inicial</label>
                <InputNumber
                  id="saldo"
                  v-model="conta.balance"
                  mode="currency"
                  currency="BRL"
                  locale="pt-BR"
                  :invalid="submitted && !conta.balance"
                />
                <small class="p-invalid" v-if="submitted && !conta.balance"
                  >O saldo é obrigatório.</small
                >
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
                @click="saveConta"
              />
            </template>
          </Dialog>
  
          <Dialog
            v-model:visible="deleteContaDialog"
            :style="{ width: '450px' }"
            header="Confirmar"
            :modal="true"
          >
            <div class="flex align-items-center justify-content-center">
              <i
                class="pi pi-exclamation-triangle mr-3"
                style="font-size: 2rem"
              />
              <span v-if="conta"
                >Tem certeza que deseja excluir a conta
                <b>{{ conta.name }}</b
                >?</span
              >
            </div>
            <template #footer>
              <Button
                label="Não"
                icon="pi pi-times"
                text
                @click="deleteContaDialog = false"
              />
              <Button
                label="Sim"
                icon="pi pi-check"
                text
                @click="deleteConta"
              />
            </template>
          </Dialog>
  
          <Dialog
            v-model:visible="deleteContasDialog"
            :style="{ width: '450px' }"
            header="Confirmar"
            :modal="true"
          >
            <div class="flex align-items-center justify-content-center">
              <i
                class="pi pi-exclamation-triangle mr-3"
                style="font-size: 2rem"
              />
              <span v-if="conta"
                >Tem certeza que deseja excluir as contas
                selecionadas?</span
              >
            </div>
            <template #footer>
              <Button
                label="Não"
                icon="pi pi-times"
                text
                @click="deleteContasDialog = false"
              />
              <Button
                label="Sim"
                icon="pi pi-check"
                text
                @click="deleteSelectedContas"
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
  import ContasService from "@/service/ContasService";
  import UserService from "@/service/UserService";
  
  const toast = useToast();
  const contas = ref([]);
  const bancos = ref([]);
  const tipos = ref([
    { label: "Corrente", value: "TYPE_CORRENTE" },
    { label: "Crédito", value: "TYPE_CREDITO" },
    { label: "Aplicação", value: "TYPE_APLICACAO" },
    { label: "Refeição", value: "TYPE_REFEICAO" }
  ]);
  const contaDialog = ref(false);
  const deleteContaDialog = ref(false);
  const deleteContasDialog = ref(false);
  const conta = ref({});
  const selectedContas = ref(null);
  const dt = ref(null);
  const filters = ref({});
  const submitted = ref(false);
  
  onBeforeMount(() => {
    initFilters();
  });
  
  onMounted(async () => {
    await loadContas();
    await loadBancos();
  });
  
  const loadContas = async () => {
    try {
      const userData = await UserService.getUser();
      
      contas.value = userData.contas;
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar contas.",
        life: 3000,
      });
    }
  };
  
  const loadBancos = async () => {
    try {
      bancos.value = await ContasService.getBancos();
    } catch (error) {
      console.error("Erro ao carregar bancos:", error);
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao carregar bancos.",
        life: 3000,
      });
    }
  };

  const filteredBancos = ref(bancos.value.map(banco => banco.name)); 

  const filterBancos = () => {
    if (conta.value.banco === '' || conta.value.banco === undefined) {
      filteredBancos.value = bancos.value;
    } else {
      const query = typeof conta.value.banco === 'object' ? conta.value.banco : conta.value.banco.toLowerCase()
      filteredBancos.value = bancos.value
        .filter(banco => banco.name.toLowerCase().includes(query));
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) {
      return "R$ 0,00";
    }
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };
  
  const openNew = () => {
    conta.value = {};
    submitted.value = false;
    contaDialog.value = true;
  };
  
  const hideDialog = () => {
    contaDialog.value = false;
    submitted.value = false;
  };
  
  const saveConta = async () => {
    submitted.value = true;
  
    if (conta.value.name && conta.value.name.trim() && conta.value.banco) {
      const contaDto = {
            ...conta.value,
            usuario: {
                id: localStorage.getItem('userId'),
            },
            type: conta.value.type.value
          }
      try {
        if (conta.value.id) {
          
          console.log(contaDto)
          await ContasService.updateConta(conta.value.id, contaDto);
          toast.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Conta atualizada com sucesso.",
            life: 3000,
          });
        } else {
          console.log(contaDto)
          await ContasService.create(contaDto);
          toast.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Conta criada com sucesso.",
            life: 3000,
          });
        }
        await loadContas();
        hideDialog();
      } catch (error) {
        console.error("Erro ao salvar conta:", error);
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao salvar conta. Verifique os dados informados.",
          life: 3000,
        });
      }
    }
  };
  
  const editConta = (contaToEdit) => {
    conta.value = { ...contaToEdit };
    conta.value.type = tipos.value.find(tipo => tipo.label === conta.value.type)
    contaDialog.value = true;
  };
  
  const confirmDeleteConta = (contaToDelete) => {
    conta.value = contaToDelete;
    deleteContaDialog.value = true;
  };
  
  const deleteConta = async () => {
    try {
      await ContasService.deleteConta(conta.value.id);
      await loadContas();
      deleteContaDialog.value = false;
      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Conta excluída com sucesso.",
        life: 3000,
      });
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao excluir conta.",
        life: 3000,
      });
    }
  };
  
  const confirmDeleteSelected = () => {
    deleteContasDialog.value = true;
  };
  
  const deleteSelectedContas = async () => {
    try {
      for (const contaToDelete of selectedContas.value) {
        await ContasService.deleteConta(contaToDelete.id);
      }
      await loadContas();
      deleteContasDialog.value = false;
      selectedContas.value = null;
      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Contas excluídas com sucesso.",
        life: 3000,
      });
    } catch (error) {
      console.error("Erro ao excluir contas:", error);
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao excluir contas.",
        life: 3000,
      });
    }
  };
  
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
  };
  </script>