<template>
  <div class="edit-api-tab" v-loading="loadingData">
    <div class="container api-form-edit">
      <div class="top-form">
        <el-form
          class="page-form edit-api-tab-form"
          label-position="right"
          label-width="180px"
          size="mini"
          :model="apiEditData"
          ref="apiEditForm"
          :inline="true"
          :disabled="!isEdit"
        >
          <div class="db-fieldMessage-title">
            <p class="message-title">接口配置</p>
          </div>
          <div class="form-group">
            <el-form-item label="API名称" v-if="!isEdit && false">
              <span
                style="font-size: 12px; width: 300px; display: inline-block"
              >
                {{ apiEditData.code }}
              </span>
            </el-form-item>
            <el-form-item label="API名称" prop="name">
              <datablau-input
                size="mini"
                class="api-form-edit-input"
                v-model="apiEditData.name"
                placeholder="请输入API名称"
                :disabled="!isEdit"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="版本号" prop="version">
              <datablau-input
                size="mini"
                class="api-form-edit-input"
                v-model="apiEditData.version"
                placeholder="请输入版本号"
                :disabled="!isEdit"
              ></datablau-input>
            </el-form-item>
            <br />
            <el-form-item label="分类" prop="apiCatalog" label-width="180px">
              <datablau-select
                class="api-form-edit-input"
                v-model="apiEditData.apiCatalog"
                placeholder="请选择分类"
                :disabled="!isEdit"
                allow-create
                filterable
              >
                <el-option
                  v-for="item in apiCatalogArr"
                  :key="item.id"
                  :label="item.apiCatalog"
                  :value="item.apiCatalog"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="访问地址" prop="api">
              <span class="url-line" v-if="!isEdit">
                <span class="url-content">
                  {{ ApiBaseurl }}{{ apiEditData.api }}
                </span>
              </span>
              <span class="copy-btn" @click="copyToClipboard">复制</span>
            </el-form-item>
            <br />
            <el-form-item prop="effectiveTime" class="" label="下线时间">
              <datablau-datePicker
                v-if="apiEditData.effectiveTime"
                type="date"
                value-format="timestamp"
                size="mini"
                class="api-form-edit-input data-picker"
                v-model="apiEditData.effectiveTime"
                placeholder="请选择导入日期"
                :disabled="true"
              ></datablau-datePicker>
              <span v-else class="span-info">无</span>
            </el-form-item>
            <el-form-item label="流量限制" prop="flowLimit">
              <span class="span-info">
                {{ apiEditData.flowLimit || '-' }} 次/分钟
              </span>
            </el-form-item>
            <br />
            <el-form-item label="超时限制" prop="overtimeLimit">
              <span class="span-info">
                {{ apiEditData.overtimeLimit || '-' }} 秒
              </span>
            </el-form-item>
            <el-form-item label="调用方式" prop="method">
              <datablau-select
                class="api-form-edit-input"
                v-model="apiEditData.method"
                placeholder="请选择调用方式"
                :disabled="!isEdit"
              >
                <el-option
                  v-for="item in methodArr"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <br />
            <el-form-item label="调用协议" prop="apiProtocol">
              <datablau-select
                class="api-form-edit-input"
                v-model="apiEditData.apiProtocol"
                placeholder="请选择调用协议"
                :disabled="!isEdit"
              >
                <el-option
                  v-for="item in ['http', 'https']"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="更新频率" prop="updateFrequency">
              <datablau-select
                class="api-form-edit-input"
                v-if="apiEditData.updateFrequency"
                v-model="apiEditData.updateFrequency"
                placeholder="请选择更新频率"
                :disabled="!isEdit"
              >
                <el-option
                  v-for="item in updateFrequencyArr"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
              <span v-else class="span-info">/</span>
            </el-form-item>
            <br />
            <el-form-item label="返回格式" prop="resultType">
              <datablau-select
                class="api-form-edit-input"
                v-model="apiEditData.resultType"
                placeholder="请选择返回格式"
                :disabled="!isEdit"
              >
                <el-option
                  v-for="item in resultTypeArr"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <br />
            <!--</p>-->
            <!--</div>-->
            <!--</div>-->
            <el-form-item label="接口说明" prop="description">
              <datablau-input
                size="mini"
                v-if="apiEditData.description"
                class="api-form-edit-input text-input-com"
                type="textarea"
                v-model="apiEditData.description"
                placeholder="请输入接口说明"
                :disabled="!isEdit"
                :autosize="{ minRows: 3 }"
                clearable
              ></datablau-input>
              <span v-else class="span-info">/</span>
            </el-form-item>
            <br />
            <el-form-item
              label="API描述:"
              prop="description"
              class="report-description"
              v-if="false"
            >
              <span v-if="!isEdit">暂无描述</span>
              <div class="markdown">
                <!--<mavon-editor :defaultOpen="'preview'"-->
                <!--v-if="false && !isEdit && apiEditData.description"-->
                <!--    :toolbarsFlag="false"-->
                <!--    :editable="false"-->
                <!--    :scrollStyle="true"-->
                <!--    :subfield="false"-->
                <!--    :toolbars="toolbars"-->
                <!--    style="min-height:60px;max-height:300px"-->
                <!--    v-model="apiEditData.description"/>-->
                <!--<mavon-editor style="height:300px" v-if="isEdit" :toolbars="toolbars"  v-model="apiEditData.description"/>-->
              </div>
            </el-form-item>
            <br />
            <el-form-item
              label="API链接"
              prop="url"
              class="report-link-item"
              v-if="false"
            >
              <datablau-input
                size="mini"
                type="textarea"
                v-model="apiEditData.url"
                placeholder="请输入API链接"
                :disabled="!isEdit"
                v-if="isEdit"
              ></datablau-input>
              <el-tooltip
                v-else
                effect="light"
                :content="apiEditData.url"
                placement="top"
                popper-class="report-url-tooltip"
              >
                <span class="report-link" @click="skip2Url(apiEditData.url)">
                  {{ apiEditData.url }}
                </span>
              </el-tooltip>
            </el-form-item>
            <br />
          </div>
          <h3 class="form-title" v-if="false">
            <span>数据安全</span>
          </h3>
          <div class="form-group" v-if="false">
            <el-form-item label="数据等级" prop="dataAccessLevel">
              <datablau-select
                class="api-form-edit-input"
                v-model="apiEditData.dataAccessLevel"
                placeholder="请选择数据等级"
                :disabled="!isEdit"
              >
                <el-option
                  v-for="item in safeLevels"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </datablau-select>
              <el-tooltip
                effect="light"
                content="API数据的安全等级要高于选择表的数据安全等级"
                placement="top"
                v-if="false"
              >
                <i class="el-icon-info"></i>
              </el-tooltip>
            </el-form-item>
          </div>
          <h3 class="form-title">
            <div class="db-fieldMessage-title">
              <p class="message-title">参数列表</p>
            </div>
            <span class="add-btn" v-if="isEdit">
              <datablau-button type="text" size="mini" @click="addParam">
                新增
              </datablau-button>
            </span>
          </h3>
          <div class="form-group list-form-item">
            <el-form-item>
              <div class="form-item-container">
                <div class="params-list">
                  <params-list
                    ref="paramsList"
                    :paramLocations="paramLocations"
                    :paramTypes="paramTypes"
                    :defaultParamsList="paramsList"
                    :isEdit="isEdit"
                    :apiEditData="apiEditData"
                    key="paramsList"
                  ></params-list>
                </div>
              </div>
            </el-form-item>
          </div>
          <h3 class="form-title">
            <div class="db-fieldMessage-title">
              <p class="message-title">返回值列表</p>
            </div>
            <span class="add-btn" v-if="isEdit">
              <datablau-button type="text" size="mini" @click="addReturnCol">
                新增
              </datablau-button>
            </span>
          </h3>
          <div class="form-group list-form-item">
            <el-form-item>
              <div class="form-item-container">
                <div class="return-list">
                  <return-cols-com
                    ref="returnColsCom"
                    :isEdit="isEdit"
                    :apiEditData="apiEditData"
                    :safeLevels="safeLevels"
                    :defaultReturnColsList="returnColsList"
                    :getColumnList="getColumnList"
                    key="returnColsCom"
                  ></return-cols-com>
                </div>
              </div>
            </el-form-item>
          </div>
          <div class="db-fieldMessage-title">
            <p class="message-title">返回数据示例</p>
          </div>
          <div class="form-group return-examples">
            <el-form-item label="" prop="apiResultExample">
              <datablau-input
                size="mini"
                type="textarea"
                class="api-form-edit-input"
                v-model="apiEditData.apiResultExample"
                placeholder="请输入返回数据示例"
                :disabled="!isEdit"
                v-if="isEdit"
                :autosize="{ minRows: 5 }"
              ></datablau-input>
              <div class="json-preview">
                <div
                  class="script-container sql-container"
                  v-if="!isEdit && showJsonContent"
                >
                  <div class="sql-content" v-if="apiEditData.apiResultExample">
                    <pre><code class="language-json"><p v-html="jsonFormatter(apiEditData.apiResultExample)"></p></code></pre>
                  </div>
                  <div v-else-if="!apiEditData.apiResultExample">无</div>
                </div>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import apiDataTab from './apiDataTab'

