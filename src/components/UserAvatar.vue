<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import { getCloudinaryUrl } from '@/utils/cloudinary'

const props = defineProps({
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  api: {
    type: String,
    default: 'avataaars'
  },
  width: {
    type: Number,
    default: 150
  },
  height: {
    type: Number,
    default: 150
  },
  canChangePhoto: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['file-selected'])

const avatarUrl = computed(() => {
  if (props.avatar && props.avatar.includes('res.cloudinary.com')) {
    const parts = props.avatar.split('upload/')
    const publicIdAndVersion = parts[1]

    const transformations = `w_${props.width},h_${props.height},c_fill,g_face,r_max`
    const transformedUrl = `${parts[0]}upload/${transformations}/${publicIdAndVersion}`

    const url = new URL(transformedUrl)
    url.searchParams.set('_', new Date().getTime().toString())
    return url.toString()
  }

  return (
    props.avatar ??
    `https://api.dicebear.com/7.x/${props.api}/svg?seed=${props.username.replace(
      /[^a-z0-9]+/gi,
      '-'
    )}.svg`
  )
})

const username = computed(() => props.username)

const fileInput = ref(null)

const selectFile = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    emit('file-selected', file)
  }
}
</script>

<template>
  <div class="relative">
    <img
      :key="avatarUrl"
      :src="avatarUrl"
      :alt="username"
      class="block h-auto w-full max-w-full rounded-full bg-gray-100 dark:bg-slate-800"
    />
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50"
    >
      <svg
        class="h-8 w-8 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <input
      v-if="canChangePhoto"
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/png, image/jpeg, image/gif"
      @change="handleFileChange"
    />
    <BaseButton
      v-if="canChangePhoto && !$slots.default"
      label="Mudar foto"
      color="info"
      class="absolute bottom-0 right-0"
      small
      @click="selectFile"
    />
    <slot v-if="canChangePhoto" :selectFile="selectFile" />
  </div>
</template>
