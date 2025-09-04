<template>
  <!-- <div class="email-template"> -->
  <datablau-dialog
    :title="title"
    :visible.sync="visible"
    size="xl"
    :close-on-click-modal="false"
    append-to-body
    :height="606"
  >
    <div
      style="
        height: 450px;
        overflow: auto;
        min-width: 920px;
        position: relative;
      "
      class="dialog-content-box"
      v-loading="loading"
    >
      <span v-if="!templateDtoList.length && !loading">
        {{ $t('system.systemSetting.emptyText') }}
      </span>
      <!-- style="position: absolute; top: 0; bottom: 0; left: 0; right: 0" -->
      <datablau-tabs
        type="card"
        :activeName="currentTypeId"
        v-model="currentTypeId"
        v-show="!!templateDtoList.length"
      >
        <el-tab-pane
          v-for="item in templateDtoList"
          :key="item.id + item.sceneModelName"
          :label="item.sceneModelName"
          :name="item.sceneModelName"
        >
          <div class="email-content">
            <div class="email-left">
              <h3>{{ $t('system.systemSetting.parameterList') }}</h3>
              <ul>
                <li v-for="(value, key) in item.paramsMap" :key="key">
                  <span>{{ key }}</span>
                  <span>{{ value }}</span>
                  <datablau-button type="text" @click="addParam(value)">
                    {{ $t('common.button.add') }}
                  </datablau-button>
                </li>
              </ul>
            </div>
            <div class="email-right">
              <div class="email-theme detail">
                <h3>{{ $t('system.systemSetting.mailTheme') }}</h3>
                <div class="value">
                  <datablau-input v-model="item.subject"></datablau-input>
                </div>
              </div>
              <div class="email-item-content detail">
                <h3>{{ $t('system.systemSetting.mailContent') }}</h3>
                <div class="value">
                  <!-- TODO: 富文本编辑器 -->
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!-- <el-tab-pane :label="'任务失败邮件'" :name="'error'"></el-tab-pane> -->
      </datablau-tabs>
      <div
        style="
          width: 70%;
          height: calc(100% - 130px);
          position: absolute;
          right: 0;
          bottom: 0;
        "
        v-show="!!templateDtoList.length"
      >
        <datablau-editor ref="editor"></datablau-editor>
      </div>
    </div>

    <div slot="footer">
      <div class="email-template-footer">
        <datablau-checkbox
          class="filter-input"
          style="position: absolute; top: -30px"
          :checkboxType="'single'"
          v-model="sendResult"
          @change="sendResultChange"
          v-show="!!templateDtoList.length"
        >
          {{ $t('system.systemSetting.senResult') }}
        </datablau-checkbox>
        <datablau-button
          type="important"
          @click="saveEmailTemplate"
          :disabled="!templateDtoList.length || loading"
        >
          {{ $t('common.button.save') }}
        </datablau-button>
        <datablau-button type="secondary" @click="visible = false">
          {{ $t('common.button.close') }}
        </datablau-button>
      </div>
    </div>
    <!-- <div slot="bottom">
        <datablau-checkbox
          class="filter-input"
          style="margin-left: 20px"
          :checkboxType="'single'"
          v-model="sendResult"
          @change="sendResultChange"
        >
          发送结果附件
        </datablau-checkbox>
        <datablau-button type="important">保存</datablau-button>
        <datablau-button type="secondary" @click="visible = false">
          关闭
        </datablau-button>
      </div> -->
  </datablau-dialog>
  <!-- </div> -->
