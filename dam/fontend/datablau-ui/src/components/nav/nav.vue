<template>
  <div :class="{ dark: theme === 'dark' }">
    <div
        id="nav"
        :class="{
          ext: isExtension,
          hide: hideLeft,
          en: $i18n.locale === 'en'
        }"
      >
      <div id="nav-btn-box" v-loading="vLoading" v-show="showMenu">
        <el-menu
            :default-openeds="defaultOpened"
            :default-active="defaultActive"
            :key="menuKey"
            :unique-opened="false"
            :collapse="!isExtension"
            @select="handleMenuSelect"
        >
          <template >
            <div v-for="(level1Key, idx) in menusObjArr.keys" >
              <el-submenu
                  :index="menuIndexFormatter(level1Key, menusObjArr.values[idx])"
                  :key="level1Key">
                <template slot="title">
                  <i class="icon iconfont" :class="[iconClass(level1Key)]"></i>
                  {{menuLabelFormatter(level1Key, true)}}
                </template>
                <el-menu-item
                    v-for="itemValue in hideInMenuItemValues(menusObjArr.values[idx])"
                    :key="itemValue"
                    :index="pagesMap.get(itemValue).name"
                >
                  <span slot="title" class="menu-margin-left">
                    {{menuLabelFormatter(pagesMap.get(itemValue).label)}}
                  </span>
                </el-menu-item> 
              </el-submenu>
            </div>
          </template>
        </el-menu>
      </div>
      <div id="ext-btn" @click="toggleExtension">
        <i v-if="!isExtension" class="fa fa-angle-double-right"></i>
        <i v-else class="fa fa-angle-double-left"></i>
      </div>
    </div>
  </div>
</template>
<script>
import nav from './nav.js'

export default nav
</script>

<style lang="scss" scoped>
@import './nav.scss';
</style>
<style lang="scss">
@import '~@/assets/styles/color.sass';
#nav-btn-box {
  .el-menu {
    background-color: #fff;
    // border-right: solid 1px var(--border-color-lighter);
    .el-menu-item,
    .el-submenu__title {
      color: var(--table-color);

      /*&:hover {
        background-color: $table-hover-color;
        color: var(--default-opposite-color);
      }*/
    }
  }

  .first-title2,
  .first-title {
    padding-left: 16px !important;
    margin-left: -20px !important;
    width: 180px;
    span {
      padding-left: 0px;
    }
    i.icon {
      position: relative;
      top: -4px;
    }
    .el-tooltip {
      margin-left: -4px !important;
    }
    .menu-margin-left {
      display: inline-block;
      position: relative;
      margin-left: 1px;
      font-size: 14px;
      line-height: 14px;
      top: 5px;
    }
  }
  .el-submenu__title {
    margin-left: -20px;
  }

  .my-api {
    margin-left: 2px !important;
  }

  .el-menu:not(.el-menu--collapse) {
    li.el-submenu {
      .el-submenu__title {
        border-left: 3px solid transparent;
      }

      &.is-active {
        .el-submenu__title {
          & > i.icon {
            color: #409eff;
          }
        }
      }

      &.is-active:not(.is-opened) .el-submenu__title {
        border-left-color: #409eff;

        i.icon {
          color: #409eff !important;
        }
      }
    }
  }

  .el-submenu__title {
    /* padding-left: 8px !important; */
    height: 40px;
    line-height: 40px;
  }
  .el-menu--collapse .el-submenu__title {
    height: 50px;
    line-height: 50px;
  }
}

.el-menu {
  border-right: none;
}
</style>
