<template>
  <div :key="key" class="heading">
    <el-dialog
      :visible.sync="showViewsDialog"
      :append-to-body="true"
      @checkView="showViewsDialog = false"
    >
      <show-views class="show-view-dialog" v-if="showViewsDialog"></show-views>
    </el-dialog>
    <div v-if="$noLogo"></div>
    <div :style="style.logo" v-else-if="$showOtherLogo === 'custom'">
      <img :src="$url + '/static/logo/logo.png'" alt="" />
    </div>
    <!-- <div v-else :style="style.logo" @click="handleClickLogo">
      <img src="../../assets/images/logo/logo_ddc.png" alt="" >
  </div> -->
    <div v-else-if="$showOurLogo" :style="style.logo" @click="handleClickLogo">
      <!--<img src="../../assets/images/logo/logo_ddc.png" alt="" >-->
      <img
        class="default-svg-logo"
        src="../../assets/images/logo/guanwang_black.png"
        width="140px"
        v-if="transparentLogo"
      />
      <img
        class="default-svg-logo"
        src="../../assets/images/logo/guanwang_black.png"
        width="140px"
        v-else
      />
    </div>
    <div :style="style.topRightPart" class="top-right-part">
      <div class="user-info">
        <!--        <div :style="style.user" class="user">{{$user.username.toUpperCase()[0]}}</div>-->
        <i class="portrait fa fa-user-circle"></i>
        <el-dropdown @command="handleCommand">
          <div
            class="el-dropdown-link"
            :style="style.userName"
            style="cursor: pointer"
          >
            <span-with-tooltip
              :widthStr="'40px'"
              :content="userName"
              :classString="'user-name'"
            ></span-with-tooltip>
            <!-- <span class="user-name">
              {{$user.username}}
            </span> -->
            <i class="el-icon-arrow-down"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="dam" v-if="hasDam">
              <i class="fa fa-database"></i>
              数据资产管理
            </el-dropdown-item>
            <el-dropdown-item command="user">
              <i class="fa fa-user-o"></i>
              个人工作台
            </el-dropdown-item>
            <!--            <el-dropdown-item command="sync" v-if="$auth['ROLE_SUPERUSER']"><i class="fa fa-refresh"></i> 同步</el-dropdown-item>-->
            <!--            <el-dropdown-item command="find" v-if="$auth['ROLE_SUPERUSER']"><i class="fa fa-bar-chart"></i> 数据变换</el-dropdown-item>-->
            <!--            <el-dropdown-item command="viewsdata" v-if="$auth['ROLE_SUPERUSER']"><i class="fa fa-object-group"></i> API管理</el-dropdown-item>-->
            <!--            <el-dropdown-item command="themeChange">-->
            <!--              <choose-theme :showIcon="true"></choose-theme>-->
            <!--            </el-dropdown-item>-->
            <el-dropdown-item command="logout">
              <i class="fa fa-sign-out"></i>
              登出当前用户
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="icon-con">
        <div class="notifi-box" @click="handleCheckNotification">
          <span
            class="notifi-count"
            v-if="notifiCount"
            :class="{ 'more-count': notifiCount > 9 }"
          >
            {{ notifiCount > 99 ? '99+' : notifiCount }}
          </span>
          <span class="icon-box top-icon"><i class="bell-icon"></i></span>
          <span>我的消息</span>
        </div>
        <p class="data-application" @click="handleGoCreateAppla" v-if="false">
          <span class="icon-box appl-ibox"><i class="application"></i></span>
          <span>我的申请单</span>
          <span
            class="appli-count"
            v-if="applicaCount"
            :class="{ 'more-count': applicaCount > 9 }"
          >
            {{ applicaCount > 99 ? '99+' : applicaCount }}
          </span>
        </p>
        <div class="shopCar">
          <doro-balls ref="doroBalls" :target="shopCarTargetDom"></doro-balls>
        </div>
      </div>
      <div class="ddc-search-box" style="position: relative">
        <el-input
          v-if="showGlobalSearch"
          :style="style.input"
          class="ddc-rect-input global"
          placeholder="全局搜索"
          @keydown.native="keywordFromSelect = false"
          @keydown.native.enter="search"
          @focus="handleInputFocus"
          v-model="keyword"
        ></el-input>
        <i
          class="el-icon-search"
          v-if="showGlobalSearch"
          :style="style.searchIcon"
          @click="search"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
