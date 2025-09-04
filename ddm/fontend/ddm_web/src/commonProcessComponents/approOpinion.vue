<template>
  <div>
    <el-form
      ref="processDia"
      label-position="right"
      label-width="110px"
      :model="applyData"
      style="padding-top: 18px"
    >
      <el-form-item :label="$user.username + ': '">
        <datablau-input
          maxlength="100"
          v-model="applyData.currentComment"
          :rows="3"
          clearable
          :placeholder="`请输入审批意见 `"
          type="textarea"
          style="display: block"
        ></datablau-input>
      </el-form-item>
      <el-form-item>
        <datablau-button
          :disabled="submitDisabled"
          v-for="item in handleArr"
          :key="item.id"
          :type="
            item.name == '提交' || item.name == '通过'
              ? 'important'
              : 'secondary'
          "
          size="mini"
          @click="handleApply(item)"
        >
          {{ item.name === null ? '提交' : item.name }}
          <i class="el-icon-loading" v-if="item.submitLoading"></i>
        </datablau-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import HTTP from '@/resource/http'

export default {
  data () {
    return {
      applyData: {
        // 审批意见
        currentComment: ''
      },
      handleArr: [], // 审批方式
      submitDisabled: false
    }
  },
  props: {
    getDetailData: {
      type: Object,
      default () {
        return {}
      }
    },
    commonData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    getDetailData: {
      handler (val) {
        if (val) {
          this.handleArr = val.outgoingFlows || []
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /* getEditObj() {
      const result = []
      this.formDtos.forEach(item => {
        const obj = {}
        for (const key in item) {
          obj[key] = item[key]
        }
        if (this.applyDetailData.processType !== '变更目录申请') {
          if (this.formData[item.code]) {
            obj.value = this.formData[item.code].value
          }
        }
        result.push(obj)
      })
      // console.log(result)
      if (this.tableAllData.length) {
        // this.tableAllData.forEach((e, i) => {
        //   e.order = i + 1
        // })
        result.forEach(e => {
          if (e.name === '码值取值') {
            e.value = JSON.stringify(this.tableAllData)
          }
        })
      }
      return result
    }, */
    handleApply (handleItem) {
      this.submitDisabled = true
      // if (!this.checkCodeValueRequired()) {
      //   return
      // }
      // if (!this.checkValueRequired()) {
      //   return
      // }
      if (
        this.commonData.requestType === 2 &&
        handleItem.name === '通过' &&
        this.commonData.processType === '数据申请' &&
        (!this.formData.applyViews.value ||
          JSON.parse(this.formData.applyViews.value).some(id => id === ''))
      ) {
        this.$message.error('请选择视图')
        return
      }
      this.handleArr.forEach((element, index) => {
        if (element.name === handleItem.name) {
          this.$set(this.handleArr[index], 'submitLoading', true)
        }
      })
      // const formData = this.getEditObj()
      // console.log(formData)
      const para = {
        requestBody: {
          taskId: this.commonData.taskId,
          nextFlow: handleItem.id,
          comment: this.applyData.currentComment,
          username: this.$user.username,
          formDtos: [],
          processType: this.commonData.processType
        }
      }
      // todo --zl
      HTTP.completeTask(para)
        .then(res => {
          this.handleArr.forEach((element, index) => {
            if (element.name === handleItem.name) {
              this.$set(this.handleArr[index], 'submitLoading', false)
            }
          })
          this.$message.success('处理成功')
          // this.$bus.$emit('completeTask')
          this.$emit('changeVisible', false)
          if (
            this.oldCodeValue &&
            (this.oldType !== this.formData.businessType.value ||
              this.oldCodeValue !== this.formData.referenceCode.value)
          ) {
            this.$http
              .get(
                `${this.$url}/service/domains/standard/state/process/${this.oldCodeValue}`
              )
              .then()
          }
          if (this.$route.query.taskId) {
            return
          }
          this.$bus.$emit('completeTask') // 关闭弹窗
          this.submitDisabled = false
        })
        .catch(e => {
          this.handleArr.forEach((element, index) => {
            if (element.name === handleItem.name) {
              this.$set(this.handleArr[index], 'submitLoading', false)
            }
          })
          this.submitDisabled = false
          this.$showFailure(e)
        })
    }
  }
}
</script>
