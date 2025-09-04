<template>
  <div>
    <div class="top-line">
      <el-form
        ref="processDia"
        label-position="right"
        label-width="110px"
        size="small"
        :model="applyData"
        :rules="editRules"
      >
        <el-form-item
          :label="item.name"
          :prop="item.name"
          v-for="item in applyPropArr"
          :key="item.id"
        >
          <el-input-number
            maxlength="100"
            v-model="applyData[item.name]"
            size="mini"
            clearable
            :placeholder="`请输入${item.name}`"
            v-if="item.dataType === 'long'"
            :disabled="item.disabled"
          ></el-input-number>
          <el-date-picker
            v-model="applyData[item.name]"
            v-else-if="item.dataType === 'date'"
            type="date"
            placeholder="选择日期"
            :disabled="item.disabled"
          ></el-date-picker>
          <span v-else-if="item.dataType === 'boolean'">
            <el-radio
              v-model="applyData[item.name]"
              :disabled="item.disabled"
              label="true"
            >
              是
            </el-radio>
            <el-radio
              v-model="applyData[item.name]"
              :disabled="item.disabled"
              label="false"
            >
              否
            </el-radio>
          </span>
          <el-select
            :placeholder="`请选择${item.name}`"
            v-model="applyData[item.name]"
            filterable
            v-else-if="item.dataType === 'enum'"
            :disabled="item.disabled"
          >
            <el-option
              v-for="value in item.enumSelect"
              :key="value"
              :value="value"
              :label="value"
            ></el-option>
          </el-select>
          <el-input
            maxlength="100"
            v-model="applyData[item.name]"
            size="mini"
            clearable
            :placeholder="`请输入${item.name}`"
            type="textarea"
            v-else
            :disabled="item.disabled"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            v-for="item in handleArr"
            :key="item.id"
            type="primary"
            @click="handleApply(item)"
          >
            {{ item.name === null ? '提交' : item.name }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- <div class="history-table">
      <el-table
        class="plain-table ref-doc-table"
        :data="historyData"
        ref="historyTable"
        :stripe="true"
        :header-cell-style="{'background-color':'#F1F5F8'}"
        border
      >
        <el-table-column width="30"></el-table-column>
        <el-table-column
          prop="fileOrginalName"
          label="文档名称"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="uploader"
          label="上传人"
        ></el-table-column>
        <el-table-column
          prop="uploadTimestamp"
          label="上传日期"
          :formatter="timeFormatter"
        ></el-table-column>
        <el-table-column
          prop="name"
          label="操作" align="center"
        >
          <template slot-scope="scope">
            <el-button type="text" @click="deleteRefDoc(scope)" v-if="startEdit">{{$t('common.button.delete')}}</el-button>
            <el-button type="text" @click="dowRefDoc(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      applyData: {},
      editRules: {},
      applyPropArr: [],
      historyData: [],
      handleArr: [],
      editOriginData: {},
    }
  },
  components: {},
  props: {
    taskId: {
      required: true,
    },
  },
  computed: {
    disabledSave() {
      let bool = false
      if (this.editRules) {
        for (const key in this.editRules) {
          if (!this.applyData || !this.applyData[key]) {
            bool = true
          }
        }
      }
      return bool
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      const url = `${this.$url}/service/workflow/task/start?taskId=${this.taskId}`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          const formProperties = data.formProperties
          let outgoingFlows = data.outgoingFlows
          const applyData = {}
          const editRules = {}
          const applyPropArr = []
          if (formProperties && Array.isArray(formProperties)) {
            formProperties.forEach(item => {
              const obj = _.cloneDeep(item)
              obj.dataType = obj.type.name
              applyData[item.name] = item.value
              if (item.required) {
                editRules[item.name] = {
                  reuqired: item.required,
                  trigger: 'blur',
                  message: '请输入' + item.required,
                }
              }
              if (item.readable) {
                applyPropArr.push(obj)
              }
            })
          }

          if (outgoingFlows && Array.isArray(outgoingFlows)) {
            // outgoingFlows.forEach(item => {})
          } else {
            outgoingFlows = []
          }
          this.handleArr = outgoingFlows
          this.applyData = applyData
          this.editRules = editRules
          this.applyPropArr = applyPropArr
          if (applyPropArr.length > 0) {
            this.editOriginData = data
          } else {
            this.$message.info('流程内容为空')
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleApply(handleItem) {
      //
      const formData = this.getEditObj()

      const value = {
        taskId: this.taskId,
        nextFlow: handleItem.id,
        formData: JSON.stringify(formData),
      }
      const url = `${this.$url}/service/workflow/task/complete`
      //
      this.$http
        .post(url, value)
        .then(res => {
          this.$message.success('处理成功')
          this.$emit('closeToDoDialog')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    getEditObj() {
      let formData = null
      if (this.$refs.processDia && this.$refs.processDia.validate()) {
        formData = []
        const formProperties = this.editOriginData.formProperties
        if (formProperties && Array.isArray(formProperties)) {
          formProperties.forEach(item => {
            const value = `${this.applyData[item.name] || ''}`
            if (value !== '') {
              formData.push(`${item.name}=${value}`)
            }
          })
        }
      } else {
        this.$showFailure('内容不能为空')
      }
      return formData
    },
  },
  watch: {
    taskId() {
      this.dataInit()
    },
  },
}
</script>

<style lang="scss" scoped></style>
