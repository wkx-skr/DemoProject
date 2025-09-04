<template>
  <div style="height: 100%" class="userModal-wrap">
    <el-container style="height: 100%; background-color: var(--white-grey-bgc)">
      <el-aside
        style="
          background-color: #fff;
          border-right: 1px solid #efefef;
          overflow: hidden;
        "
        width="160px"
        v-if="useDam"
      >
        <!--<div class="personal-title">个人工作台</div>-->
        <!--background-color="var(&#45;&#45;search-left-bgc)"-->
        <el-menu
          style="border-right: none"
          @select="handleSelect"
          :default-active="currentNav"
          class="user-center-menu top-menu"
        >
          <el-menu-item index="userPane">
            <i class="icon iconfont icon-workbench" />
            <span class="titleName">{{ $t('userPane.title.userPane') }}</span>
          </el-menu-item>
          <el-submenu index="myTodo">
            <template slot="title" style="height: 40px">
              <i class="icon iconfont icon-menu-blsx" />
              <span class="titleName">
                {{ $t('userPane.title.workItems') }}
              </span>
            </template>
            <el-menu-item index="myTodo">
              {{ $t('userPane.title.todo') }}
            </el-menu-item>
            <el-menu-item index="myDone">
              {{ $t('userPane.title.history') }}
            </el-menu-item>
          </el-submenu>
          <el-menu-item index="myApply">
            <i class="icon iconfont icon-menu-bwdsq" />
            <span class="titleName">
              {{ $t('userPane.title.myApplications') }}
            </span>
          </el-menu-item>
          <el-submenu index="message">
            <template slot="title" style="height: 40px">
              <i class="icon iconfont icon-menu-news" />
              <span class="titleName">{{ $t('userPane.title.message') }}</span>
            </template>
            <el-menu-item index="message">
              {{ $t('userPane.title.inbox') }}
            </el-menu-item>
            <el-menu-item index="messageSendMailbox">
              {{ $t('userPane.title.sent') }}
            </el-menu-item>
          </el-submenu>
          <el-menu-item index="favourite">
            <i class="icon iconfont icon-remove" />
            <span class="titleName">
              {{ $t('userPane.title.myFavorites') }}
            </span>
          </el-menu-item>
          <el-menu-item index="subscribe">
            <i class="icon iconfont icon-dingyue" />
            <span class="titleName">
              {{ $t('userPane.title.mySubscription') }}
            </span>
          </el-menu-item>
          <el-menu-item index="user">
            <i class="icon iconfont icon-schema" />
            <span class="titleName">{{ $t('userPane.title.profile') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main v-if="currentNav === 'user'">
        <user-information
          :key="contentKey.user"
          :useDam="useDam"
        ></user-information>
      </el-main>
      <el-main class="padding-0" v-else-if="currentNav === 'userPane'">
        <!--v-if="useDam" 当 ddmonly 时不使用 dam 相关模块, 防止 调用 dam 相关api-->
        <user-pane :key="contentKey.userPane" v-if="useDam"></user-pane>
      </el-main>
      <el-main v-else-if="currentNav === 'favourite'">
        <user-favourite
          :key="contentKey.favourite"
          v-if="useDam"
        ></user-favourite>
      </el-main>
      <el-main v-else-if="currentNav === 'subscribe'">
        <user-subscribe
          :key="contentKey.subscribe"
          v-if="useDam"
        ></user-subscribe>
      </el-main>
      <el-main v-else-if="currentNav === 'message'">
        <notification
          :hideOuter="true"
          :type="'messageInbox'"
          :key="'message' + contentKey.message"
          v-if="useDam"
        ></notification>
      </el-main>
      <el-main v-else-if="currentNav === 'messageSendMailbox'">
        <notification
          :hideOuter="true"
          :type="'messageSendMailbox'"
          :key="'messageSendMailbox' + contentKey.messageSendMailbox"
          v-if="useDam"
        ></notification>
      </el-main>
      <el-main v-else-if="currentNav === 'myApply'">
        <my-apply :key="contentKey.myApply" v-if="useDam"></my-apply>
      </el-main>
      <el-main v-else-if="currentNav === 'myTodo'">
        <my-todo :key="contentKey.myTodo" v-if="useDam"></my-todo>
      </el-main>
      <el-main v-else-if="currentNav === 'myDone'">
        <my-done :key="contentKey.myDone" v-if="useDam"></my-done>
      </el-main>
      <el-main v-else-if="currentNav === 'createApplication'">
        <create-application v-if="useDam"></create-application>
      </el-main>
      <el-main v-else-if="currentNav === 'recommend'">recommend</el-main>
      <el-main v-else>log</el-main>
    </el-container>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
@import './_main';
.el-main {
  padding: 0;
}
.top-menu {
  margin-top: 10px;
}
not(.top-menu) > li.el-menu-item {
  line-height: 1;
  height: auto;
  width: 160px;
  min-width: 160px;
  padding: 4px 10px !important;
  box-sizing: border-box;
  i.icon {
    color: #f1f5f8;
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
    background: $table-hover-color;
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

.padding-0 {
  padding: 0;
}
</style>
<style lang="scss">
.userModal-wrap {
  .el-submenu__title {
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
  .el-submenu .el-menu-item {
    padding-left: 45px !important;
  }
}
</style>
<style lang="scss" scoped>
/deep/ .el-submenu__title {
  i {
    width: auto !important;
  }
}
</style>
