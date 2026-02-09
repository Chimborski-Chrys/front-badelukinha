import { mdiMonitor, mdiAccountCircle, mdiStore, mdiTag, mdiAccountPlus } from '@mdi/js'

export default [
  {
    to: '/admin/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
    isAdmin: true, // Apenas para administradores
  },
  {
    to: '/admin/profile',
    label: 'Perfil',
    icon: mdiAccountCircle,
  },
  {
    to: '/admin/produtos',
    label: 'Meus Produtos',
    icon: mdiTag,
    isCostureira: true,
  },
  {
    to: '/admin/criar-costureira',
    label: 'Criar Costureira',
    icon: mdiAccountPlus,
    isAdmin: true, // Apenas para administradores
  },
  {
    to: '/',
    label: 'Vitrine',
    icon: mdiStore,
  },
]