export default apiDataTab
</script>

<style lang="scss" scoped>
.edit-api-tab {
  .api-form-edit {
    margin-left: 20px;
  }
  .api-form-edit-input {
    /deep/.el-input {
      width: 300px;
      input {
        border: 0;
        outline: null;
      }
    }
  }
  .params-list,
  .return-list {
    position: relative;
    //height: 300px;
  }
  /deep/.el-form.page-form .el-form-item__label {
    font-weight: bold;
  }
  .form-item-container {
    display: inline-block;
    //width: 100%;
  }
  .text-input-com {
    width: 800px;
    & /deep/ textarea {
      width: 100%;
      //border: 1px solid red;
    }
  }
  .form-group {
    padding: 10px 0 30px 0;
    &.list-form-item {
      //border: 1px solid red;
      position: relative;

      .form-item-container {
        //position: absolute;
        width: 100%;
        // padding: 20px 0;
        //border: 1px solid green;
      }
    }

    &.return-examples {
      // padding: 20px 0;
    }
  }

  .top-form {
    .page-form {
      .form-group /deep/ .el-form-item {
        vertical-align: middle;
        //border: 1px solid red;
        margin-bottom: 4px;

        &.el-form-item--mini .el-form-item__label {
          //line-height: 28px;
        }

        .el-form-item__content {
          .datablau-input__inner {
            //border: 1px solid red;
            height: 28px;
          }
        }
      }
    }

    .url-line {
      line-height: 28px;
      vertical-align: top;
      //border: 1px solid red;
      margin-left: 15px;
      max-width: 400px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      color: #409eff;
      cursor: pointer;
      margin-left: 10px;
    }
  }

  .parent-form-item {
    position: relative;
    margin-top: -10px;
    //border: 1px solid red;

    .parent-label {
      //border: 1px solid yellow;
      position: absolute;
      top: 10px;
      width: 120px;
      vertical-align: middle;
    }

    .form-item-container {
      position: relative;
      //border: 1px solid red;
      padding: 0px 20px 20px 50px;
      //right: 0;
      //width: 100%;

      .effective-time-item {
        margin-left: 60px;
        .data-picker {
          width: 285px;
        }
      }

      .group-border-outer {
        //border: 1px solid #eee;
        padding: 50px 0px 0 10px;
      }
    }
  }

  .return-examples {
    .el-form-item--mini {
      width: 100%;

      .el-form-item__content {
        width: 100%;
        //border: 1px solid red;
      }

      .json-preview {
        .script-container {
          box-sizing: border-box;
          //overflow: scroll;
        }

        //border: 1px solid red;
        //overflow: scroll;
        width: 100%;
      }
    }
  }

  .add-btn {
    float: right;
    margin-right: 20px;
  }

  .el-form.page-form {
    & /deep/ input.datablau-input__inner[disabled] {
      border: 1px solid transparent;
    }

    & /deep/ .el-textarea__inner[disabled] {
      border: 1px solid transparent;
    }

    & .span-info {
      display: inline-block;
      width: 300px;
      box-sizing: border-box;
      padding-left: 15px;
    }
  }
}
</style>
<style>
.el-input__inner:disabled + .el-input__prefix {
  font-size: 0;
}
</style>
