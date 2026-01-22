<script setup>
import { ref, onMounted } from 'vue'
import { mdiStore, mdiPencil, mdiTrashCan, mdiPlus } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import api from '@/services/api'

const products = ref([])
const isModalActive = ref(false)
const isDeleteModalActive = ref(false)
const isLoading = ref(false)

const categories = [
  { id: 'vestido', label: 'Vestidos' },
  { id: 'conjunto-fleece', label: 'Conjuntos Fleece' },
  { id: 'fantasia', label: 'Fantasias' },
  { id: 'conjunto-casual', label: 'Conjuntos Casuais' },
  { id: 'conserto', label: 'Consertos e Ajustes' },
  { id: 'outros', label: 'Outros' },
]

const defaultProduct = {
  id: null,
  nome: '',
  descricao: '',
  categoria: 'vestido',
  precoMedio: 0,
  imagemUrl: '',
}

const currentProduct = ref({ ...defaultProduct })
const productToDelete = ref(null)

const fetchProducts = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/produtos/meus')
    products.value = response.data
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    alert('Erro ao carregar produtos.')
  } finally {
    isLoading.value = false
  }
}

const openModal = (product = null) => {
  if (product) {
    currentProduct.value = { ...product }
  } else {
    currentProduct.value = { ...defaultProduct }
  }
  isModalActive.value = true
}

const openDeleteModal = (product) => {
  productToDelete.value = product
  isDeleteModalActive.value = true
}

const submitProduct = async () => {
  try {
    const payload = {
      nome: currentProduct.value.nome,
      descricao: currentProduct.value.descricao,
      categoria: currentProduct.value.categoria,
      precoMedio: parseFloat(currentProduct.value.precoMedio),
      imagemUrl: currentProduct.value.imagemUrl,
    }

    if (currentProduct.value.id) {
      await api.put(`/produtos/${currentProduct.value.id}`, payload)
    } else {
      await api.post('/produtos', payload)
    }

    isModalActive.value = false
    await fetchProducts()
  } catch (error) {
    console.error('Erro ao salvar produto:', error)
    alert('Erro ao salvar produto.')
  }
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  try {
    await api.delete(`/produtos/${productToDelete.value.id}`)
    isDeleteModalActive.value = false
    await fetchProducts()
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    alert('Erro ao excluir produto.')
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiStore" title="Meus Produtos" main>
        <BaseButton
          :icon="mdiPlus"
          label="Novo Produto"
          color="contrast"
          rounded-full
          small
          @click="openModal()"
        />
      </SectionTitleLineWithButton>

      <CardBox class="mb-6" has-table>
        <div v-if="isLoading" class="p-4 text-center text-gray-500">Carregando...</div>
        <div v-else-if="products.length === 0" class="p-4 text-center text-gray-500">
          Você ainda não tem produtos cadastrados.
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço Médio</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td class="border-b-0 before:hidden lg:w-6">
                <div
                  class="mx-auto h-24 w-24 overflow-hidden rounded-full border border-gray-200 lg:h-12 lg:w-12"
                >
                  <img
                    :src="product.imagemUrl || 'https://via.placeholder.com/150'"
                    :alt="product.nome"
                    class="h-full w-full object-cover"
                  />
                </div>
              </td>
              <td data-label="Nome">
                {{ product.nome }}
              </td>
              <td data-label="Categoria">
                {{ product.categoria }}
              </td>
              <td data-label="Preço">R$ {{ product.precoMedio.toFixed(2) }}</td>
              <td class="whitespace-nowrap before:hidden lg:w-1">
                <BaseButtons type="justify-start lg:justify-end" no-wrap>
                  <BaseButton color="info" :icon="mdiPencil" small @click="openModal(product)" />
                  <BaseButton
                    color="danger"
                    :icon="mdiTrashCan"
                    small
                    @click="openDeleteModal(product)"
                  />
                </BaseButtons>
              </td>
            </tr>
          </tbody>
        </table>
      </CardBox>
    </SectionMain>

    <!-- Modal de Edição/Criação -->
    <CardBoxModal
      v-model="isModalActive"
      :title="currentProduct.id ? 'Editar Produto' : 'Novo Produto'"
      button="info"
      button-label="Salvar"
      has-cancel
      @confirm="submitProduct"
    >
      <FormField label="Nome do Produto">
        <FormControl v-model="currentProduct.nome" placeholder="Ex: Vestido de Festa" required />
      </FormField>

      <FormField label="Descrição">
        <FormControl
          v-model="currentProduct.descricao"
          type="textarea"
          placeholder="Descreva o produto..."
        />
      </FormField>

      <FormField label="Categoria">
        <FormControl v-model="currentProduct.categoria" type="select" :options="categories" />
      </FormField>

      <FormField label="Preço Médio (R$)">
        <FormControl v-model="currentProduct.precoMedio" type="number" step="0.01" />
      </FormField>

      <FormField label="URL da Imagem">
        <FormControl v-model="currentProduct.imagemUrl" placeholder="https://..." />
      </FormField>
    </CardBoxModal>

    <!-- Modal de Exclusão -->
    <CardBoxModal
      v-model="isDeleteModalActive"
      title="Confirmar Exclusão"
      button="danger"
      button-label="Excluir"
      has-cancel
      @confirm="deleteProduct"
    >
      <p>
        Tem certeza que deseja excluir o produto <b>{{ productToDelete?.nome }}</b
        >?
      </p>
      <p>Esta ação não pode ser desfeita.</p>
    </CardBoxModal>
  </LayoutAuthenticated>
</template>
