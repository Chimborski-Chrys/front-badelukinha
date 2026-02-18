import { mdiMonitor, mdiAccountCircle, mdiStore, mdiTag, mdiAccountPlus } from '@mdi/js'

export default [
  {
    to: '/admin/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
    isAdmin: true,
  },
  {
    to: '/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
    isNotAdmin: true, // Marker for costureiras
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
    isNotAdmin: true,
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
