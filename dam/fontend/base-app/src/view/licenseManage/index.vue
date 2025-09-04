<template>
  <div class="licenseWrap">
    <datablau-page-title
      :parent-name="$t('common.page.licenseManage')"
      :name="$t('common.page.licenseManage')"
    ></datablau-page-title>
    <div class="main">
      <div class="topInfo">
        <div class="infoItem">
          <span>{{$t('system.licenseManageCatlog.companyName')}}：</span>
          <span>{{ licenseInfo.company }}</span>
        </div>
        <div class="infoItem">
          <span>{{$t('system.licenseManageCatlog.sysEnv')}}：</span>
          <span>{{ licenseInfo.deploymentEnv }}</span>
        </div>
      </div>
      <div class="licenseList">
        <div class="listTop">
          <datablau-detail-subtitle
            :title="$t('system.licenseManageCatlog.hasLicense')"
          ></datablau-detail-subtitle>
          <div class="topRight">
            <span style="font-size: 12px; color: #777">
              <i class="iconfont icon-tips"></i>
              {{$t('system.licenseManageCatlog.uploadTip')}}
            </span>
            <el-upload
              style="display: inline-block; margin-left: 10px"
              :action="uploadUrl"
              :before-upload="handleBeforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :show-file-list="false"
              accept=".lic"
              :headers="$headers"
            >
              <datablau-button class="iconfont icon-upload">
                {{$t('system.licenseManageCatlog.uploadFile')}}
              </datablau-button>
            </el-upload>
          </div>
        </div>

        <datablau-table :data="licenseData">
          <el-table-column
            :label="$t('system.licenseManageCatlog.fileName')"
            prop="licenseName"
          ></el-table-column>
          <el-table-column
            label="License ID"
            prop="licenseId"
          ></el-table-column>
          <el-table-column
            :label="$t('system.licenseManageCatlog.uploadTime')"
            prop="createTime"
            :formatter="$timeFormatter"
          ></el-table-column>
          <el-table-column :label="$t('system.licenseManageCatlog.operation')" width="120" align="center">
            <template slot-scope="scope">
              <datablau-pop-confirm
                @ok="deleteLicense(scope.row.id)"
                :content="$t('system.licenseManageCatlog.deletion')"
                icon="el-icon-warning"
                icon-color="red"
              >
                <datablau-button
                  slot="reference"
                  type="text"
                  class="iconfont icon-delete"
                ></datablau-button>
              </datablau-pop-confirm>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <div class="authPro">
        <datablau-detail-subtitle :title="$t('system.licenseManageCatlog.authorizedProduct')"></datablau-detail-subtitle>
        <div class="product">
          <div
            class="productItem"
            v-for="item in proList"
            :key="item.featureCode"
          >
            <div class="line1">
              <span>{{ item.featureName }}</span>
              <i
                :class="'iconfont ' + item.iconType"
                :style="{ color: item.iconColor }"
              ></i>
            </div>
            <div class="line3" :class="{ expired: item.status === 'error' }">
              <span class="text">{{$t('system.licenseManageCatlog.validityPeriod')}}：</span>
              <span class="date">
                {{ moment(item.startDate).format('YYYY-MM-DD') }}
              </span>
              <span class="text">&nbsp;{{$t('system.licenseManageCatlog.to')}}&nbsp;</span>
              <span class="date" v-if="item.expireDate < 4102415999999">
                {{ moment(item.expireDate).format('YYYY-MM-DD') }}
              </span>
              <span class="data" v-if="item.expireDate >= 4102415999999">
                {{ $t('system.licenseManageCatlog.forever') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import js from './index.js'
export default js
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.licenseWrap {
  color: $text-default;
  background: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  .main {
    padding: 6px 16px 0 20px;
    overflow: auto;
    position: absolute;
    top: 40px;
    bottom: 0;
    left: 0;
    right: 0;
    .topInfo {
      display: flex;
      .infoItem {
        height: 56px;
        line-height: 56px;
        padding-left: 24px;
        border-radius: 8px;
        font-size: 14px;
        width: 50%;
        background: rgba(64, 158, 255, 0.06);
        &:nth-child(1) {
          margin-right: 16px;
        }
      }
    }
    .licenseList {
      margin-top: 16px;
      .listTop {
        display: flex;
        justify-content: space-between;
        .topRight {
          //position: absolute;
          //top: 6px;
          //right: 16px;
        }
      }
    }
    .authPro {
      margin-top: 16px;
      .product {
        display: flex;
        flex-wrap: wrap;
        .productItem {
          width: 300px;
          height: 114px;
          border: 1px solid $border-color;
          border-radius: 8px;
          padding: 16px;
          margin-right: 16px;
          margin-bottom: 16px;
          .line1 {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .line3 {
            height: 32px;
            line-height: 32px;
            text-align: center;
            margin-top: 24px;
            background: rgba(214, 220, 234, 0.3);
            border-radius: 16px;
            .text {
              color: $text-message;
            }
            .date {
              color: $text-default;
            }
          }
          .expired {
            background: rgba(242, 34, 10, 0.08);
          }
        }
      }
    }
  }
}
</style>
