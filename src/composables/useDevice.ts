import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
  orientation: 'portrait' | 'landscape'
}

export function useDevice() {
  const screenWidth = ref(window.innerWidth)
  const screenHeight = ref(window.innerHeight)

  // 设备类型判断的断点
  const MOBILE_BREAKPOINT = 768
  const TABLET_BREAKPOINT = 1024

  const deviceInfo = computed<DeviceInfo>(() => {
    const width = screenWidth.value
    const height = screenHeight.value

    return {
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      isDesktop: width >= TABLET_BREAKPOINT,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait'
    }
  })

  const isMobile = computed(() => deviceInfo.value.isMobile)
  const isTablet = computed(() => deviceInfo.value.isTablet)
  const isDesktop = computed(() => deviceInfo.value.isDesktop)
  const isMobileOrTablet = computed(() => deviceInfo.value.isMobile || deviceInfo.value.isTablet)

  // 监听窗口大小变化
  const updateScreenSize = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('orientationchange', updateScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize)
    window.removeEventListener('orientationchange', updateScreenSize)
  })

  return {
    deviceInfo,
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    screenWidth,
    screenHeight
  }
}