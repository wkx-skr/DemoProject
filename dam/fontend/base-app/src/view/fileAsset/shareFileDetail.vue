<template>
  <div class="page-outer width-1280 table-main-page">
    <div
      class="citic-scan share-file-detail page-container"
      v-if="fileDataResult"
    >
      <div class="row-nav">
        <span class="ddc-icon-back" @click="goBack">返回</span>
        <span>全部结果</span>
        <i class="fa fa-chevron-right"></i>
        {{ fileDataResult ? fileDataResult.name : '' }}
      </div>
      <div class="row-title">
        <datablau-icon
          :data-type="$fileTypeFormatter(fileDataResult.type)"
        ></datablau-icon>
        <div class="title">
          {{ fileDataResult.name }}
          <el-button
            type="text"
            title="编辑"
            v-if="!frontEnd && false"
            size="mini"
            class="el-icon-edit"
            @click="handleEdit"
          ></el-button>
        </div>
      </div>
      <div class="row-description">
        <!-- {{fileDataResult.description}} -->
        <span
          class="description"
          v-if="
            (!fileDataResult || !fileDataResult.description) &&
            !definitionEditing
          "
          style="color: #cbcbcb"
        >
          暂无描述
        </span>
        <div
          v-if="!definitionEditing"
          class="description"
          style="display: inline-block"
        >
          <span>{{ fileDataResult.description }}</span>
          <!-- <i
            v-if="!definitionEditing && contentWritable"
            title="编辑描述"
            class="icon-edit"
            @click="handleDefinitionEdit"></i> -->
          <el-button
            type="text"
            title="编辑描述"
            v-if="!definitionEditing && contentWritable && !frontEnd"
            size="mini"
            class="icon-edit"
            @click="handleDefinitionEdit"
          ></el-button>
        </div>

        <div class="definition-edit" v-if="definitionEditing">
          <el-input
            v-if="!definitionSaving"
            ref="definition"
            type="textarea"
            :rows="3"
            v-model="definition"
            :disabled="definitionSaving"
            size="mini"
            placeholder="在此输入描述"
          ></el-input>
          <el-button
            v-if="!definitionSaving"
            type="text"
            :disabled="definitionSaving"
            @click="saveDefinition"
          >
            提交
          </el-button>
          <el-button v-else size="mini" type="text" disabled>
            正在提交，请稍候
          </el-button>
        </div>
      </div>

      <div class="row-tag">
        &nbsp;
        <!-- <span
          v-if="tagsBefore"
          v-for="t in tagsBefore"
          :key="t.tagId"
          class="tag">{{t.name}}</span>
        <el-button
          v-if="frontEnd"
          type="primary" size="small" type="primary" @click="citicApplyData" icon="fa fa-heart" style="float:right;position:relative;bottom:10px;right:20px;"> 加入申请单</el-button> -->
      </div>
      <!-- <div class="row-property">
        <div class="property" v-if="frontEnd"><span class="label">所有者</span><span class="value">admin</span></div>
        <div class="property" v-if="frontEnd"><span class="label">版本号</span><span class="value">1.0</span></div>
        <div class="property"><span class="label">服务类型</span><span class="value">{{fileDataResult.serviceType ? $citicDataService.type[fileDataResult.serviceType].alias: '-'}}</span></div>

        <div class="property"><span class="label">浏览量</span><span class="value"><span v-if="frontEnd">{{fileDataResult.visitNum+1}}</span><span v-else>{{fileDataResult.visitNum}}</span></span></div>
        <div class="property"><span class="label">共享次数</span><span class="value">{{fileDataResult.shareNum}}</span></div>
      </div> -->
      <div class="row-tab white-box">
        <el-tabs
          v-model="activeTab"
          @tab-click="handleTabClick"
          class="blue-tabs"
        >
          <el-tab-pane label="详情" name="detail"></el-tab-pane>
          <el-tab-pane
            label="目录管理"
            name="menu"
            ref=""
            v-if="!frontEnd"
          ></el-tab-pane>

          <!-- <el-tab-pane
            label="权属管理" name="access" ref="" v-if="!frontEnd"></el-tab-pane> -->
        </el-tabs>
      </div>
      <div class="row-message white-box" v-if="activeTab === 'detail'">
        <div class="message-title">基础信息</div>
        <div class="info-outer">
          <!-- <field-title style="margin-top:3em;" >基本信息</field-title> -->
          <div class="file-info">
            <ul class="file-properties">
              <li>
                <span class="label">文件类型：</span>
                <span class="value">{{ fileDataResult.type }} 文件</span>
              </li>
              <li>
                <span class="label">文件大小：</span>
                <span class="value">
                  {{ $fileSizeFormatter(fileDataResult.size) }}
                </span>
              </li>
              <li>
                <span class="label">修改时间：</span>
                <span class="value">
                  {{ $timeFormatter(fileDataResult.lastModifyTime) }}
                </span>
              </li>
              <li>
                <span class="label">文件地址：</span>
                <span class="value">{{ fileDataResult.sharePath }}</span>
              </li>
            </ul>
          </div>
        </div>

        <field-title>业务属性</field-title>
        <share-file-udp-edit
          :summary="fileDataResult"
          :couldEdit="!frontEnd"
        ></share-file-udp-edit>
      </div>
      <div class="row-message white-box" v-else-if="activeTab === 'menu'">
        <pane-menu
          :type-id="this.$commentPreCode.ShareFile"
          @updateTags="handleUpdateTags"
          :item-id="fileDataResult.id"
          :path="pathArr"
        ></pane-menu>
      </div>
      <!-- <div class="row-message white-box" v-else-if="activeTab==='access'">
        <pane-access
          :itemData="fileDataResult"
        ></pane-access>
      </div> -->
      <div class="row-message white-box" v-else-if="activeTab === 'data'">
        暂无数据
      </div>
    </div>
  </div>
