<template>
  <div>
    <el-menu
      v-show="show"
      style="width: auto"
      :default-active="defaultActive"
      :default-openeds="groupNameBak"
      class="el-menu-vertical-demo top-menu"
      @select="selectChange"
      router>
      <template v-for="(items, index) in menuDisplay">
        <el-submenu
          :key="index"
          v-show="groupMap[groupName[index]] && groupMap[groupName[index]].show"
          v-if="!level1Group.includes(groupName[index])"
          :index="groupName[index]"
        >
          <template slot="title" style="height: 40px">
            <i class="icon iconfont s" :class="groupMap[groupName[index]] && groupMap[groupName[index]].icon"></i>
            <span>{{ groupNameMap[groupName[index]] }}</span>
          </template>
          <el-menu-item
            v-for="m in items"
            :key="m.label"
            :index="m.index"
            :route="{path: m.index, ...m.route}">
            <span slot="title" class="menu-margin-left">{{ m.label }}</span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item
          v-else
          :key="menuDisplay[index][0].label"
          :index="menuDisplay[index][0].index"
          :route="{path: menuDisplay[index][0].index, ...menuDisplay[index][0].route}">
          <span slot="title" class="level1 menu-margin-left">
            <i class="icon iconfont"
               :class="groupMap[groupName[index]] && groupMap[groupName[index]].icon || 'icon-shuju'"
            ></i>
            <span>{{ menuDisplay[index][0].label }}</span></span>
        </el-menu-item>
      </template>
    </el-menu>
    <div class="title-wrapper shrink" v-show="!show">
      <div class="group-item" v-for="(menuList, index) in menuDisplay" :key="index">
        <i
          class="iconfont icon"
          :class="{
          [groupMap[groupName[index]] && groupMap[groupName[index]].icon || 'empty']: true,
          active: menuList.some((m) => m.index === $route.path)
        }"
        ></i>
        <div class="menu-list">
          <ul>
            <li v-for="m in menuList" :key="m.label" :class="{active: m.index === $route.path}"
                @click="changePath(m.index)">
              <span>{{ m.label }}</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
    <div :class="['stretch-menu-wrapper', !show?'shrink':'']">
      <i class="iconfont" :class="!show ? 'icon-shouqi' : 'icon-zhankai'" @click="shrinkToggle"></i>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import { mapState } from 'vuex'
