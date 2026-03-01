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
    path: '/loja/:marca',
    name: 'loja',
    component: () => import('@/views/LojaView.vue'), // Alterado para LojaView.vue
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
    component: () => import('@/views/DashboardView.vue'), // Dashboard padrão para usuários
  },
  {
    meta: {
      title: 'Dashboard do Administrador',
      requiresAuth: true,
      requiresSuperAdmin: true, // Rota apenas para SuperAdmin
    },
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/AdminDashboard.vue'), // Aponta para o novo componente
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
  {
    meta: {
      title: 'Criar Costureira',
      requiresAuth: true,
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
  // {
  //   path: '/dashboard',
  //   redirect: '/admin/dashboard',
  // },

  {
    meta: {
      title: 'Dashboard da Costureira',
      requiresAuth: true,
    },
    path: '/dashboard',
    name: 'costureira-dashboard',
    component: () => import('@/views/DashboardView.vue'),
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

    // Verifica se a rota é de admin e o usuário não é admin
    const allowedForCostureira = ['/admin/profile', '/admin/produtos']

    if (
      to.path.startsWith('/admin') &&
      !authStore.user?.isSuperAdmin &&
      !allowedForCostureira.includes(to.path)
    ) {
      // Redireciona para o dashboard normal ou página de acesso negado
      next('/dashboard') // Ou '/acesso-negado'
      return
    }

    // Se a rota requer privilégios de SuperAdmin
    if (to.meta.requiresSuperAdmin) {
      // Se o usuário não for SuperAdmin, redireciona para erro
      if (!authStore.user?.isSuperAdmin) {
        next('/error') // Ou uma rota de "acesso negado"
        return
      }
    }
  }

  next()
})

export default router
