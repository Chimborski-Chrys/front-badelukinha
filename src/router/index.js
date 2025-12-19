import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // --- ROTAS PÃšBLICAS ---
  {
    meta: {
      title: 'Vitrine',
    },
    path: '/',
    name: 'home',
    component: () => import('@/views/VitrineView.vue'),
  },
  {
    meta: {
      title: 'Loja da Costureira',
    },
    path: '/loja/:id',
    name: 'loja',
    component: () => import('@/views/VitrineView.vue'), // Usando VitrineView como placeholder
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
      requiresAuth: true // Marcador para rotas que precisam de autenticaÃ§Ã£o
    },
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    meta: {
      title: 'Profile',
      requiresAuth: true
    },
    path: '/admin/profile',
    name: 'admin-profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    meta: {
      title: 'Meus Produtos',
      requiresAuth: true
    },
    path: '/admin/produtos',
    name: 'admin-products',
    component: () => import('@/views/MyProductsView.vue'),
  },
  {
    meta: {
      title: 'Criar Costureira',
      requiresAuth: true
    },
    path: '/admin/criar-costureira',
    name: 'admin-criar-costureira',
    component: () => import('@/views/CreateUserView.vue'),
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
  // Redirecionamento de rotas antigas
  {
    path: '/dashboard',
    redirect: '/admin/dashboard',
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

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