import _ from 'lodash'
export default {
  data () {
    const menu = [
      {
        name: 'modelLibrary',
        label: '模型管理',
        index: '/main/modelLibrary',
        icon: 'fa fa-tag',
        group: 'dataWarehouse',
        roles: ['DDD_DATAREPO_MODELEDIT']
      },
      {
        name: 'layer',
        label: '分层规范',
        index: '/main/layer',
        icon: 'fa fa-tag',
        group: 'standardSpecification',
        roles: ['DDD_DATAREPO_STANDARDBROWSE', 'DDD_DATAREPO_STANDARDEDIT']
      },
      {
        label: '数据地图',
        name: 'dataMap',
        index: '/main/dataMap',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: ['DDD_DATAREPO_DATAMAP']
      },
      {
        label: '元数据',
        name: 'dataCatalogDdm',
        index: '/main/meta',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: ['DDD_DATAREPO_METADATA']
      },
      {
        label: '数据库',
        name: 'databaseManagement',
        index: '/main/databaseManagement',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: ['DDD_DATAREPO_DATABASE']
      },
      {
        label: '应用系统',
        name: 'modelCategoryDdm',
        index: '/main/modelCategory',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: ['DDD_DATAREPO_APPSYSTEM']
      },
      {
        label: '用户管理',
        name: 'userDdm',
        index: '/main/user',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['DDD_DATAREPO_USER']
      },
      {
        label: '机构管理',
        name: 'organizationManageDdm',
        index: '/main/organizationManage',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['DDD_DATAREPO_ORGAN']
      },
      {
        label: '角色管理',
        name: 'groupDdm',
        index: '/main/group',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['DDD_DATAREPO_ROLE']
      },
      {
        label: '租户管理',
        name: 'tenantManage',
        index: '/main/tenantManage',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['DDD_DATAREPO_TENANT']
      },
      {
        name: 'dsPublish',
        label: '发布管理',
        index: '/main/dsPublish',
        icon: 'fa fa-tag',
        group: 'dsPublish',
        roles: ['DDD_DATAREPO_SCHEDULE', 'DDD_DATAREPO_DATAMAPPING']
      },
      {
        label: '驱动管理',
        name: 'driveManagementDdm',
        index: '/main/driveManagement',
        // icon: 'fa fa-level-up',
        group: 'driveManagement',
        roles: ['DDD_DATAREPO_DRIVER']
      },
      // {
      //   label: '流程管理',
      //   name: 'processManagement',
      //   index: '/main/processManagement',
      //   // icon: 'fa fa-level-up',
      //   group: 'processManagement',
      //   roles: ['DATAREPO_PROCESS_DDD']
      // },
      {
        label: '流程中心',
        name: 'processCenterDdm',
        index: '/main/processCenter',
        // icon: 'fa fa-level-up',
        group: 'processManagement',
        roles: ['DDD_DATAREPO_PROCENTRE']
      },
      {
        label: '流程监控',
        name: 'allApplyDdm',
        index: '/main/allApply',
        // icon: 'fa fa-level-up',
        group: 'processManagement',
        roles: ['DDD_DATAREPO_PROMONITOR']
      },
      {
        label: '监听器',
        name: 'monitorDdm',
        index: '/main/monitor',
        // icon: 'fa fa-level-up',
        group: 'processManagement',
        roles: ['DDD_DATAREPO_PROLISTENER']
      },
      {
        label: '参数设置',
        name: 'udpManage',
        index: '/main/udpManage',
        icon: 'fa fa-tag',
        group: 'udpManage',
        roles: ['DDD_DATAREPO_EXTENDPARAM', 'DDD_DATAREPO_MAPPINGRULE']
      },
      // 项目管理
      {
        name: 'project',
        label: '项目管理',
        index: '/main/project',
        icon: 'fa fa-tag',
        group: 'projectManage',
        roles: []
      },
      // 需求管理
      {
        name: 'demandManage',
        label: '需求管理',
        index: '/main/demandManage',
        icon: 'fa fa-tag',
        group: 'demandManage',
        roles: ['DDD_DEMAND_VIEW', 'DDD_DEMAND_EDIT']
      },
      {
        name: 'modelLibrary',
        label: '数据模型',
        index: '/main/modelLibrary',
        icon: 'fa fa-tag',
        group: 'jobCenter',
        roles: ['DDD_MISSION_CENTRE']
      },
      // 数据服务
      {
        name: 'serviceOverviewDdm',
        label: '服务总览',
        index: '/main/serviceOverview',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_SERVER']
      },
      {
        name: 'apiOverviewDdm',
        label: 'API市场',
        index: '/main/apiOverview',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APIMARKET']
      },
      {
        name: 'applyOverviewDdm',
        label: '应用列表',
        index: '/main/applyOverview',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APPLIST']
      },
      {
        name: 'manageApiDdm',
        label: '管理API',
        index: '/main/manageApi',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APIMGMT']
      },
      {
        name: 'manageAppDdm',
        label: '管理应用',
        index: '/main/manageApp',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APPMGMT']
      },
      {
        name: 'apiAuditDdm',
        label: 'API审核',
        index: '/main/apiAudit',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APIEXAMINE']
      },
      {
        name: 'applyAuditDdm',
        label: '应用审核',
        index: '/main/applyAudit',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APPEXAMINE']
      },
      {
        name: 'requestApiDdm',
        label: '我申请的API',
        index: '/main/requestApi',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APIAPPLY']
      },
      {
        name: 'devApiDdm',
        label: '我开发的API',
        index: '/main/devApi',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APIDEV']
      },
      {
        name: 'requestAppDdm',
        label: '我申请的应用',
        index: '/main/requestApp',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APPAPPLY']
      },
      {
        name: 'devAppDdm',
        label: '我创建的应用',
        index: '/main/devApp',
        icon: 'fa fa-tag',
        group: 'dataService',
        roles: ['DDD_DATASERVER_APPCREATE']
      },
      // user
      // {
      //   name: 'udpManage',
      //   label: '文件扩展属性',
      //   index: '/main/udpManage',
      //   icon: 'fa fa-tag',
      //   group: 'user',
      //   roles: ['DATAREPO_EXTENDPROPERTY_DDD']
      // },

      // {
      //   label: '机构管理',
      //   name: 'organizationManageDdm',
      //   index: '/main/organizationManage',
      //   // icon: 'fa fa-level-up',
      //   group: 'user',
      //   roles: ['DATAREPO_ORG_DDD']
      // },
      // {
      //   label: '角色管理',
      //   name: 'groupDdm',
      //   index: '/main/group',
      //   // icon: 'fa fa-level-up',
      //   group: 'user',
      //   roles: []
      // },

      // {
      //   name: 'dataSourceMapping',
      //   label: '数据源映射',
      //   index: '/main/dataSourceMapping',
      //   // icon: 'fa fa-tag',
      //   group: 'user',
      //   roles: ['DATAREPO_PUBLISH_DDD']
      // },

      // {
      //   label: '数据集',
      //   name: 'dataCatalogDdm',
      //   index: '/main/meta',
      //   // icon: 'fa fa-level-up',
      //   group: 'meta',
      //   roles: ['DATAREPO_DATASET_DDD']
      // },
      // {
      //   label: '应用系统',
      //   name: 'modelCategoryDdm',
      //   index: '/main/modelCategory',
      //   // icon: 'fa fa-level-up',
      //   group: 'meta',
      //   roles: ['DATAREPO_APPSYSTEM_DDD']
      // },
      // {
      //   label: '数据源',
      //   name: 'dataSourceDdm',
      //   index: '/main/dataSource',
      //   // icon: 'fa fa-level-up',
      //   group: 'meta',
      //   roles: ['DATAREPO_DATASOURCE_DDD']
      // },

      {
        name: 'demandManagementDdm',
        label: '需求管理',
        index: '/main/demandManagement',
        icon: 'fa fa-tag',
        group: 'demandManagement',
        roles: ['DDD_INDEX_DEMAND']
      },
      {
        name: 'dimensionDefinitionDdm',
        label: '维度定义',
        index: '/main/dimensionDefinition',
        icon: 'fa fa-tag',
        group: 'indexManage',
        roles: ['DDD_INDEX_DIMENSION']
      },
      {
        name: 'indexDefinitionDdm',
        label: '原子/衍生指标',
        index: '/main/indexDefinition',
        icon: 'fa fa-tag',
        group: 'indexManage',
        roles: ['DDD_INDEX_ATOM']
      },
      {
        name: 'forkIndexDefinitionDdm',
        label: '派生指标',
        index: '/main/forkIndexDefinition',
        icon: 'fa fa-tag',
        group: 'indexManage',
        roles: ['DDD_INDEX_DERIVE']
      },
      {
        name: 'indexModifierDdm',
        label: '修饰词管理',
        index: '/main/indexModifier',
        icon: 'fa fa-tag',
        group: 'indexManage',
        roles: ['DDD_INDEX_MODIFIER']
      },
      {
        name: 'indexTimerDdm',
        label: '时间周期管理',
        index: '/main/indexTimer',
        icon: 'fa fa-tag',
        group: 'indexManage',
        roles: ['DDD_INDEX_TIME']
      },
      {
        name: 'themeDirectoryDdm',
        label: '主题目录',
        index: '/main/themeDirectory',
        icon: 'fa fa-tag',
        group: 'themeDirectory',
        roles: ['DDD_INDEX_TOPIC']
      },
      {
        name: 'autonomousQueryDdm',
        label: '自主查询',
        index: '/main/autonomousQuery',
        icon: 'fa fa-tag',
        group: 'autonomousQuery',
        roles: ['DDD_INDEX_SEARCHSELF']
      }

    ]
    return {
      level1Group: [],
      defaultActive: '/main/' + this.$route.name,
      menu: menu,
      // showDomainManager: true,
      menuMap: {},
      show: true,
      groupName: ['dashboard'],
      groupNameBak: [],
      nowGroup: '',
      groupNameMap: {
        dataWarehouse: '数据模型',
        projectManage: '项目管理',
        jobCenter: '任务中心',
        dataService: '数据服务',
        indexManage: '指标管理',
        // user: '系统管理',
        meta: '数据管理',
        layerManage: '分层规范',
        demandManagement: '需求管理',
        themeDirectory: '主题目录',
        autonomousQuery: '指标应用',
        standardSpecification: '标准规范',
        demandManage: '需求管理',
        // process: '流程管理'
        user: '用户管理',
        dsPublish: '发布管理',
        driveManagement: '驱动管理',
        processManagement: '流程管理',
        udpManage: '参数设置'
      },
      groupMap: {},
      relatedGroups: null
      //   {
      //   conceptModel: ['conceptModel', 'logicalModel', 'applyLogicalModel', 'applyPhysicalModel'],
      //   logicalModel: ['conceptModel', 'logicalModel', 'applyLogicalModel', 'applyPhysicalModel'],
      //   applyLogicalModel: ['conceptModel', 'logicalModel', 'applyLogicalModel', 'applyPhysicalModel'],
      //   applyPhysicalModel: ['conceptModel', 'logicalModel', 'applyLogicalModel', 'applyPhysicalModel'],
      //   ruleChecke: ['modelMgr', 'ruleChecke'],
      //   modelMgr: ['modelMgr', 'ruleChecke']
      // }
    }
  },
  mounted () {
    this.$bus.$on('updateMenu', this.updateMenu)
    this.$bus.$on('changeGroupName', this.changeGroupName)
    // this.menuFormatter()
    this.handleRouteChange(this.$route, true)
    $('.title-wrapper.shrink').on('mouseenter', ' .group-item', (e) => {
      $(e.target).find('.menu-list').show()
    })
    $('.title-wrapper.shrink').on('mouseleave', ' .group-item', (e) => {
      $('.menu-list').hide()
    })
  },
  beforeDestroy () {
    this.$bus.$off('updateMenu')
  },
  methods: {
    menuFormatter () {
      // 格式化 menu item, 添加默认值, 绑定父级目录
      // item 元数据 增加的属性
      // roles: 显示页面需要的 权限, 有任意一个权限, 就显示这个页面
      // show: 页面是否显示
      const menu = this.menu

      const menuMap = {}

      // group 与 顶部目录结构
      const groupCategories = {
        dataWarehouseList: {
          // 数据仓库
          // pages: ['user', 'udp', 'workflow', 'tag', 'update', 'log', 'modelRules', 'domainManage', 'drive', 'phases', 'processControl'],
          groups: ['dataWarehouse', 'standardSpecification', 'meta'],
          icon: ['icon-gainianmoxing', 'icon-menu-ywlc', 'icon-menu-ysjgl', 'icon-menu-xtgl']
        },
        projectManageList: {
          // 项目管理
          // pages: ['license', 'report', 'webLicense'],
          groups: ['projectManage'],
          icon: ['icon-menu-fwzl']

        },
        jobCenterList: {
          // 任务中心
          // pages: ['architecture', 'modelLevel'],
          groups: ['jobCenter'],
          icon: []

        },
        dataServiceList: {
          // 数据服务
          // pages: ['modelTheme', 'businessObj', 'businessArea', 'businessAreaConceptual', 'modelCategory'],
          groups: ['dataService'],
          icon: ['icon-menu-fwgl']

        },
        indexManageList: {
          // 指标管理
          groups: ['indexManage', 'themeDirectory', 'autonomousQuery'],
          icon: ['icon-menu-zbgl', 'icon-menu-ztml', 'icon-menu-zbyy', '']

        },
        demandManageList: {
          // 需求管理
          groups: ['demandManage'],
          icon: ['icon-menu-xqgl']

        },
        systemManagementList: {
          // 系统管理
          groups: ['user', 'dsPublish', 'driveManagement', 'processManagement', 'udpManage'],
          icon: ['icon-menu-xtgl', 'icon-publish', 'icon-guanlixinxi', 'icon-menu-lcgl', 'icon-menu-gzcs']
        }
        // meta: {
        //   groups: ['meta']
        // },
        // user: {
        //   // 用户管理
        //   groups: ['user']
        // }
      }

      const groupMap = {}

      // 根据权限判断是否显示页面
      const $auth = this.$store.state.$auth
      menu.forEach(item => {
        menuMap[item.name] = item
        if (!groupMap[item.group]) {
          groupMap[item.group] = {
            pages: []
          }
        }
        groupMap[item.group].pages.push(item)
        const requireRoles = item.roles || []
        let bool = false
        if (!requireRoles || requireRoles.length === 0) {
          bool = true
        }
        requireRoles.forEach(role => {
          if ($auth[role]) {
            bool = true
          }
        })
        item.show = bool
      })

      // 对页面的目录关系进行结构化
      for (let key in groupCategories) {
        if (!groupCategories[key].pages) {
          groupCategories[key].pages = []
        }
        const groupsArray = groupCategories[key].groups
        groupsArray.forEach((group, index) => {
          groupMap[group].category = key
          groupMap[group].icon = groupCategories[key].icon[index]
          groupCategories[key].pages.push(...groupMap[group].pages)
        })
      }

      // 查看 groups 的页面是否全部隐藏, 如果隐藏, 就隐藏 group
      for (let key in groupMap) {
        const group = groupMap[key]
        let bool = false
        group.pages.forEach(page => {
          if (page.show) {
            bool = true
          }
        })
        group.show = bool
        const category = group.category
      }

      // 根据 group 是否隐藏, 判断 顶部目录是否隐藏
      const relatedGroups = {}
      for (let key in groupCategories) {
        const category = groupCategories[key]
        let bool = false
        category.groups.forEach(group => {
          if (groupMap[group].show) {
            bool = true
            if (!category.url) {
              category.url = groupMap[group].pages.find(i => i.show).index
            }
          }
          relatedGroups[group] = groupCategories[groupMap[group].category].groups
        })
        category.show = bool
      }
      this.relatedGroups = relatedGroups
      let menuItem = this.menu.find(i => i.index === this.$route.path)
      if (menuItem && !menuItem.show) {
        this.$router.replace('/')
      }
      this.$store.commit('setGroupCategories', groupCategories)

      this.menuMap = menuMap
      this.groupMap = groupMap
    },
    changeGroupName (nameList) {
      // this.groupName = nameList
    },
    updateMenu (item) {
      this.menu.push(item)
    },
    shrinkToggle () {
      this.$bus.$emit('left-menu-shrink', this.show)
      this.show = !this.show
    },
    changePath (path) {
      this.$router.push(path)
      $('.menu-list').hide()
    },
    selectChange (index, indexPath) {
      if (this.$route.path === index) {
        this.$bus.$emit('refreshMain')
      }
    },
    handleRouteChange (val, first) {
      this.menuFormatter()
      if (!this.relatedGroups) return
      let tempPath = val.path
      if (tempPath.indexOf('/main/modelTheme/detail') !== -1) {
        tempPath = '/main/modelTheme'
      } else if (tempPath.indexOf('/main/businessObj/detail') !== -1) {
        tempPath = '/main/businessObj'
      } else if (/\/main\/businessArea\/\S+\/detail/.test(tempPath)) {
        tempPath = tempPath.slice(0, tempPath.indexOf('/detail'))
      } else if (/\/main\/modelCategory\/\S+\/detail/.test(tempPath)) {
        tempPath = tempPath.slice(0, tempPath.indexOf('/detail'))
      } else if (tempPath.indexOf('/main/project') !== -1) {
        tempPath = '/main/project'
      } else if (tempPath.indexOf('/main/databaseManagement/jobManagement') !== -1) {
        tempPath = '/main/databaseManagement'
      }
      let menuItem = this.menu.find(item => item.index === tempPath)
      if (menuItem) {
        this.groupName = this.relatedGroups[menuItem.group] ? this.relatedGroups[menuItem.group] : [menuItem.group]
        if (first || (this.relatedGroups[this.nowGroup] && !this.relatedGroups[this.nowGroup].includes(menuItem.group)) || !this.relatedGroups[this.nowGroup]) { // 第一次或者切换到不同group也需展开不同menu
          this.groupNameBak = _.cloneDeep(this.groupName)
        }
        this.nowGroup = menuItem.group
      }
      this.defaultActive = tempPath
    }
  },
  computed: {
    ...mapState({
      isAdmin: (state) => state.user.isAdmin
    }),
    menuDisplay () {
      return this.groupName.map(name => {
        return this.menu.filter(item => {
          if (!item.show) return false
          return item.group === name
        })
      })
    }
  },
  watch: {
    menu: {
      deep: true,
      handler (val) {
        this.handleRouteChange(this.$route)
      }
    },
    $route (val) {
      this.handleRouteChange(val)
    },
    isAdmin (val) {
      if (val) {
        // if (!this.menu.find(i => i.label === this.$v.leftMenu.webLicense)) {
        //   this.menu.push({
        //     label: this.$v.leftMenu.webLicense,
        //     name: 'webLicense',
        //     index: '/main/webLicense',
        //     group: 'operateMgr',
        //     roles: ['ROLE_OPERATION_MANAGE_DDM']
        //   })
        // }
      }
    }
  }
}
</script>

