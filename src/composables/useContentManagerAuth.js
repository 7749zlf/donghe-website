import { onMounted, onUnmounted, ref } from 'vue'
import {
  getManagerAccessState,
  onManagerAccessChange,
  signInManager,
  signOutManager
} from '@/services/cloudCases'

export function useContentManagerAuth({
  cloudEnabled,
  loginForm,
  loginStatus,
  statusText,
  refreshCloudList,
  discardUploadedCaseMedia,
  discardUploadedCaseVideos,
  discardUploadedAwardMedia,
  resetForm,
  resetAwardForm,
  resetOriginalMedia
}) {
  const authReady = ref(!cloudEnabled)
  const authLoading = ref(false)
  const managerSession = ref(null)
  const managerIsAdmin = ref(false)
  let stopAuthListener = null

  async function refreshAdminStatus() {
    if (!cloudEnabled || !managerSession.value) {
      managerIsAdmin.value = false
      return false
    }

    const accessState = await getManagerAccessState(managerSession.value)
    managerSession.value = accessState.session
    managerIsAdmin.value = accessState.isAdmin
    return managerIsAdmin.value
  }

  async function handleManagerAccessChange(accessState) {
    const previousUserId = managerSession.value?.user?.id || ''
    managerSession.value = accessState.session
    managerIsAdmin.value = accessState.isAdmin

    if (accessState.error) {
      loginStatus.value = `权限检查失败：${accessState.error.message}`
      return
    }

    if (!accessState.session) {
      loginStatus.value = '请输入管理员账号。'
      return
    }

    if (!accessState.isAdmin) {
      loginStatus.value = '当前账号没有管理权限。'
      return
    }

    if (accessState.session.user?.id === previousUserId) {
      return
    }

    try {
      await refreshCloudList()
      loginStatus.value = '登录成功。'
      statusText.value = '已连接云端数据库。'
    } catch (error) {
      statusText.value = `云端数据刷新失败：${error.message}`
    }
  }

  async function handleLogin() {
    authLoading.value = true
    loginStatus.value = '正在登录。'

    try {
      managerSession.value = await signInManager(loginForm.email, loginForm.password)
      loginForm.password = ''
      const hasAccess = await refreshAdminStatus()
      if (!hasAccess) {
        loginStatus.value = '当前账号没有管理权限。'
        return
      }
      loginStatus.value = '登录成功。'
      await refreshCloudList()
    } catch (error) {
      loginStatus.value = `登录失败：${error.message}`
    } finally {
      authLoading.value = false
    }
  }

  async function handleLogout() {
    try {
      await discardUploadedCaseMedia()
      await discardUploadedCaseVideos()
      await discardUploadedAwardMedia()
      await signOutManager()
      managerSession.value = null
      managerIsAdmin.value = false
      resetOriginalMedia()
      resetForm()
      resetAwardForm()
      loginStatus.value = '已退出，请重新登录。'
    } catch (error) {
      statusText.value = `退出失败：${error.message}`
    }
  }

  onMounted(async () => {
    if (!cloudEnabled) {
      return
    }

    try {
      const accessState = await getManagerAccessState()
      managerSession.value = accessState.session
      managerIsAdmin.value = accessState.isAdmin
      stopAuthListener = onManagerAccessChange(handleManagerAccessChange)

      if (!managerSession.value) {
        loginStatus.value = '请输入管理员账号。'
        return
      }

      if (!managerIsAdmin.value) {
        loginStatus.value = '当前账号没有管理权限。'
        return
      }

      await refreshCloudList()
      statusText.value = '已连接云端数据库。'
    } catch (error) {
      statusText.value = `云端数据库连接失败：${error.message}`
      loginStatus.value = `权限检查失败：${error.message}`
    } finally {
      authReady.value = true
    }
  })

  onUnmounted(() => {
    if (stopAuthListener) {
      stopAuthListener()
    }
  })

  return {
    authReady,
    authLoading,
    managerSession,
    managerIsAdmin,
    handleLogin,
    handleLogout
  }
}
