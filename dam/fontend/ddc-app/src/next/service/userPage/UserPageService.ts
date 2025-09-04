import {AxiosResponse} from "axios";
import UserPage from '@/next/class/UserPage'
import HTTP from '@/http/main'
// @ts-ignore
let vThis = window.vueThis;
const WIDGET_ID = 'UserPage5dot8'

class UserPageService {
  private static userPages: Array<UserPage> = []

  public constructor(thisElement) {
    if (thisElement) {
      vThis = thisElement
    }
  }

  private static getDataFromDatabase() {
    return vThis.$http.get(vThis.$url + `/service/dashboard/widgets?id=${WIDGET_ID}`)
  }

  private setDataToDatabase() {
    vThis.$http.post(vThis.$url + `/service/dashboard/widgets`, {
      widgetId: WIDGET_ID,
      content: JSON.stringify(UserPageService.userPages)
    }).then((response: AxiosResponse) => {
    }).catch((e: Error) => {
      vThis.$showFailure(e)
    })
  }

  private updateRouter() {
    const routerOptions = vThis.$mainVue.$router.options.routes
    let idx = 3
    routerOptions.forEach((item: any, index: number) => {
      if (item.name === 'main') {
        idx = index
      }
    })
    const mainRoutesChildren = routerOptions[idx].children
    mainRoutesChildren.length = 0
    const newRoutes = [routerOptions[idx]]
    //@ts-ignore
    const userPage = r => require.ensure([], () => r(require('@/view/dashboard5.7/userDefinedPage/SingleIframe.vue')), 'devApp')
    UserPageService.userPages.forEach(item => {
      mainRoutesChildren.push({
        component: userPage,
        name: item.enName,
        path: '/main/' + item.enName
      })
    })
    vThis.$mainVue.$router.addRoutes(newRoutes)
    try {
      const href = window.sessionStorage.getItem('last-user-menu')
      if (href) {
        if (href.includes('/main/') && UserPageService.userPages.map(i => i.enName).includes(href.split('/main/')[1])) {
          location.href = href
        }
      }
    } catch (e) {
    }
  }

  // @deprecated
  private static getEnNameByChName(chName: Array<string>): string | undefined {
    for (let k in vThis.$version.nav) {
      const v = vThis.$version.nav[k]
      if (v === chName[chName.length - 1]) {
        return k
      }
    }
    return undefined
  }

  private updateNavigator() {
    const menuMap = vThis.$mainVue.$store.state.menuMap
    menuMap.userLevel1 = {}
    menuMap.userLevelMap = {}
    UserPageService.userPages.forEach(item => {
      if (vThis.$mainVue.$user.roles.includes('USER-' + item.enName)) {
        const obj = {}
        obj['common.page.' + item.enName] = item.chName
        vThis.$mainVue.$i18n.mergeLocaleMessage('en', obj)
        vThis.$mainVue.$i18n.mergeLocaleMessage('zh', obj)
        const name = item.menuLevel1[item.menuLevel1.length - 1]
        menuMap.level1[name] = true
        menuMap.levelMap[name].push(item.enName)
        menuMap[item.enName] = true
        menuMap.userLevel1[name] = true
        if (!menuMap.userLevelMap[name]) {
          menuMap.userLevelMap[name] = []
        }
        menuMap.userLevelMap[name].push(item.enName)
        {
          // 更新0级目录
          const level1 = menuMap.level1
          menuMap.level0 = {
            数据资产:
              level1.assetApplication ||
              level1.assetManage ||
              level1.assetWorkbench ||
              level1.assetSystemManage,
            数据标准:
              level1.domain ||
              level1.index ||
              level1.domainLanding ||
              level1.dataStandardDashboard ||
              level1.statistical ||
              level1.domainSystemSetting,
            元数据:
              level1.metaData ||
              level1.businessData ||
              level1.dataResource ||
              level1.lineage,
            数据质量:
              level1.ruleManagement ||
              level1.qualityExamineJob ||
              level1.repairJobManagement ||
              level1.dataQualityReport,
            系统管理: level1.systemManage,
            个人工作台: level1.userPane,
            数据服务:
              level1.serviceOverview ||
              level1.apiManage ||
              level1.applyManage ||
              level1.myApi,
            数据安全:
              level1.securitySummary ||
              level1.enterpriseDataManagement ||
              level1.dataDesensitization ||
              level1.securitySystemManage ||
              level1.gatewayManager ||
              level1.strategyManage,
            指标管理:
              level1.indexManagement ||
              level1.demandManagement ||
              level1.themeDirectory ||
              level1.homePage ||
              level1.indexApply,
            统一查询: level1.unifiedQueryManager,
          }
        }
        vThis.$bus.$emit('forceGetMenuMap')
      }
    })
  }