<style scoped lang="scss">
  $blue: #4386f5;
  .group-item {
    position: relative;
    padding: 20px 21px;
    .iconfont {
      color: #303133;
      &.active {
        color: #409eff;
      }
    }
  }
  .top-menu {
    margin-top: 10px;
  }
  .left-menu-component {
    //width: auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 50px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .el-submenu {
    .icon {
      display: inline-block;
      margin-right: 10px;
      font-size: 16px;
      color: #999;
      text-align: center;
    }
  }

  li.el-menu-item {
     line-height: 1;
     height: auto;
     width: 160px;
     min-width: 160px;
     padding: 4px 10px !important;
     box-sizing: border-box;
     i.icon {
       color: #999;
     }
     .menu-margin-left {
       display: inline-block;
       height: 32px;
       width: 140px;
       line-height: 32px;
       position: relative;
       //left: -1em;
       padding-left: 23px;
       font-size: 12px;
       border-radius: 2px;
       //border-left: 3px solid transparent;
       &.level1 {
         padding-left: 10px;
         padding-right: 10px;
         .icon {
           margin-right: 10px;
         }
       }
     }

     &.el-submenu__title {
       // 下级目录只有一个, 将下级目录项提升一级
       border-left: 7px solid transparent;
       //padding-left: 7px;
       //border: 1px solid red;

       & > span.menu-margin-left {
         //text-indent: 10px;
         margin-left: 10px;
         //color: red;
         font-size: 12px;
         border-right: 4px;
       }
     }

     &.is-active {
       &.el-submenu__title {
         & > span.menu-margin-left {
           // 下级目录只有一个, 将下级目录项提升一级
           border-color: transparent;
         }
       }

       .menu-margin-left {
         color: #409eff;
         //border-left: 3px solid #409EFF;
       }

       //border-left-color:#4386f5;
       //border-left-color:pink;
       i.icon {
         color: #409eff !important;
       }
     }

     //background-color:#2c2c2c;
     &:hover {
       //color:#F1F5F8 !important;
       background: #ecf5ff;
       color: #555555;
     }
   }

  .el-menu--collapse li.el-submenu {
    border-left: 3px solid transparent;

    &.is-active {
      border-left-color: #4386f5;
    }
  }

  .el-submenu__title,
  li.el-menu-item:not(.is-active) {
    height: 40px;
  }
  .el-menu-item:focus {
    background: none;
  }
  .el-submenu__title > span {
    position: relative;
    top: -1px;
  }
  /deep/ .el-submenu__title .el-submenu__icon-arrow {
    margin-top: -6px;
  }
  /deep/ .el-submenu__title {
    height: 40px;
    line-height: 40px;
    font-size: 13px;
    & > i {
      //width: 1.7em;
      font-size: 14px;
    }
  }
  .el-submenu {
    &.is-active {
      .el-submenu__title {
        i {
          color: #409eff;
        }
      }
    }
  }
  .el-submenu.is-active /deep/ .el-submenu__title i {
    color: #409eff;
  }

  .el-submenu .el-menu-item {
    padding-left: 23px !important;
  }
  .title-wrapper {
    position: relative;
    .menu-list {
      display: none;
      position: absolute;
      top: 0px;
      left: 60px;
      width: 220px;
      font-size: 13px;
      border-radius: 4px;
      z-index: 100;
      ul {
        margin: 20px;
        background: #f6f6f6;
        box-shadow: 0 0 10px #e3e3e3;
      }
      li {
        display: table;
        padding: 14px 25px;
        box-sizing: border-box;
        width: 100%;
        color: #20293B;
        cursor: pointer;
        &::before {
          margin-right: 12px;
          content: '';
          display: inline-block;
          width: 3px;
          height: 14px;
          background: #20293B;
          border-radius: 2px;
          line-height: 14px;
          font-size: 13px;
          vertical-align: middle;
          visibility: hidden;
        }
        span {
          display: inline-block;
          vertical-align: middle;
        }
        &:hover {
          background-color: rgb(197,197,197);
        }
        &.active {
          color: #4386F5;
        }
        &.active::before {
          background-color: #4386F5;
          visibility: visible;
        }
      }
    }
    &.shrink .group-item:hover {
      background: rgb(246, 246, 246);
    }
    &.shrink .group-item::before {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
    }
    cursor: pointer;
    padding: 24px 0 14px 0;
    i {
      color: #4386f5;
    }
    p {
      display: inline-block;
      color: #7D8493;
      font-size: 12px;
      vertical-align: middle;
    }
  }
  .menu-item-list-wrapper {
    font-size: 13px;
    li {
      display: table;
      box-sizing: border-box;
      width: 100%;
      padding: 14px 25px;
      line-height: 14px;
      color: #20293B;
      cursor: pointer;
      &:hover {
        background-color: rgb(197,197,197);
      }
      span {
        vertical-align: middle;
      }
      &::before {
        margin-right: 12px;
        content: '';
        display: inline-block;
        width: 3px;
        height: 14px;
        background: #20293B;
        border-radius: 2px;
        line-height: 14px;
        font-size: 13px;
        vertical-align: middle;
        visibility: hidden;
      }
      &.active {
        color: #4386F5;
      }
      &.active::before {
        background-color: #4386F5;
        visibility: visible;
      }
    }
  }
  .engMenuItem{
    li{
      display: flex;
      &::before{
        height: auto;
      }
      span{
        flex: 1;
      }
    }
  }
  .stretch-menu-wrapper {
    position: fixed;
    left: 0;
    width: 160px;
    bottom: 0;
    box-sizing: border-box;
    height: 51px;
    // border-top: 1px solid #F6F6F6;
    border-right: 1px solid #ddd;
    padding: 17px;
    background: #fff;
    i {
     cursor: pointer;
    }
    &.shrink {
      width: 60px;
    }
  }
  .el-menu {
    border: none;
  }
</style>
<style lang="scss">
  .el-menu-item .fa {
    margin-right: 5px;
    width: 24px;
    text-align: center;
    font-size: 16px;
    vertical-align: middle;
  }
</style>
