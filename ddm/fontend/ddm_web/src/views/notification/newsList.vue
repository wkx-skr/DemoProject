<template>
  <div class="mes-page" :class="classStr">
    <edit-announcement
      ref="editAnnouncement"
      @updateAnnouncement="updateAnnouncement"
    ></edit-announcement>
    <div class="top-btn-line">
      <div
        class="notification-title"
        style="font-size: 16px; padding: 10px 0 0 20px"
      >
        <p v-if="type === 'messageInbox'">
          {{ $t('userPane.title.inbox') }}
          <i
            style="cursor: pointer"
            class="el-icon-refresh"
            @click="handleRefresh"
          ></i>
        </p>
        <p v-if="type === 'messageSendMailbox'">
          {{ $t('userPane.title.sent') }}
          <i
            style="cursor: pointer"
            class="el-icon-refresh"
            @click="handleRefresh"
          ></i>
        </p>
        <div class="vertical-middle top-line-inner">
          <datablau-input
              :iconfont-state="true"
              placeholder="搜索标题"
              prefix-icon="el-icon-search"
              v-model="keyword"
              :clearable="true"
          ></datablau-input>
          <span
            class="filter-header-btn"
            v-if="hasUnread && !showSentNoti"
            style="margin-left: 20px"
          >
            <datablau-button
              @click="handleSetAllReaded"
              type="normal"
              size="mini"
            >
              {{ $t('userPane.inbox.markAllAsRead') }}
            </datablau-button>
          </span>
          <span style="display: inline-block" v-if="!showSentNoti">
            <datablau-switch
              v-model="switchType"
              :active-text="$t('userPane.inbox.unreadOnly')"
              inactive-text=" "
            ></datablau-switch>
          </span>
          <datablau-button
            class="iconfont icon-publish-news"
            style="float:right;margin-right: 20px;"
            v-if="type === 'messageSendMailbox'"
            type="important"
            @click="$emit('showSend')"
          >
            发送消息
          </datablau-button>
          <datablau-button
            class="iconfont icon-publish"
            style="float:right;margin-right: 20px;"
            type="normal"
            @click="editAnnouncement"
            v-if="type === 'messageSendMailbox' && $store.state.user.isAdmin"
          >
            发布公告
          </datablau-button>
        </div>
      </div>
    </div>
    <div class="announcement-container">
     <span class="announcement-text" v-if="showAnnouncement" @click="checkAnnouncement">
       <span class="title">{{ announcement.title }}：</span>
       <span class="content">{{ announcement.content }}</span>
     </span>
    </div>
    <datablau-form-submit
      class="message-table-row"
      :class="{'show-announcement': showAnnouncement}"
    >
      <datablau-table
        height="100%"
        class="datablau-table"
        ref="dsTable"
        v-loading="loadingMsg"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :data="displayData"
        :row-class-name="getRowClassName"
        :row-style="{ cursor: 'pointer' }"
        @row-click="handleRowClick"
        v-if="true"
        :data-selectable="!showSentNoti"
      >
        <el-table-column
          label=""
          width="60"
          prop="read"
          show-overflow-tooltip
          v-if="!showSentNoti && false"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.read">
              <i class="fa fa-envelope-open-o"></i>
            </span>
            <span v-else class="unread-icon">
              <i class="fa fa-envelope-o"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('userPane.inbox.subject')"
          min-width="320"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span v-if="scope.row.read" style="position: relative">
              <i class="iconfont icon-read" style="color: #999;position: relative;top:2px;"></i>
            </span>
            <span v-else class="unread-icon" style="position: relative">
              <i class="iconfont icon-unread" style="color: #409EFF;position: relative;top:2px;"></i>
            </span>
            <span
              style="padding-left: 5px"
              :class="{ 'read-style': scope.row.read }"
            >
              {{ scope.row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('userPane.inbox.sender')"
          width="100"
          prop="source"
          show-overflow-tooltip
          v-if="!showSentNoti"
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.inbox.to')"
          width="100"
          prop="target"
          show-overflow-tooltip
          v-if="showSentNoti"
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('userPane.inbox.type')"
          min-width="150"
          prop="category"
          show-overflow-tooltip
          align="center"
          sortable="custom"
        >
          <template slot-scope="scope">
           <span
             class="tag"
             v-if="scope.row.category === '消息'"
             style="
             display: inline-block;
             text-align: center;
             color: #3466C0;
             background: rgba(52, 102, 192, 0.15);
             display: inline-block;
             text-align: center;
             width: 108px;
              "
           >
              {{ scope.row.category }}
            </span>
            <span
              v-else
              class="tag"
              style="
              display: inline-block;
              text-align: center;
              color: rgb(83, 167, 173);
              background: rgba(83, 167, 173, 0.15);
              display: inline-block;
              text-align: center;
              width: 108px;
               "
            >
              {{ scope.row.category }}
            </span>
            <!--            <span
              class="messageType"
              style="width: 116px"
              v-else-if="scope.row.type === 1"
            >
              {{ $messageTypeMap[scope.row.type] }}
            </span>
            <span
              class="messageType"
              v-else-if="
                scope.row.type === 1000 ||
                scope.row.type === 1200 ||
                scope.row.type === 1100 ||
                scope.row.type === 1003 ||
                scope.row.type === 1300
              "
            >
              {{ $messageTypeMap[scope.row.type] }}
            </span>
            <span
              class="messageType"
              style="border: 1px solid #57a07f; color: #57a07f"
              v-else-if="scope.row.type === 1001"
            >
              {{ $messageTypeMap[scope.row.type] }}
            </span>
            <span
              class="messageType"
              style="border: 1px solid #f46565; color: #f46565"
              v-else-if="scope.row.type === 1002 || scope.row.type === 9999"
            >
              {{ $messageTypeMap[scope.row.type] }}
            </span>
            <span class="messageType" v-else>
              {{ $messageTypeMap[scope.row.type] }}
            </span>-->
          </template>
        </el-table-column>
        <!--commit: d68b602609d04cd7665902fffe1057ea20d062d8, 移除删除功能-->
        <el-table-column
          :label="$t('userPane.inbox.sentDate')"
          fixed="right"
          width="200"
          prop="createdOn"
          show-overflow-tooltip
          :formatter="$timeFormatter"
          sortable="custom"
        ></el-table-column>
        <el-table-column
          label="操作"
          fixed="right"
          width="100"
          header-align="center"
          align="center"
          v-if="false"
        >
          <template slot-scope="scope">
            <el-button @click="checkMsg(scope.row)" type="text" size="mini">
              查看
            </el-button>
            <el-button
              @click="handleRemoveMsg(scope.row)"
              type="text"
              size="mini"
              v-if="!showSentNoti"
            >
              {{ $t('common.button.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button">
          <div
            class="btn-container"
            v-if="!showSentNoti && selection.length > 0"
          >
            <span
              class="check-info"
              style="
                width: 14px;
                height: 14px;
                display: inline-block;
                background: #409eff;
                margin-right: -13px;
                vertical-align: middle;
              "
            ></span>
            <span class="footer-row-info">
              {{ $t('system.systemSetting.selLen', {num: selection.length}) }}
            </span>

            <datablau-button
              @click="handleSetSectionedReadeds"
              type="normal"
              v-if="selection.length > 0 && couldDelete"
              :disabled="!couldDelete"
            >
              {{ $t('userPane.inbox.markAsUnread') }}
            </datablau-button>
            <datablau-button
              @click="handleSetSectionedReaded"
              type="normal"
              size="mini"
              v-if="selection.length > 0 && chooseUnread"
              :disabled="!chooseUnread"
            >
              {{ $t('userPane.inbox.markAsRead') }}
            </datablau-button>
          </div>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import newList from './newList.js'

export default newList
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';

$lightGreenForBtn: #ebf1fa;
$bottomHeight: 45px;
$primary-color: #409eff;

.mes-page {
  // border: $testBorder;
  position: absolute;
  top: 0px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  .top-btn-line {
    height: 80px;

    .notification-title {
      p {
        font-weight: 600;
        font-size: 16px;
        color: #555;
      }
    }

    .el-icon-refresh:hover {
      color: $primary-color;
    }

    .top-line-inner {
      margin-bottom: 10px;
      margin-top: 10px;

      .search-input {
        max-width: 200px;
        display: inline-block;
      }
    }
    // padding-left: 20px;
    .left-btn-conta {
      display: inline-block;
      width: 70%;
      height: 100%;
      // border: 1px solid red;
      // vertical-align: middle;
      padding-top: 4px;
      .btn-item {
        width: 100px;
        height: 30px;
        display: inline-block;
        background-color: $lightGreenForBtn;
        color: $deepBlueForBtn;
        text-align: center;
        line-height: 30px;
        margin-right: 10px;
        cursor: pointer;
        &.active {
          background-color: $deepBlueForBtn;
          color: var(--heading-ddc-bgc);
        }
      }
    }
    .show-unread-checkbox {
      margin: 10px 0 0 20px;
    }
    .refresh-btn {
      float: right;
      margin: 8px 20px 0 0;
      // background-color: $deepBlueForBtn;
      // color: #fff;
      font-size: 20px;
      padding: 5px 10px;
      border-radius: 0;
      position: relative;
      // top: -20px;
    }
  }
  .announcement-container {
    //border: 1px solid red;
    position: relative;
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .announcement-text {
      //border: 1px solid red;
      line-height: 40px;
      cursor: pointer;
      transition: color 0.5s;

      &:hover {
        color: $primary-color;
      }

      .title {
        line-height: 40px;
        font-size: 16px;
        font-weight: bold;
      }

      .content {
        line-height: 40px;
        padding: 0 10px;
        font-size: 14px;
      }
    }

  }
  .message-container {
    border: 1px solid red;
    .message-title {
      font-size: 16px;
      font-weight: bold;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
  }
  .message-table-row {
    top: 90px;
    &.show-announcement {
      top: 130px;
    }
  }
  .el-switch__label {
    span {
      font-size: 12px;
    }
  }
  .el-switch__label:not(.is-active) {
    color: #999;
  }
  .read-style {
    color: #999;
  }
  .filter-header-btn {
    &::before {
      display: inline-block;
      width: 2px;
      height: 14px;
      margin-right: 10px;
      vertical-align: middle;
      content: '';
      background-color: #e0e0e0;
    }
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 13px;
      color: white;
    }
  }
  .el-table tr {
    background-color: none !important;
  }
  .messageType {
    width: 92px;
    height: 22px;
    line-height: 20px;
    color: #719ff5;
    border: 1px solid #719ff5;
    display: block;
    text-align: center;
    border-radius: 2px;
  }
}
</style>

<style lang="scss">
@import '../../assets/styles/tableStyleWidthBorder.scss';

.mes-page {
  @include tableStyle;

  .table-row-class {
    color: var(color-text-secondary);

    &.read-msg {
      color: var(--default-opposite-color);
    }
  }

  .left-button {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    left: 20px;
  }
}
</style>
