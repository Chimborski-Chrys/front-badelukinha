<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { mdiCommentQuote, mdiAlertCircle, mdiCheckCircle } from '@mdi/js'
import CardBox from '@/components/CardBox.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import FormField from '@/components/FormField.vue'
import FormControl from '@/components/FormControl.vue'
import StarRating from '@/components/StarRating.vue'
import CardBoxComponentEmpty from '@/components/CardBoxComponentEmpty.vue'
import { GoogleSignInButton } from 'vue3-google-signin'

const props = defineProps({
  costureiraId: {
    type: String,
    required: true
  }
})

const reviews = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const feedbackMsg = ref('')
const isError = ref(false)

const newReview = ref({
  nota: 0,
  comentario: ''
})

const fetchReviews = async () => {
  isLoading.value = true
  try {
    const response = await api.get(`/avaliacoes/${props.costureiraId}`)
    reviews.value = response.data
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGoogleSuccess = async (response) => {
  if (newReview.value.nota === 0) {
    isError.value = true
    feedbackMsg.value = 'Por favor, selecione uma nota antes de enviar.'
    return
  }

  const { credential } = response
  isSubmitting.value = true
  feedbackMsg.value = ''
  
  try {
    const payload = {
      costureiraId: props.costureiraId,
      nota: newReview.value.nota,
      comentario: newReview.value.comentario,
      googleIdToken: credential
    }
    const apiResponse = await api.post('/avaliacoes', payload)
    
    feedbackMsg.value = apiResponse.data.message
    isError.value = false
    
    if (apiResponse.data.status === 'aprovada') {
      await fetchReviews()
    }

    newReview.value.nota = 0
    newReview.value.comentario = ''
  } catch (error) {
    console.error('Erro ao enviar avaliação:', error)
    isError.value = true
    feedbackMsg.value = error.response?.data?.message || 'Erro ao enviar avaliação.'
  } finally {
    isSubmitting.value = false
  }
}

const handleGoogleError = () => {
  isError.value = true
  feedbackMsg.value = 'Falha ao autenticar com Google. Tente novamente.'
}

onMounted(() => {
  fetchReviews()
})
</script>

<template>
  <div class="space-y-6 mt-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold flex items-center">
        <BaseIcon :path="mdiCommentQuote" class="mr-2" />
        O que os clientes dizem
      </h2>
    </div>

    <!-- Lista de Avaliações -->
    <div v-if="isLoading" class="text-center py-6 text-gray-500 italic">
      Carregando avaliações...
    </div>

    <div v-else-if="reviews.length === 0" class="text-center">
      <CardBoxComponentEmpty>
        <p>Ainda não há avaliações para este profissional.</p>
      </CardBoxComponentEmpty>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CardBox v-for="review in reviews" :key="review.id" class="shadow-sm border border-gray-100 dark:border-gray-800">
        <div class="flex items-start space-x-4">
          <img 
            :src="review.avaliador.fotoPerfilUrl || 'https://www.gravatar.com/avatar/?d=mp'" 
            class="w-12 h-12 rounded-full border border-gray-200"
            alt="Foto do Avaliador"
          />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold">{{ review.avaliador.nome }}</span>
              <span class="text-xs text-gray-500">{{ new Date(review.dataCriacao).toLocaleDateString() }}</span>
            </div>
            <StarRating :model-value="review.nota" :read-only="true" :size="16" />
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-300 italic">
              "{{ review.comentario || 'Sem comentário.' }}"
            </p>
          </div>
        </div>
      </CardBox>
    </div>

    <!-- Formulário de Avaliação -->
    <CardBox is-form class="mt-8 border-2 border-primary-500/10 shadow-lg">
      <div class="mb-4 font-bold text-lg text-primary-600 dark:text-primary-400">Avalie este profissional</div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">Sua Nota:</label>
        <StarRating v-model="newReview.nota" :size="32" />
      </div>

      <FormField label="Seu comentário (opcional)" help="O login com Google servirá apenas para validar sua identidade e publicar o comentário.">
        <FormControl 
          v-model="newReview.comentario" 
          type="textarea" 
          placeholder="Conte sua experiência..." 
          :disabled="isSubmitting"
        />
      </FormField>

      <div v-if="feedbackMsg" :class="['mb-4 p-3 rounded text-sm flex items-center', isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
        <BaseIcon :path="isError ? mdiAlertCircle : mdiCheckCircle" class="mr-2" size="18" />
        {{ feedbackMsg }}
      </div>

      <template #footer>
        <div class="flex flex-col items-center md:items-start space-y-2">
          <p class="text-xs text-gray-500 mb-2">Clique abaixo para enviar usando sua conta Google:</p>
          <GoogleSignInButton
            type="standard"
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            @success="handleGoogleSuccess"
            @error="handleGoogleError"
          />
        </div>
      </template>
    </CardBox>
  </div>
</template>