</template>
<script>
import scan from './shareFileDetail.js'
export default scan
</script>
<style lang="scss" scoped>
@import '../../assets/styles/constForDDC.sass';
$gold: #c6b57f;
.share-file-detail {
  .file-info {
    // border: 1px solid red;
    padding-left: 10px;
    padding-top: 10px;
    .file-properties {
      li {
        display: inline-block;
        width: 250px;
        line-height: 22px;
        margin-bottom: 25px;
        .label {
          display: block;
          color: #979797;
          font-size: 12px;
        }
        .vlaue {
          font-size: 12px;
        }
      }
    }
  }
}
.title-line {
  position: relative;
  .title {
    font-size: 24px;
    max-width: 80%;
    display: inline-block;
    //overflow : hidden;
    //text-overflow: ellipsis;
    //white-space:nowrap;
  }
  .sup-name {
    display: inline-block;
    background-color: $gold;
    color: #fff;
    padding: 5px 9px;
    border-radius: 3px;
    margin-left: 0.7em;
    //cursor:pointer;
  }
  .ordinary-btn {
    display: inline-block;
    border: 1px solid #eee;
    font-size: 15px;
    color: #606266;
    padding: 3px;
    height: 26px;
    border-radius: 3px;
    vertical-align: bottom;
    cursor: pointer;
  }
  vertical-align: top;
  margin-bottom: 22px;
}
.description-line {
  .description {
    width: 90%;
    max-width: 1100px;
  }
  .fileDataResult-box {
  }

  //outline:1px solid pink;
}
.fileDataResult-box {
  margin-top: 1.5em;
  //font-size:0;
  .detail {
    //outline:1px solid pink;
    font-size: 12px;
    &:nth-of-type(odd) {
      margin-right: 100px;
      width: 350px;
      @media only screen and (max-width: 1366px) {
        margin-right: 40px;
        width: 320px;
      }
    }
    &:nth-of-type(even) {
      width: calc(100% - 450px);
      //@media only screen and (min-width:1606px){
      //  margin-right:400px;
      //}
    }
    .label {
      width: 8em;
    }
    &.broader {
      width: 100%;
      .label {
      }
      .value {
        width: 80%;
        max-width: 1010px;
      }
    }
  }
}
.detail {
  width: 40%;
  vertical-align: top;
  display: inline-block;
  margin-top: 1em;
  .label {
    vertical-align: top;
    color: #9f9f9f;
    display: inline-block;
    line-height: 2em;
  }
  .value {
    display: inline-block;
    line-height: 2em;
    overflow: hidden;
    //text-overflow: ellipsis;
    //white-space:nowrap;
    word-wrap: break-word;
    max-width: 70%;
    .el-button {
      padding: 0;
    }
  }
}
.prop-line {
  margin-top: 40px;
  .title {
    //outline:1px solid pink;
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    border-left: 4px solid #4396f5;
    padding-left: 0.5em;
    color: #494850;
  }
  .line {
    border-top: 1px solid #e6e6e6;
    display: inline-block;
    width: 70%;
    vertical-align: middle;
    margin-left: 1em;
  }
  .table {
    margin-top: 20px;
    margin-right: 40px;
  }
}
#current-editing-box {
  display: none;
  position: absolute;
}
</style>
