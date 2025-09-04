<template>
  <div>
    <div class="notification-page" :class="{ 'hide-outer': hideOuter }">
      <div v-show="type === 'messageInbox'">
        <news-list
          @checkNoti="checkNoti"
          :classStr="'got-noti'"
          :key="'got-noti'"
          ref="allGetNotifiList"
          :type="type"
        ></news-list>
      </div>
      <div v-show="type === 'messageSendMailbox'">
        <news-list
          @checkNoti="checkNoti"
          :showSentNoti="true"
          :classStr="'sent-noti'"
          :key="'sent-noti'"
          ref="sentNotifiList"
          :type="type"
        ></news-list>
      </div>
    </div>
    <datablau-dialog
      :title="notiTabObj.title"
      :visible.sync="dialogVisibleNotiTabObj"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <check-notification
        :notification="notiTabObj"
        ref="checkNotification"
      ></check-notification>
      <span slot="footer">
        <datablau-button
          type="secondary"
          @click="dialogVisibleNotiTabObj = false"
        >
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import notification from './notification.js'
export default notification
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';

$greybgc: var(--ddc-search-main-bgc);
@mixin absfull {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.notification-page {
  // width: 100%;
  height: 100%;
  position: absolute;
  left: 160px;
  right: 0;
  bottom: 0;
  // background-color: $greybgc;
  // padding-top: 20px;
  .center-content {
    position: relative;
    max-width: 1440px;
    margin: 0 auto;
    height: 100%;
    .middle-container {
      background-color: var(--default-bgc);
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 0;
      right: 0;
      .page-header {
        height: 50px;
        line-height: 50px;
        font-weight: bold;
        font-size: 14px;
        i {
          margin: 0 10px;
          font-size: 16px;
        }
      }
      .content-box {
        // background-color: #fff;
        // padding: 0 20px;
        // min-height: 80%;
        position: absolute;
        top: 50px;
        bottom: 0px;
        left: 0;
        right: 0;
        .info-container {
          position: relative;
          width: 100%;
          height: 100%;
          .unread-onti {
            // border: $testBorder;
            position: absolute;
            top: 0px;
            bottom: 0;
            left: 0;
            right: 0;
            overflow: hidden;
            .table-line {
              position: absolute;
              top: 40px;
              bottom: 60px;
              left: 0;
              right: 0;
              overflow: auto;
            }
          }
        }
      }
    }
  }

  &.hide-outer {
    .center-content {
      max-width: none;
      @include absfull;
      height: auto;
      .middle-container {
        // border: 1px solid red;
        @include absfull;
        height: auto;
        .page-header {
          display: none;
        }
        .content-box {
          @include absfull;
          height: auto;
          .info-container {
            @include absfull;
            // border: 1px solid red;
            .page-card-tabs {
              @include absfull;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.dialog-footer {
  text-align: right;
}
@import '../../assets/styles/constForDDC.sass';
$greyTabBorder: #e4e7ed;
.notification-page {
  .content-box {
    // background-color: #fff;
    .page-card-tabs {
      height: 100%;
    }
    .el-tabs__header {
      margin: 0;
      // width: 100px;
      // border-right: 1px solid $greyTabBorder;
      .el-tabs__nav {
        border-radius: 0;
        border: none;
        .el-tabs__item {
          border-radius: 0;
          // color: #919191;
          border: none;
          &.is-active {
            background-color: var(--default-bgc);
            color: var(--default-opposite-color);
            font-weight: bold;
            border: 1px solid $greyTabBorder;
            // border-right: none;
            border-bottom: 2px solid #fff;
            height: 42px;
            // z-index: 5;
          }
        }
        .tab-label {
          vertical-align: top;
          text-align: center;
        }
      }
    }
    .el-tabs__content {
      position: absolute;
      // top: 35px;
      // top: 0px;
      // left: 120px;
      top: 42px;
      left: 0px;
      right: 0;
      bottom: 0;
      background-color: var(--white-grey-bgc);
      .el-tab-pane {
        position: absolute;
        top: 0px;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
  }

  // 自定义 table style
  // className 自定义
  .table-cell-clearpadding {
    padding: 0 0px;
  }
  .table-header-cell {
    background: #f6f6f6;
    height: 34px;
  }
  .table-check-box {
    text-align: center;
  }
}
</style>
