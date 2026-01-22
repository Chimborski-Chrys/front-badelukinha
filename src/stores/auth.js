import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)
  const token = ref(null)

  function setAuth(loggedInUser, userToken) {
    isAuthenticated.value = true
    user.value = loggedInUser
    token.value = userToken
    // Opcional: Persistir o token no localStorage
    localStorage.setItem('userToken', userToken)
    localStorage.setItem('userData', JSON.stringify(loggedInUser))
  }

  function clearAuth() {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
  }

  // Opcional: Inicializar estado de autenticaÃ§Ã£o do localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('userToken')
    const storedUserData = localStorage.getItem('userData')
    if (storedToken && storedUserData) {
      isAuthenticated.value = true
      token.value = storedToken
      user.value = JSON.parse(storedUserData)
    }
  }

  const isSuperAdmin = computed(() => user.value?.isSuperAdmin === true)

  function updateUser(payload) {
    if (user.value) {
      // Mescla as novas informações com as existentes
      user.value = { ...user.value, ...payload }
      localStorage.setItem('userData', JSON.stringify(user.value))
    }
  }

  return {
    isAuthenticated,
    user,
    token,
    setAuth,
    clearAuth,
    initializeAuth,
    isSuperAdmin,
    updateUser,
  }
})
