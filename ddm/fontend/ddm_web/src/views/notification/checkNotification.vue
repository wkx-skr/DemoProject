<template>
  <div class="data-auth-message-page">
    <div class="msg-item">
      <span class="item-label">{{ $t('userPane.inbox.sender') }}</span>
      <div class="msg-container">
        {{ notifi.source }}
      </div>
    </div>
    <div class="msg-item" v-if="notifi.priority !== 1">
      <span class="item-label">{{ $t('userPane.inbox.to') }}</span>
      <div class="msg-container">
        {{ notifi.target }}
      </div>
    </div>
    <div class="msg-item msg-title">
      <span class="item-label">{{ $t('userPane.inbox.subject') }}</span>
      <div class="msg-container">
        {{ notifi.title }}
      </div>
    </div>
    <div class="msg-item msg-body" v-if="defaultNoti">
      <span class="item-label">{{ $t('userPane.inbox.content') }}</span>
      <div
        class="msg-container"
        v-html="message"
        v-if="notifi.type + '' === '1100'"
      ></div>
      <div
        class="msg-container"
        v-if="notifi.type + '' === '1500' && message.includes('点击')"
      >
        <span>{{ message.split('点击')[0] + '点击' }}</span>
        <span
          style="color: #4386f5; cursor: pointer"
          @click="
            gotoProblemDetail(
              parseInt(message.split('点击')[1].split('}')[0].split('{')[1])
            )
          "
        >
          查看
        </span>
        <span>{{ message.split('点击')[1].split('}')[1] }}</span>
      </div>
      <div class="msg-container" v-else>
        <span v-html="message"></span>
      </div>
    </div>
    <div class="msg-item" v-else>
      <span class="item-label">回复信息:</span>
      <div class="msg-container">
        {{ notifi.message }}
      </div>
    </div>
    <div class="msg-item changed-view-data" v-if="notifi.type + '' === '1001'">
      <span class="item-label">获得权限:</span>
      <div class="msg-container">
        <div class="viedata" v-for="item in viewChangedData" :key="item.viewId">
          <!-- <span>{{item}}</span> -->
          获得视图
          <span class="view-name" @click="skip2View(item)">
            {{ item.viewName }}
          </span>
          的查看权限，所属表：{{ item.tablePhysicalName }}。
          <!-- <span
            @click="skipToTable(item.tableObjectId)"
          >
            {{item.tablePhysicalName}}。
          </span> -->
        </div>
      </div>
    </div>
    <div class="msg-item changed-view-data" v-if="notifi.type + '' === '1002'">
      <span class="item-label">申请结果:</span>
      <div
        class="msg-container"
        v-if="rejectTableNameArr && rejectTableNameArr.length > 0"
      >
        对表
        {{ rejectTableNameArr.join(',') }}
        的申请被拒绝：
      </div>
    </div>
  </div>
</template>

<script>
import notification from './checkNotification.js'
export default notification
</script>

<style lang="scss">
.data-auth-message-page {
  padding: 20px;

  .msg-item {
    margin-bottom: 15px;

    .item-label {
      display: inline-block;
      width: 60px;
      text-align: right;
      margin-right: 20px;
      vertical-align: top;
    }
    .msg-container {
      display: inline-block;
      .view-name {
        color: #409eff;
        cursor: pointer;
      }
    }
    &.msg-body, &.msg-title {
      .msg-container {
        width: 84%;
      }
    }
  }
}
</style>
