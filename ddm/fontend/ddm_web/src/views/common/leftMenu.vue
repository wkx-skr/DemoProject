<template>
  <div>
    <el-menu
      v-show="show"
      style="width: auto;overflow-y: auto;"
      :default-active="defaultActive"
      :default-openeds="groupNameBak"
      class="el-menu-vertical-demo top-menu left-menu-component"
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
            <i class="icon iconfont" :class="groupMap[groupName[index]] && groupMap[groupName[index]].icon"></i>
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
          v-else-if="menuDisplay[index] && menuDisplay[index].length > 0"
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
      <div class="group-item" v-for="(menuList, index) in menuDisplay.filter(item => item.length > 0)" :key="index">
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
import HTTP from '@/resource/http'
import { mapState } from 'vuex'
import _ from 'lodash'
export default {
  data () {
    return {
      categoriesTree: this.$store.state.ddmPermission.categoriesTree,
      level1Group: this.$store.state.ddmPermission.level1Group,
      menu: this.$store.state.ddmPermission.menu,
      groupNameMap: this.$store.state.ddmPermission.groupNameMap,
      defaultActive: '/main/' + this.$route.name,
      show: true,
      groupName: ['dashboard'],
      groupNameBak: [],
      nowGroup: ''
    }
  },
  mounted () {
    this.$bus.$on('updateMenu', this.updateMenu)

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
      isAdmin: (state) => state.user.isAdmin,
      relatedGroups: (state) => state.ddmPermission.relatedGroups,
      menuMap: (state) => state.ddmPermission.menuMap,
      groupMap: (state) => state.ddmPermission.groupMap
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
         font-size: 13px;
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
