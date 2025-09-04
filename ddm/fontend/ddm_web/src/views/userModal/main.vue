<template>
  <div style="height: 100%" id="user-modal">
    <el-container style="height: 100%; background-color: var(--white-grey-bgc)">
      <el-aside
        style="
          background-color: #fff;
          border-right: 1px solid #efefef;
          overflow: hidden;
        "
        width="169px"
      >
        <!--<div class="personal-title">个人工作台</div>-->
        <!--background-color="var(&#45;&#45;search-left-bgc)"-->
        <el-menu
          style="border-right: none"
          @select="handleSelect"
          :default-active="currentNav"
          class="user-center-menu top-menu"
        >
          <!--<el-menu-item index="comFavourite" v-if="this.$globalData.$isDam">
            <i class="fa fa-star-o"></i>
            模块收藏
          </el-menu-item>-->
          <!-- <el-menu-item index="favourite">
            <img
              v-if="currentNav === 'favourite'"
              src="../../../static/userCenter/collection2.png"
              alt=""
            />
            <img
              v-if="currentNav !== 'favourite'"
              src="../../../static/userCenter/collection.png"
              alt=""
            />
            <span class="titleName">我的收藏</span>
          </el-menu-item> -->
          <!-- <el-menu-item index="subscribe">
            <img
              v-if="currentNav === 'subscribe'"
              src="../../../static/userCenter/subscribe2.png"
              alt=""
            />
            <img
              v-if="currentNav !== 'subscribe'"
              src="../../../static/userCenter/subscribe.png"
              alt=""
            />
            <span class="titleName">我的订阅</span>
          </el-menu-item> -->
          <el-menu-item index="user">
            <img
              v-if="currentNav === 'user'"
              src="../../../static/userCenter/user2.png"
              alt=""
            />
            <img
              v-if="currentNav !== 'user'"
              src="../../../static/userCenter/user.png"
              alt=""
            />
            <span class="titleName">个人资料</span>
          </el-menu-item>
          <!-- <el-menu-item index="message" >
            <img src="../../../static/userCenter/message.png" alt="">
            我的消息
          </el-menu-item> -->
          <el-submenu index="message">
            <template slot="title" style="height: 40px">
              <i class="iconfont icon-menu-news"></i>
              <span class="titleName">我的消息</span>
            </template>
            <el-menu-item index="message">收件箱</el-menu-item>
            <el-menu-item index="messageSendMailbox">发件箱</el-menu-item>
          </el-submenu>
          <el-menu-item index="myApply">
            <i class="iconfont icon-menu-bwdsq"></i>
            <span class="titleName">我的申请</span>
          </el-menu-item>
          <el-submenu index="myTodo">
            <template slot="title" style="height: 40px">
              <i class="iconfont icon-menu-blsx"></i>
              <span class="titleName">办理事项</span>
            </template>
            <el-menu-item index="myTodo">我的待办</el-menu-item>
            <el-menu-item index="myDone">我的已办</el-menu-item>
          </el-submenu>
          <!-- <el-menu-item index="createApplication" v-if="false">
            <img :src="createApplicationSrc" alt="" />
            <span class="titleName">我的申请单</span>
          </el-menu-item> -->
          <!--<el-menu-item index="recommend">-->
          <!--<i class="fa fa-thumbs-up"></i>-->
          <!--内容推荐-->
          <!--</el-menu-item>-->
          <!--<el-menu-item index="log">-->
          <!--<i class="fa fa-file"></i>-->
          <!--活动日志-->
          <!--</el-menu-item>-->
        </el-menu>
      </el-aside>
      <!-- <el-main v-if="currentNav === 'user'">
        <user-information></user-information>
      </el-main>
      <el-main v-else-if="currentNav === 'favourite'">
        <user-favourite></user-favourite>
      </el-main>
      <el-main v-else-if="currentNav === 'comFavourite'">
        <user-com-favourite></user-com-favourite>
      </el-main>
      <el-main v-else-if="currentNav === 'subscribe'">
        <user-subscribe></user-subscribe>
      </el-main>
      <el-main v-else-if="currentNav === 'message'">
        <notification :hideOuter="true" :type="'messageInbox'"></notification>
      </el-main>
      <el-main v-else-if="currentNav === 'messageSendMailbox'">
        <notification
          :hideOuter="true"
          :type="'messageSendMailbox'"
        ></notification>
      </el-main> -->
      <el-main v-if="currentNav === 'myApply'">
        <my-apply></my-apply>
      </el-main>
      <el-main v-else-if="currentNav === 'myTodo'">
        <my-todo></my-todo>
      </el-main>
      <el-main v-else-if="currentNav === 'myDone'">
        <my-done></my-done>
      </el-main>
      <el-main v-else-if="currentNav === 'message'">
        <notification :hideOuter="true" :type="'messageInbox'"></notification>
      </el-main>
      <el-main v-else-if="currentNav === 'messageSendMailbox'">
        <notification
          :hideOuter="true"
          :type="'messageSendMailbox'"
        ></notification>
      </el-main>
      <!-- <el-main v-else-if="currentNav === 'createApplication'">
        <create-application></create-application>
      </el-main> -->
      <el-main v-else-if="currentNav === 'user'">
        <userInformation></userInformation>
      </el-main>
      <el-main v-else-if="currentNav === 'recommend'">recommend</el-main>
      <!--<el-main v-else>log</el-main>-->
    </el-container>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped lang="scss">
@import './_main';
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

.el-submenu .el-menu-item {
  padding-left: 45px !important;
}

.el-submenu.is-active /deep/ .el-submenu__title i {
  color: #409eff;
}

.iframe-container-outer {
  position: absolute;
  left: 170px;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 4;
  //border: none;
  border: 1px solid red;
  overflow: visible;
}
</style>
<style lang="scss">
#user-modal {
  position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>
