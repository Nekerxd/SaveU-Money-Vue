<template>
     <div class="p-grid p-justify-center">
    <div class="p-col-12 p-md-6">
      <Card>
        <h2>Progresso da Meta</h2>
        <div v-for="goal in goals" :key="goal.name" class="p-field">
          <h3>{{ goal.name }}</h3>
          <p>Meta: R$ {{ 5000 }}</p>
          <ProgressBar :value="60" />
        </div>
      </Card>
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