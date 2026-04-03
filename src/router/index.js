import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // --- ROTAS PÃšBLICAS ---
  {
    meta: {
      title: 'Catálogo Badelukinha',
    },
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    meta: {
      title: 'Login',
    },
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },

  // --- ROTAS ADMINISTRATIVAS (PRIVADAS) ---
  {
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    meta: {
      title: 'Profile',
      requiresAuth: true,
    },
    path: '/admin/profile',
    name: 'admin-profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    meta: {
      title: 'Meus Produtos',
      requiresAuth: true,
    },
    path: '/admin/produtos',
    name: 'admin-products',
    component: () => import('@/views/MyProductsView.vue'),
  },

  // --- ROTAS DE SISTEMA (Ex: Erro) ---
  {
    meta: {
      title: 'Error',
    },
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Verifica se a rota requer autenticação
  if (to.meta.requiresAuth) {
    // Se não estiver autenticado, redireciona para o login
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
  }

  next()
})

export default router
