import { mdiMonitor, mdiAccountCircle, mdiStore, mdiTag } from '@mdi/js'

export default [
  {
    to: '/admin/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
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
  },
  {
    to: '/',
    label: 'Ver Catálogo',
    icon: mdiStore,
  },
]