</template>
<script>
import HTTP from '@/http/main'
export default {
  data() {
    return {
      visible: false,
      sendResult: false,
      affixEnable: 0,
      loading: true,
      currentTypeId: '',
      title: '',
      templateDtoList: [],
      contextData: {},
      params: {},
      sceneId: null,
    }
  },

  mounted() {
    this.$bus.$on('openEmailTemplate', this.openEmailTemplate)
  },
  methods: {
    openEmailTemplate(sceneId) {
      this.sceneId = sceneId
      this.visible = true
    },
    sendResultChange(val) {
      this.affixEnable = val ? 1 : 0
    },
    addParam(param) {
      // NOTE: 添加邮件内容中的参数
      const dom = $('.ql-editor[contenteditable]')
      let index
      index = this.$refs.editor.quill.selection.savedRange.index
      this.$refs.editor.quill.insertText(index, param)
      this.$refs.editor.quill.selection.savedRange.index = dom.html().length
      this.$refs.editor.quill.focus()
    },
    saveEmailTemplate() {
      const dom = $('.ql-editor[contenteditable]')
      let currentHtml = dom.html()
      this.params.affixEnable = this.affixEnable
      this.params.sceneId = this.sceneId
      this.params.templateBoList = _.cloneDeep(this.templateDtoList)
      this.params.templateBoList.forEach(item => {
        item.content =
          this.currentTypeId === item.sceneModelName
            ? currentHtml
            : this.contextData[item.sceneModelName]
        delete item.paramsMap
        delete item.sceneModelName
        delete item.context
      })
      HTTP.updateTemplate(this.params)
        .then(res => {
          this.$datablauMessage.success(
            this.$t('system.systemSetting.mailTempUpdated')
          )
          this.visible = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    currentTypeId: {
      handler: function (newVal, oldVal) {
        this.$nextTick(() => {
          const dom = $('.ql-editor[contenteditable]')
          if (this.contextData.hasOwnProperty(oldVal)) {
            this.contextData[oldVal] = dom.html()
          }
          if (this.contextData.hasOwnProperty(newVal)) {
            dom.html(this.contextData[newVal])
            this.$refs.editor.quill.selection.savedRange.index =
              dom.text().length
          }
        })
      },
    },
    visible: {
      handler: function (newVal) {
        // this.objectRate = newVal
        // true的时候重新加载数据
        if (newVal) {
          this.loading = true
          this.templateDtoList = []
          this.contextData = {}
          this.params = {}
          HTTP.getemail(this.sceneId)
            .then(res => {
              this.title = this.$t('system.systemSetting.editTitle', {
                title: res.data.data.sceneName,
              })
              this.templateDtoList = res.data.data.templateDtoList
              this.currentTypeId = this.templateDtoList[0].sceneModelName
              this.templateDtoList.forEach(item => {
                // this.contextData[item.sceneModelName] = item.context
                this.$set(this.contextData, item.sceneModelName, item.context)
              })
              const dom = $('.ql-editor[contenteditable]')
              dom.html(this.contextData[this.currentTypeId])
              this.affixEnable = res.data.data.affixEnable
              this.sendResult = !!res.data.data.affixEnable
              this.loading = false
            })
            .catch(e => {
              this.loading = false
              this.$showFailure(e)
            })
        } else {
          this.contextData = {}
          this.currentTypeId = ''
          const dom = $('.ql-editor[contenteditable]')
          dom.html('')
        }
      },
    },
  },
}
</script>
<style lang="scss">
.email-template-footer {
  position: relative;
  width: 100%;
  text-align: left;
}
.email-content {
  width: 100%;
  height: 100%;
  display: flex;
  border-bottom: 1px solid #ccc;
  .email-left {
    box-sizing: border-box;
    width: 30%;
    height: 100%;
    border: 1px solid #ccc;
    border-bottom: none;
    h3 {
      box-sizing: border-box;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-bottom: 1px solid #ccc;
    }
    ul {
      display: block;
      width: 100%;
      height: calc(100% - 40px);
      overflow: auto;
      li {
        display: flex;
        align-items: center;
        margin: 5px;
        > span {
          width: 40%;
          font-size: 12px;
        }
      }
    }
  }
  .email-right {
    box-sizing: border-box;
    width: 70%;
    .email-theme {
      height: 40px;
      display: flex;
      align-items: center;
      .value {
        flex-grow: 1;
        .datablau-input {
          width: 100%;
        }
      }
    }
    h3 {
      margin: 0 10px;
    }
  }
}
.dialog-content-box {
  .datablau-tabs {
    height: 100%;
    .el-tabs {
      height: 100%;
      //   .el-tabs__header {
      //     border-bottom: 1px solid #ccc!important;
      //   }
      .el-tabs__content {
        height: calc(100% - 34px);
        .el-tab-pane {
          height: 100%;
          padding-bottom: 0;
        }
      }
    }
  }
  .datablau-editor {
    box-sizing: border-box;
    height: calc(100% - 42px);
    .ql-container {
      border-bottom: none;
    }
  }
}
</style>
