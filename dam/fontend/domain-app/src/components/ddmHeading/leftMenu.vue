<template>
  <div>
    <el-menu
      v-show="show"
      style="width: auto"
      :default-active="defaultActive"
      :default-openeds="groupNameBak"
      class="el-menu-vertical-demo top-menu"
      @select="selectChange"
      router
    >
      <template v-for="(items, index) in menuDisplay">
        <el-submenu
          :key="index"
          v-show="groupMap[groupName[index]] && groupMap[groupName[index]].show"
          v-if="!level1Group.includes(groupName[index])"
          :index="groupName[index]"
        >
          <template slot="title" style="height: 40px">
            <i class="icon iconfont icon-shuju"></i>
            <span>{{ groupNameMap[groupName[index]] }}</span>
          </template>
          <el-menu-item
            v-for="m in items"
            :key="m.label"
            :index="m.index"
            :route="{ path: m.index, ...m.route }"
          >
            <span slot="title" class="menu-margin-left">{{ m.label }}</span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item
          v-else
          :key="menuDisplay[index][0].label"
          :index="menuDisplay[index][0].index"
          :route="{
            path: menuDisplay[index][0].index,
            ...menuDisplay[index][0].route,
          }"
        >
          <span slot="title" class="level1 menu-margin-left">
            <i class="icon iconfont icon-shuju"></i>
            <span>{{ menuDisplay[index][0].label }}</span>
          </span>
        </el-menu-item>
      </template>
    </el-menu>

    <div class="title-wrapper shrink" v-show="!show">
      <i class="iconfont icon-shuju"></i>
      <div class="menu-list">
        <ul>
          <li
            v-for="m in menuDisplay"
            :key="m.label"
            :class="{ active: m.index === $route.path }"
            @click="changePath(m.index)"
          >
            <span>{{ m.label }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div :class="['stretch-menu-wrapper', !show ? 'shrink' : '']">
      <i
        class="iconfont"
        :class="!show ? 'icon-shouqi' : 'icon-zhankai'"
        @click="shrinkToggle"
      ></i>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import HTTP from '@/http/main'
import _ from 'lodash'

export default {
  data() {
    const menu = [
      {
        //   name: 'user',
        //   label: this.$v.leftMenu.userMg,
        //   index: '/main/user',
        //   icon: 'fa fa-user-o',
        //   group: 'modelMgr',
        //   roles: ['USER_MANAGE']
        // }, {
        name: 'tag',
        label: '标签管理',
        index: '/main/tag',
        icon: 'fa fa-tag',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        name: 'udp',
        label: '自定义属性', // '自定义属性',
        index: '/main/udp',
        icon: 'fa fa-list',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        name: 'phases',
        label: '自定义状态', // '自定义状态',
        index: '/main/phases',
        icon: 'fa fa-file-code-o',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        name: 'drive',
        label: '驱动管理', // '驱动管理',
        index: '/main/drive',
        icon: 'fa fa-file-code-o',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        name: 'processControl',
        label: '流程管理', // '流程管理',
        index: '/main/processControl', // /main/workflow
        icon: 'fa fa-file-code-o',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        label: '企业级模型地图',
        name: 'architecture',
        index: '/main/enterprise/architecture',
        icon: 'fa fa-file-code-o',
        group: 'enterprise',
        roles: [],
      },
      {
        label: '模型分层',
        name: 'modelLevel',
        index: '/main/modelLevel',
        icon: 'fa fa-file-code-o',
        group: 'enterprise',
        roles: [],
      },
      {
        label: '模型检查规则', // '模型检查规则',
        name: 'modelRules',
        index: '/main/modelRules',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        label: '检查策略组管理',
        name: 'ruleGroup',
        index: '/main/ruleGroup',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        label: '操作日志',
        name: 'log',
        index: '/main/log',
        icon: 'fa fa-level-up',
        group: 'modelMgr',
        roles: ['ROLE_SYSTEM_MANAGE_DDM'],
      },
      {
        label: '运营报告',
        name: 'report',
        index: '/main/report',
        group: 'operateMgr',
        roles: ['ROLE_OPERATION_MANAGE_DDM'],
      },
      {
        label: '主题',
        name: 'modelTheme',
        index: '/main/modelTheme',
        icon: 'fa fa-file-code-o',
        group: 'conceptModel',
        roles: [],
      },
      {
        label: '业务对象',
        name: 'businessObj',
        index: '/main/businessObj',
        icon: 'fa fa-level-up',
        group: 'logicalModel',
        roles: [],
      },
      {
        label: '业务领域',
        name: 'ConceptualBusinessDomain',
        index: '/main/businessArea/ConceptualBusinessDomain',
        icon: 'fa fa-level-up',
        group: 'conceptModel',
        roles: [],
      },
      {
        label: '业务领域',
        name: 'LogicalBusinessDomain',
        index: '/main/businessArea/LogicalBusinessDomain',
        icon: 'fa fa-level-up',
        group: 'logicalModel',
        roles: [],
      },
      {
        label: '应用逻辑模型',
        name: 'LogicalApp',
        index: '/main/modelCategory/LogicalApp',
        icon: 'fa fa-level-up',
        group: 'applyLogicalModel',
        roles: [],
      },
      {
        label: '物理数据模型',
        name: 'Physics',
        index: '/main/modelCategory/Physics',
        icon: 'fa fa-level-up',
        group: 'applyPhysicalModel',
        roles: [],
      },
      {
        label: '基础标准',
        name: 'dataStandardDdm',
        index: '/ddm/main/dataStandard',
        group: 'domain',
        roles: [
          'DATA_STANDARD_DELETE',
          'DATA_STANDARD_IMPORT_STANDARDS',
          'DATA_STANDARD_EXPORT',
          'DATA_STANDARD_EXPORT_CHECKED',
          'DATA_STANDARD_EXPAND',
          'DATA_STANDARD_ADD',
          'DATA_STANDARD_VIEW',
          'DATA_STANDARD_RELEASE',
          'DATA_STANDARD_UPDATA',
          'DATA_STANDARD_SCRAP',
          'DATA_STANDARD_EDIT',
          'DATA_STANDARD_IMPORT_DIRECT',
          'DATA_STANDARD_VIEW_ALL',
          'DATA_STANDARD_VIEW_DELETE',
        ],
      },
      {
        label: '域标准',
        name: 'domainStandardDdm',
        index: '/ddm/main/domainStandard',
        group: 'domain',
        roles: ['DATA_STANDARD_FIELD_MANAGE', 'DATA_STANDARD_FIELD_VIEW'],
      },
      {
        label: '标准代码',
        name: 'codeDdm',
        index: '/ddm/main/code',
        // icon: 'fa fa-level-up',
        group: 'domain',
        roles: [
          'STANDARD_CODE_DELETE',
          'STANDARD_CODE_IMPORT_CODE',
          'STANDARD_CODE_EXPORT',
          'STANDARD_CODE_ADD',
          'STANDARD_CODE_VIEW',
          'STANDARD_CODE_RELEASE',
          'STANDARD_CODE_UPDATA',
          'STANDARD_CODE_SCRAP',
          'STANDARD_CODE_EDIT',
          'STANDARD_CODE_BATCH_EDIT',
          'STANDARD_CODE_IMPORT_DIRECT',
          'STANDARD_CODE_VIEW_ALL',
          'STANDARD_CODE_EXPAND',
        ],
      },
      {
        label: '领域数据标准',
        name: 'dataStandardFieldDdm',
        index: '/ddm/main/dataStandardField',
        // icon: 'fa fa-level-up',
        group: 'domain',
        roles: ['DATA_STANDARD_CATEGORY_CREATE', 'DATA_STANDARD_CATEGORY_VIEW'],
      },
      {
        label: '命名词典',
        name: 'glossaryDdm',
        index: '/ddm/main/glossary',
        // icon: 'fa fa-level-up',
        group: 'domain',
        roles: [
          'DICTIONARY_DELETE',
          'DICTIONARY_EXPORT',
          'DICTIONARY_IMPORT',
          'DICTIONARY_VIEW',
          'DICTIONARY_ADD',
          'DICTIONARY_EDIT',
        ],
      },
      // {
      //   label: '参数配置',
      //   name: 'domainSettingDdm',
      //   index: '/ddm/main/domainSetting',
      //   // icon: 'fa fa-level-up',
      //   group: 'domain',
      //   roles: ['DATA_STANDARD_PARAM_MANAGE']
      // },
      {
        label: '数据集',
        name: 'dataCatalogDdm',
        index: '/ddm/main/meta',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: [],
      },
      {
        label: '应用系统',
        name: 'modelCategoryDdm',
        index: '/ddm/main/modelCategory',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: [],
      },
      {
        label: '数据源',
        name: 'dataSourceDdm',
        index: '/ddm/main/dataSource',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: [],
      },
      {
        label: '驱动管理',
        name: 'driveManagementDdm',
        index: '/ddm/main/driveManagement',
        // icon: 'fa fa-level-up',
        group: 'meta',
        roles: [],
      },
      {
        label: '机构管理',
        name: 'organizationManageDdm',
        index: '/ddm/main/organizationManage',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['ROLE_ORGANIZATIONAL_MANAGE_DDM', 'DATAREPO_ORGAN_DDD'],
      },
      {
        label: '用户管理',
        name: 'userDdm',
        index: '/ddm/main/user',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['ROLE_USER_MANAGE_DDM', 'DATAREPO_USER_DDD'],
      },
      {
        label: '角色管理',
        name: 'groupDdm',
        index: '/ddm/main/group',
        // icon: 'fa fa-level-up',
        group: 'user',
        roles: ['ROLE_GROUP_MANAGE_DDM', 'DATAREPO_ROLE_DDD'],
      },
    ]
    return {
      defaultActive: '/main/' + this.$route.name,
      menu: menu,
      isOperate: undefined,
      // showDomainManager: true,
      show: true,
      groupName: ['dashboard'],
      groupNameBak: [],
      level1Group: ['applyLogicalModel', 'applyPhysicalModel'],
      nowGroup: '',
      groupNameMap: {
        modelMgr: `系统管理`,
        ruleChecke: `模型检查规范`,
        operateMgr: `运营管理`,
        enterprise: '企业架构',
        conceptModel: '概念数据模型',
        logicalModel: '业务逻辑模型',
        domain: '数据标准',
        meta: '元数据',
        user: '用户管理',
      },
      groupMap: {},
    }
  },
  mounted() {
    // HTTP.damConnectable()
    //   .then(res => {
    //     this.showDomainManager = !res
    //   })
    //   .catch(e => {
    //     // this.$showFailure(e)
    //     console.log(e)
    //   })
    this.handleRouteChange(this.$route, true)
    $('.title-wrapper.shrink').hover(
      () => {
        $('.menu-list').show()
      },
      () => {
        $('.menu-list').hide()
      }
    )
  },
  methods: {
    menuFormatter() {
      // 格式化 menu item, 添加默认值, 绑定父级目录
      // item 元数据 增加的属性
      // roles: 显示页面需要的 权限, 有任意一个权限, 就显示这个页面
      // show: 页面是否显示
      const menu = this.menu

      const menuMap = {}

      // group 与 顶部目录结构
      const groupCategories = {
        modelMgrList: {
          // 系统管理
          // pages: ['user', 'udp', 'workflow', 'tag', 'update', 'log', 'modelRules', 'domainManage', 'drive', 'phases', 'processControl'],
          groups: ['modelMgr'],
        },
        operateMgrList: {
          // 运营管理
          // pages: ['license', 'report', 'webLicense'],
          groups: ['operateMgr'],
        },
        enterpriseList: {
          // 企业架构
          // pages: ['architecture', 'modelLevel'],
          groups: ['enterprise'],
        },
        assetsList: {
          // 模型资产
          // pages: ['modelTheme', 'businessObj', 'businessArea', 'businessAreaConceptual', 'modelCategory'],
          groups: [
            'conceptModel',
            'logicalModel',
            'applyLogicalModel',
            'applyPhysicalModel',
          ],
        },
        domain: {
          groups: ['domain'],
        },
        meta: {
          groups: ['meta'],
        },
        user: {
          groups: ['user'],
        },
      }

      const groupMap = {}

      // 根据权限判断是否显示页面
      // const $auth = this.$store.state.$auth
      const $auth = this.$store.state.$auth
      menu.forEach(item => {
        menuMap[item.name] = item
        if (!groupMap[item.group]) {
          groupMap[item.group] = {
            pages: [],
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
        groupsArray.forEach(group => {
          groupMap[group].category = key
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

          relatedGroups[group] =
            groupCategories[groupMap[group].category].groups
        })
        category.show = bool
      }
      this.relatedGroups = relatedGroups
      let menuItem = this.menu.find(i => i.index === this.$route.path)
      if (menuItem && !menuItem.show) {
        this.$skip2Ddm({
          name: 'dashboard',
        })
      }
      this.$store.commit('setGroupCategories', groupCategories)

      this.menuMap = menuMap
      this.groupMap = groupMap
    },
    selectChange(index, indexPath) {
      if (this.$route.path === index) {
        this.$bus.$emit('refreshMain')
      }
    },
    shrinkToggle() {
      this.$bus.$emit('left-menu-shrink', this.show)
      this.show = !this.show
    },
    changePath(path) {
      this.$router.push(path)
      $('.menu-list').hide()
    },
    handleRouteChange(val, first) {
      // if (val.name === 'license' || val.name === 'report') {
      //   this.isOperate = true
      // } else {
      //   this.isOperate = false
      // }
      // this.defaultActive = val.path

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
      }
      let menuItem = this.menu.find(item => item.index === tempPath)
      if (menuItem) {
        this.groupName = this.relatedGroups[menuItem.group]
          ? this.relatedGroups[menuItem.group]
          : [menuItem.group]
        if (
          first ||
          (this.relatedGroups[this.nowGroup] &&
            !this.relatedGroups[this.nowGroup].includes(menuItem.group)) ||
          !this.relatedGroups[this.nowGroup]
        ) {
          // 第一次或者切换到不同group也需展开不同menu
          this.groupNameBak = _.cloneDeep(this.groupName)
        }
        this.nowGroup = menuItem.group
      }
      this.defaultActive = tempPath
    },
  },
  computed: {
    menuDisplay() {
      return this.groupName.map(name => {
        return this.menu.filter(item => {
          if (!item.show) return false
          return item.group === name
        })
      })
    },
  },
  watch: {
    // menu: {
    //   deep: true,
    //   handler(val) {
    //     this.handleRouteChange(this.$route)
    //   }
    // },
    $route(val) {
      this.handleRouteChange(val)
    },
  },
}
</script>

<style scoped lang="scss">
$blue: #4386f5;
.top-menu {
  margin-top: 10px;
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
.el-menu {
  border-right: none;
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
    width: 200px;
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
      color: #20293b;
      cursor: pointer;

      &::before {
        margin-right: 12px;
        content: '';
        display: inline-block;
        width: 3px;
        height: 14px;
        background: #20293b;
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
        background-color: rgb(197, 197, 197);
      }

      &.active {
        color: #4386f5;
      }

      &.active::before {
        background-color: #4386f5;
        visibility: visible;
      }
    }
  }

  &.shrink:hover {
    background: rgb(246, 246, 246);
  }

  &.shrink::before {
    content: '';
    position: absolute;
    top: -40px;
    left: -40px;
    right: -40px;
    bottom: -40px;
  }

  cursor: pointer;
  padding: 24px 0 14px 18px;

  p {
    display: inline-block;
    color: #7d8493;
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
    color: #20293b;
    cursor: pointer;

    &:hover {
      background-color: rgb(197, 197, 197);
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
      background: #20293b;
      border-radius: 2px;
      line-height: 14px;
      font-size: 13px;
      vertical-align: middle;
      visibility: hidden;
    }

    &.active {
      color: #4386f5;
    }

    &.active::before {
      background-color: #4386f5;
      visibility: visible;
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
  border-top: 1px solid #f6f6f6;
  border-right: 1px solid #f6f6f6;
  padding: 17px;
  background: #fff;

  i {
    cursor: pointer;
  }

  &.shrink {
    width: 59px;

    i {
      transform: rotate(180deg);
    }
  }
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
