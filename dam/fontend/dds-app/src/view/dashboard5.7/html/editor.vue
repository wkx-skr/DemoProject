<template>
  <div>
    <el-dialog
      :title="$t('assetCount.preview')"
      width="70%"
      append-to-body
      :visible.sync="viewDialogVisible"
    >
      <div
        v-if="viewDialogVisible"
        ref="div"
        style="min-height: 400px; position: relative"
        v-html="form.result"
      ></div>
    </el-dialog>
    <datablau-form
      label-position="right"
      label-width="4em"
      v-loading="isLoading"
      ref="form"
      :model="form"
      :rules="rules"
    >
      <el-form-item :label="$t('assetCount.name')" prop="name">
        <datablau-input v-model="form.name"></datablau-input>
      </el-form-item>
      <el-form-item label="HTML">
        <datablau-input
          v-model="form.html"
          type="textarea"
          :rows="8"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="CSS">
        <datablau-input
          v-model="form.css"
          type="textarea"
          :rows="8"
        ></datablau-input>
      </el-form-item>
      <el-form-item label="JS">
        <datablau-input
          v-model="form.js"
          type="textarea"
          :rows="8"
        ></datablau-input>
      </el-form-item>
      <div class="dialog-bottom">
        <!--<el-button
          @click="handleView"
        >预览</el-button>-->
        <datablau-button @click="handleCancel" type="secondary">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button @click="handleSave">
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-form>
  </div>
</template>

<script>
const WidgetsNamePrefix = 'dashboard-h5-'
export default {
  data() {
    const validator = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('assetCount.comNotCanNull')))
      }
      if (
        this.listData.some(item => {
          let flag = this.currentData ? this.currentData.id != item.id : true
          return value === item.name && flag
        })
      ) {
        callback(new Error(this.$t('assetCount.comNotCanRename')))
      } else {
        callback()
      }
    }
    return {
      form: {
        name: '',
        html: '',
        css: '',
        js: '',
      },
      rules: {
        name: {
          required: true,
          trigger: 'change',
          validator: validator,
        },
      },
      viewDialogVisible: false,
      isLoading: true,
    }
  },
  props: {
    currentData: {
      type: Object,
      required: false,
    },
    listData: {},
  },
  mounted() {
    if (this.currentData) {
      this.getDetail()
    } else {
      this.isLoading = false
    }
  },
  methods: {
    handleCancel() {
      this.$emit('close')
    },
    handleView() {
      if (!window.echarts) {
        $(document.body).append(
          `<script src="./static/js/echarts.common.min.js"><\/script>`
        )
      }
      this.viewDialogVisible = true
      this.form.result = this.form.html + `<style>${this.form.css}</style>`
      this.$nextTick(() => {
        setTimeout(() => {
          $(this.$refs.div).append(`<script>${this.form.js}<\/script>`)
        }, 3000)
      })
    },
    getDetail() {
      this.$http
        .post(`/base/widget/getWidgetConfig?id=${this.currentData.id}`)
        .then(res => {
          this.form = JSON.parse(res.data.content)
        })
        .catch(e => {})
        .then(() => {
          this.isLoading = false
        })
    },
    handleSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let id
          const currentTime = new Date().getTime()
          if (!this.currentData) {
            // 新建的情况
            id = WidgetsNamePrefix + currentTime
          } else {
            id = this.currentData.id
          }
          this.$http
            .post('/base/widget/saveWidgetConfig', {
              widgetId: id,
              content: JSON.stringify(this.form),
            })
            .then(res => {
              this.$emit('update-list', {
                id: id,
                createTime: currentTime,
                name: this.form.name,
              })
              this.handleCancel()
            })
            .catch(e => {})
        }
      })
    },
  },
}
</script>

<style scoped></style>