  private reloadData() {
    return new Promise<Array<UserPage>>((resolve) => {
      UserPageService.getDataFromDatabase().then((response: AxiosResponse) => {
        if (response.data && response.data.content) {
          UserPageService.userPages = JSON.parse(response.data.content)
        } else {
          UserPageService.userPages = []
        }
        resolve(UserPageService.userPages)
      }).catch(() => {
        UserPageService.userPages = []
        resolve(UserPageService.userPages)
      })
    })
  }

  public addUserPage(userPage: UserPage) {
    UserPageService.userPages.push(userPage)
    this.setDataToDatabase()
    this.addUserPageAccess(userPage)
  }

  public setUserPage(userPage: UserPage) {
    UserPageService.userPages.forEach((item, index) => {
      if (item.id === userPage.id) {
        item.menuLevel1 = userPage.menuLevel1
        item.enName = userPage.enName
        item.chName = userPage.chName
        item.pageType = userPage.pageType
        item.iframeSrc = userPage.iframeSrc
        this.removePageAccess(item, () => {
          this.addUserPageAccess(userPage)
        })
      }
    })
    this.setDataToDatabase()
  }

  public removeUserPage(id: number) {
    let targetIndex = -1
    let current
    UserPageService.userPages.forEach((item, index) => {
      if (item.id === id) {
        targetIndex = index
        current = item
      }
    })
    if (targetIndex > -1) {
      UserPageService.userPages.splice(targetIndex, 1)
    }
    this.setDataToDatabase()
    this.removePageAccess(current)
  }

  public clearPages() {
    UserPageService.userPages.length = 0
    this.setDataToDatabase()
  }

  // 将用户目录添加到导航菜单和国际化库中
  public appendUserPageToNavigator() {
    this.getUserPages().then(() => {
      this.updateRouter()
      this.updateNavigator()
      vThis.$bus.$emit('user-page-ready')
    })
    // console.log(vThis.$mainVue.$store.state)
    // console.log(vThis.$mainVue.$store.state.menuMap)
  }

  public getUserPages(): Promise<Array<UserPage>> {
    return this.reloadData()
  }

  private addUserPageAccess(userPage: UserPage) {
    let requestBody = {
      "roleName": "USER-" + userPage.enName,
      "appName": "DAM",
      "roleFriendlyName": userPage.chName,
      "roleDescription": "",
      "roleModule": "自定义页面",
      "roleModuleClass": userPage.menuLevel1.slice(1).map(i => vThis.$t('common.page.' + i) ? vThis.$t('common.page.' + i) : i).join('-'),
      "roleApis": []
    }
    vThis.$http.post(`/user/role/`, requestBody).then(() => {
      // this.getUserPageAccess()
    })
  }

  private removePageAccess(userPage: UserPage, callback?) {
    HTTP.getAllAuth().then(res => {
      try {
        const a = res.data.children.filter(i => i.module === '自定义页面')[0].children.filter(i => i.module === userPage.menuLevel1.slice(1).map(i => vThis.$t('common.page.' + i) ? vThis.$t('common.page.' + i) : i).join('-'))[0].content.filter(i => i.roleName === "USER-" + userPage.enName)[0]
        vThis.$http.delete(`/user/role/${a.id}`).then(() => {
          if (callback) {
            callback()
          }
        })
      } catch (e) {
        console.error('匹配错误', e)
      }
    })

  }
}

export default UserPageService
