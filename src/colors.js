export const gradientBgBase = 'bg-linear-to-tr'
export const gradientBgSlate = `${gradientBgBase} from-slate-800 via-slate-900 to-slate-950`
export const gradientBgDark = `${gradientBgBase} from-zinc-800 via-zinc-900 to-black`

export const colorsBgLight = {
  white: 'bg-white text-slate-900',
  light: 'bg-slate-50 text-slate-800 dark:bg-slate-900/70 dark:text-slate-100',
  contrast: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
  success: 'bg-emerald-600 border-emerald-600 text-white',
  danger: 'bg-rose-600 border-rose-600 text-white',
  warning: 'bg-amber-500 border-amber-500 text-white',
  info: 'bg-indigo-600 border-indigo-600 text-white',
}

export const colorsText = {
  white: 'text-slate-900 dark:text-slate-100',
  light: 'text-slate-500 dark:text-slate-400',
  contrast: 'dark:text-white',
  success: 'text-emerald-600',
  danger: 'text-rose-600',
  warning: 'text-amber-600',
  info: 'text-indigo-600',
}

export const colorsOutline = {
  white: [colorsText.white, 'border-slate-100'],
  light: [colorsText.light, 'border-slate-100'],
  contrast: [colorsText.contrast, 'border-slate-900 dark:border-slate-100'],
  success: [colorsText.success, 'border-emerald-500'],
  danger: [colorsText.danger, 'border-rose-500'],
  warning: [colorsText.warning, 'border-amber-500'],
  info: [colorsText.info, 'border-indigo-500'],
}

export const getButtonColor = (color, isOutlined, hasHover, isActive = false) => {
  const colors = {
    ring: {
      white: 'ring-slate-200 dark:ring-slate-500',
      whiteDark: 'ring-slate-200 dark:ring-slate-500',
      lightDark: 'ring-slate-200 dark:ring-slate-500',
      contrast: 'ring-slate-300 dark:ring-slate-400',
      success: 'ring-emerald-300 dark:ring-emerald-700',
      danger: 'ring-rose-300 dark:ring-rose-700',
      warning: 'ring-amber-300 dark:ring-amber-700',
      info: 'ring-indigo-300 dark:ring-indigo-700',
    },
    active: {
      white: 'bg-slate-100',
      whiteDark: 'bg-slate-100 dark:bg-slate-800',
      lightDark: 'bg-slate-200 dark:bg-slate-700',
      contrast: 'bg-slate-700 dark:bg-slate-100',
      success: 'bg-emerald-700 dark:bg-emerald-600',
      danger: 'bg-rose-700 dark:bg-rose-600',
      warning: 'bg-amber-700 dark:bg-amber-600',
      info: 'bg-indigo-700 dark:bg-indigo-600',
    },
    bg: {
      white: 'bg-white text-slate-900',
      whiteDark: 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white',
      lightDark: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white',
      contrast: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
      success: 'bg-emerald-600 dark:bg-emerald-500 text-white',
      danger: 'bg-rose-600 dark:bg-rose-500 text-white',
      warning: 'bg-amber-600 dark:bg-amber-500 text-white',
      info: 'bg-indigo-700 dark:bg-indigo-600 text-white',
    },
    bgHover: {
      white: 'hover:bg-slate-100',
      whiteDark: 'hover:bg-slate-100 dark:hover:bg-slate-800',
      lightDark: 'hover:bg-slate-200 dark:hover:bg-slate-700',
      contrast: 'hover:bg-slate-800 dark:hover:bg-slate-100',
      success:
        'hover:bg-emerald-700 hover:border-emerald-700 dark:hover:bg-emerald-600 dark:hover:border-emerald-600',
      danger:
        'hover:bg-rose-700 hover:border-rose-700 dark:hover:bg-rose-600 dark:hover:border-rose-600',
      warning:
        'hover:bg-amber-700 hover:border-amber-700 dark:hover:bg-amber-600 dark:hover:border-amber-600',
      info: 'hover:bg-indigo-800 hover:border-indigo-800 dark:hover:bg-indigo-700 dark:hover:border-indigo-700',
    },
    borders: {
      white: 'border-white',
      whiteDark: 'border-white dark:border-slate-900',
      lightDark: 'border-slate-100 dark:border-slate-800',
      contrast: 'border-slate-800 dark:border-white',
      success: 'border-emerald-600 dark:border-emerald-500',
      danger: 'border-rose-600 dark:border-rose-500',
      warning: 'border-amber-600 dark:border-amber-500',
      info: 'border-indigo-700 dark:border-indigo-600',
    },
    text: {
      contrast: 'dark:text-slate-100',
      success: 'text-emerald-600 dark:text-emerald-500',
      danger: 'text-rose-600 dark:text-rose-500',
      warning: 'text-amber-600 dark:text-amber-500',
      info: 'text-indigo-700 dark:text-indigo-600',
    },
    outlineHover: {
      contrast:
        'hover:bg-slate-900 hover:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-black',
      success:
        'hover:bg-emerald-600 hover:text-white hover:text-white dark:hover:text-white dark:hover:border-emerald-600',
      danger:
        'hover:bg-rose-600 hover:text-white hover:text-white dark:hover:text-white dark:hover:border-rose-600',
      warning:
        'hover:bg-amber-600 hover:text-white hover:text-white dark:hover:text-white dark:hover:border-amber-600',
      info: 'hover:bg-indigo-700 hover:text-white dark:hover:text-white dark:hover:border-indigo-600',
    },
  }

  if (!colors.bg[color]) {
    return color
  }

  const isOutlinedProcessed = isOutlined && ['white', 'whiteDark', 'lightDark'].indexOf(color) < 0

  const base = [colors.borders[color], colors.ring[color]]

  if (isActive) {
    base.push(colors.active[color])
  } else {
    base.push(isOutlinedProcessed ? colors.text[color] : colors.bg[color])
  }

  if (hasHover) {
    base.push(isOutlinedProcessed ? colors.outlineHover[color] : colors.bgHover[color])
  }

  return base
}
