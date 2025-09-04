<template>
  <div class="domain-approval">
    <div class="domain-list-outer" v-if="showType === 'check'">
      <domain-list :domainList="domainList"></domain-list>
    </div>
    <div class="top-line" v-if="showType === 'edit'">
      <el-form
        ref="processDia"
        label-position="right"
        label-width="110px"
        size="small"
        :model="applyData"
        :rules="editRules"
      >
        <el-form-item
          v-for="item in commentArr"
          :key="item.user"
          :label="`${item.user}`"
        >
          <!-- <el-input clearable maxlength="100" v-model="item.comment" size="mini" readonly  :placeholder="`请输入`" type="textarea"></el-input> -->
          <span>{{ item.comment }}</span>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            maxlength="100"
            v-model="applyData[assignOpinion]"
            size="mini"
            clearable
            :placeholder="`请输入`"
            type="textarea"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            v-for="item in handleArr"
            :key="item.id"
            type="primary"
            @click="handleApply(item)"
            v-loading.fullscreen.lock="fullscreenLoading"
            element-loading-text="处理中..."
          >
            {{ item.name === null ? '提交' : item.name }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import domainList from './domainList.vue'
import HTTP from '@/resource/http.js'
export default {
  data () {
    return {
      domainList: [],
      applyData: {},
      editRules: {},
      applyPropArr: [],
      historyData: [],
      handleArr: [],
      assignOpinion: '审批意见',
      commentArr: [],
      editOriginData: {},
      fullscreenLoading: false
    }
  },
  components: {
    domainList
  },
  props: {
    taskId: {
      required: true,
      type: [String, Number]
    },
    processInstanceId: {
      required: true,
      type: [String, Number]
    },
    showType: {
      type: String,
      default: 'edit'
    }
  },
  computed: {
    // disabledSave() {
    //   let bool = false;
    //   if (this.editRules) {
    //     for(let key in this.editRules) {
    //       if (!this.applyData || !this.applyData[key]) {
    //         bool = true;
    //       }
    //     }
    //   }
    //   return bool;
    // },
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
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
              if (item.id === 'domainId' && this.$utils.isJSON(item.value)) {
                this.domainList = JSON.parse(item.value)
              }
              const obj = _.cloneDeep(item)
              obj.dataType = obj.type.name
              applyData[item.name] = item.value
              if (item.required) {
                editRules[item.name] = {
                  reuqired: item.required,
                  trigger: 'blur',
                  message: '请输入' + item.required
                }
              }
              if (item.readable) {
                applyPropArr.push(obj)
              }
            })
          }

          if (outgoingFlows && Array.isArray(outgoingFlows)) {
            outgoingFlows.forEach(item => {})
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

      HTTP.getProcessResult({ taskId: this.processInstanceId })
        .then(res => {
          const data = res.data
          const commentArr = []
          if (data && Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
              const user = item.assignee
              const commentStr = item.param ? item.param.opinion : ''
              if (item.endTime) {
                commentArr.push({ user: user, comment: commentStr })
              }
            })
          }
          this.commentArr = commentArr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleApply (handleItem) {
      this.fullscreenLoading = true
      const formData = this.getEditObj()
      const value = {
        taskId: this.taskId,
        nextFlow: handleItem.id,
        // formData : JSON.stringify(formData),
        comment: this.applyData[this.assignOpinion]
      }
      const url = `${this.$url}/service/workflow/task/complete`
      //
      this.$http
        .post(url, value)
        .then(res => {
          this.fullscreenLoading = false
          this.$message.success('处理成功')
          this.$emit('closeToDoDialog')
        })
        .catch(e => {
          this.fullscreenLoading = false
          this.$showFailure(e)
        })
    },

    getEditObj () {
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
    }
  },
  watch: {
    taskId () {
      this.dataInit()
    }
  }
}
</script>

<style lang="scss">
.domain-approval {
  .domain-list-outer {
    min-height: 500px;
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid #ebeef5;
  }
}
</style>
