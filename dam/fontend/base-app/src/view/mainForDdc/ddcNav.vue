<template>
  <div id="ddc-nav">
    <el-menu
      :default-active="defaultActive"
      background-color="#fff"
      :collapse-transition="false"
      :unique-opened="false"
      text-color="#6F6369"
      router
      active-text-color="#6F6369"
      :default-openeds="defaultOpeneds"
    >
      <el-submenu index="domain">
        <template slot="title">
          <i class="icon icon-map"></i>
          <span>数据资源</span>
        </template>
        <el-menu-item index="/main/dataStandard">业务系统</el-menu-item>
        <el-menu-item index="/main/dataStandard">数据库</el-menu-item>
        <el-menu-item index="/main/dataStandard">数据表</el-menu-item>
        <el-menu-item index="/main/dataStandard">报表</el-menu-item>
        <el-menu-item index="/main/dataStandard">指标</el-menu-item>
        <el-menu-item index="/main/dataStandard">文档</el-menu-item>
        <el-menu-item index="/main/dataStandard">API服务</el-menu-item>
        <el-menu-item index="/main/shareFile">文件类资产</el-menu-item>
      </el-submenu>
      <el-menu-item index="/main/dataStandard">
        <i class="icon icon-standards"></i>
        <span slot="title">数据目录</span>
      </el-menu-item>
      <el-menu-item index="/main/dataStandard">
        <template slot="title">
          <i class="icon fa fa-tag"></i>
          <span>数据标签</span>
        </template>
      </el-menu-item>
      <el-menu-item index="/main/dataStandard">
        <template slot="title">
          <i class="icon icon-setting"></i>
          <span>系统管理</span>
        </template>
      </el-menu-item>
    </el-menu>
  </div>
</template>
<script>
export default {
  data() {
    return {
      defaultActive: 'home',
      defaultOpeneds: [],
    }
  },
}
</script>
<style lang="scss">
#ddc-nav1 {
  i.icon {
    font-size: 14px; //图标
    margin-left: 0.5em;
    margin-right: 0.5em;
    color: #696969;
  }

  i.text {
    font-style: normal;
    position: absolute;
    left: 3.7em;
    top: -0.2em;
    font-size: 14px;
  }
  .el-tabs__item:hover i,
  .el-tabs__item.is-active i {
    color: #dce0e4;
  }
  .menu-margin-left {
    margin-left: 8px;
  }

  li.el-menu-item {
    height: 40px;
    line-height: 40px;
    border-left: 3px solid transparent;
    i.icon {
      color: #f1f5f8;
    }
    .menu-margin-left {
      position: relative;
      left: -1em;
      padding-left: 1em;
      border-left: 3px solid transparent;
      font-size: 12px;
    }
    &.is-active {
      .menu-margin-left {
        border-left: 3px solid #4386f5;
      }
      i.icon {
        color: #4386f5 !important;
      }
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
  .el-menu.el-menu--collapse {
    li.el-submenu.is-active .el-submenu__title {
      i.icon {
        /*color:#4386f5 !important;*/
      }
    }
  }
  .el-menu:not(.el-menu--collapse) {
    li.el-submenu {
      .el-submenu__title {
        border-left: 3px solid transparent;
      }
      &.is-active {
        .el-submenu__title,
        li {
          /*background-color: #262626 !important;*/
        }
        .el-submenu__title {
          /*border-left-color:#4386f5;*/
          & > span {
            /*color:#F4F4F4 !important;*/
          }
          & > i.icon {
            color: #4386f5;
          }
        }
      }
      &.is-active:not(.is-opened) .el-submenu__title {
        border-left-color: #4386f5;
        /*color:#F1F5F8 !important;*/
        i.icon {
          color: #4386f5 !important;
        }
      }
    }
  }
  .el-submenu__title {
    /*padding-left:18px !important;*/
    padding-left: 8px !important;
    height: 40px;
    line-height: 40px;
  }
  .el-menu-item {
    padding-left: 28px !important;
  }
}
</style>