import heading from './heading'
export default heading
</script>

<style lang="scss" scoped>
@import '../../assets/styles/constForDDC.sass';
#open-dam-btn {
  display: inline-block;
  margin-right: 1em;
  cursor: pointer;
  &:hover {
    color: $blue;
  }
}
$topIconSize: 20px;
.heading {
  color: var(--ddc-header-color);
  .default-svg-logo {
    margin-top: 10px;
    margin-left: 15px;
  }
  .show-view-dialog {
    min-height: 300px;
  }
  .top-right-part {
    float: right;
    position: relative;
    // width: 600px;
    height: 100%;
    overflow: hidden;
    font-size: 14px;
    .ddc-search-box {
      float: right;
    }
    .icon-con {
      float: right;
      line-height: 50px;
      // border: 1px solid red;
      i.bell-icon {
        background: url('./icon/msg_bell.png') no-repeat center / contain;
      }
      i.application {
        background: url('./icon/application.png') no-repeat center / contain;
      }
      .notifi-box {
        margin: 0px 20px 0 30px;
        display: inline-block;
        cursor: pointer;
        position: relative;
        &:hover {
          /*color:$blue;*/
        }
        /*        .notification-icon {
          display: inline-block;
          width: 14px;
          height: 14px;
          vertical-align: middle;
          margin: -5px 5px 0 0;
          background-color:inherit;
          background: url('../../assets/images/icon/notification-icon.png') no-repeat center / contain;
        }*/
      }
      .notifi-count,
      .appli-count {
        position: absolute;
        top: 11px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background-color: #e86952;
        text-align: center;
        line-height: 13px;
        color: #fff;
        font-size: 9px;
        &.more-count {
          width: auto;
          border-radius: 6px;
          padding: 0 2px;
        }
      }
      .notifi-count {
        left: 8px;
      }

      .data-application {
        display: inline-block;
        position: relative;
        color: var(--ddc-header-color);
        cursor: pointer;
        margin-right: 20px;
      }
      .icon-box {
        position: relative;
        display: inline-block;
        width: $topIconSize;
        height: $topIconSize;
        vertical-align: middle;
        /*margin: -2px 10px 0 0;*/
        margin: -2px 4px 0 0;
        /*border: 1px solid rgba(255,255,255,0);*/
        &.appl-ibox {
          margin-top: -3px;
        }
        i {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          &.bell-icon {
            box-sizing: border-box;
            border: 1px solid rgba(255, 255, 255, 0);
            border-top: none;
          }
        }
      }
      .appli-count {
        left: 7px;
      }
    }
    .user-info {
      float: right;
      height: 100%;
      margin-left: 0px;
      .portrait {
        margin-right: 5px;
        font-size: $topIconSize - 2px;
      }
      .user-name {
        font-weight: normal;
      }
      .user {
        display: inline-block;
        background-color: #e4e4e4;
        line-height: 30px;
        text-align: center;
        color: #8b8b8b;
        width: 30px;
        height: 30px;
        border-radius: 15px;
        margin: 9px 4px 0 0px;
      }
      .el-dropdown-link {
        position: relative;
        // width: 150px;
        /*font-weight: bold;*/
        padding-right: 50px;
        height: 100%;
        i {
          position: absolute;
          top: 0;
          right: 0;
          line-height: 50px;
          width: 50px;
          text-align: center;
        }
      }
    }
  }
}
</style>

<style lang="scss">
$blue: '#4278C9';
.heading {
  .el-menu {
    margin-left: -4px;
    .el-menu-item {
      color: #000;
      line-height: 50px;
      height: 50px;
      padding: 0;
      margin-right: 50px;
    }
  }
  .head-icon-item {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 5px;
    text-align: center;
    cursor: pointer;
    font-size: 16px;
  }
  .shopCar {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
  }

  .user-info {
    .el-dropdown {
      float: right;
      height: 100%;
      .user-name {
        position: relative;
        color: var(--ddc-header-color);
        display: inline-block;
        max-width: 100px;
        text-align: right;
      }
    }
  }
}
</style>
