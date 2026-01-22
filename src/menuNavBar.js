import { mdiAccount, mdiLogout, mdiThemeLightDark } from '@mdi/js'

export default [
  {
    isCurrentUser: true,
    menu: [
      {
        icon: mdiAccount,
        label: 'Meu Perfil',
        to: '/admin/profile',
      },
      {
        isDivider: true,
      },
      {
        icon: mdiLogout,
        label: 'Sair',
        isLogout: true,
      },
    ],
  },
  {
    icon: mdiThemeLightDark,
    label: 'Light/Dark',
    isDesktopNoLabel: true,
    isToggleLightDark: true,
  },
]
