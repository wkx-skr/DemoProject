<template>
  <div>
    <el-form
      size="small"
      label-position="right"
      label-width="6em"
      class="outer-dialog-form"
    >
      <el-form-item label="规则名称" :rules="{ required: true }">
        <!-- <el-input v-model="ruleName"></el-input> -->
        <datablau-input v-model="ruleName"></datablau-input>
      </el-form-item>
      <el-form-item label="规则描述">
        <el-input
          v-model="ruleDescription"
          type="textarea"
          :autosize="{ minRows: 3 }"
        ></el-input>
      </el-form-item>
      <el-form-item label="数据类型">
        <el-select v-model="targetTypeId">
          <el-option
            v-for="i in taggableObjects"
            :value="i.typeId"
            :key="i.typeId"
            :label="i.name"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="匹配属性" v-if="targetTypeId">
        <el-select v-model="targetField">
          <el-option
            v-for="i in taggableObjects.filter(
              item => item.typeId === targetTypeId
            )[0].fieldNames"
            :value="i"
            :key="i"
            :label="fieldLabelFormatter(i)"
          ></el-option>
          <!--        <el-option value="G_NONE" label="不限"></el-option>-->
          <!--        <el-option value="G_NAME" label="物理名称"></el-option>-->
          <!--        <el-option value="G_ALIAS" label="逻辑名称"></el-option>-->
          <!--        <el-option value="G_DESCRIPTION" label="描述"></el-option>-->
        </el-select>
      </el-form-item>
      <el-form-item label="正则表达式">
        <el-input
          v-model="regExpression"
          type="textarea"
          placeholder="在此输入您的正则表达式，如^\d+$"
          :autosize="{ minRows: 3 }"
        ></el-input>
      </el-form-item>
    </el-form>
    <div class="dialog-btn-footer">
      <datablau-button
        style="margin-top: 3px"
        type="important"
        @click="handleSave"
      >
        保存方案
      </datablau-button>

      <datablau-button
        style="margin-top: 3px"
        type="secondary"
        @click="handleClose"
      >
        关闭
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['tagDetail', 'currentRule', 'taggableObjects', 'fieldLabelFormatter'],
  mounted() {
    console.log(this.currentRule, 987)
    this.getRules()
  },
  data() {
    return {
      ruleName: '',
      ruleDescription: '',
      regExpression: '',
      rules: null,
      targetTypeId: null,
      targetField: null,
      allMatch: false,
    }
  },
  methods: {
    getRules() {
      if (this.currentRule) {
        this.rules = _.cloneDeep(this.currentRule.rule)
        this.ruleName = this.currentRule.ruleName
        this.ruleDescription = this.currentRule.ruleDescription
      } else {
        this.rules = {
          '@class': 'com.andorj.model.common.tag.rule.RegexTagRule',
          targetField: 'G_NAME',
          targetTypeId: 82800009,
          allMatch: false,
          regExpression: '',
        }
      }
      this.targetField = this.rules.targetField
      this.targetTypeId = this.rules.targetTypeId
      this.allMatch = this.rules.allMatch
      this.regExpression = this.rules.regExpression
    },
    handleClose() {
      this.$emit('close')
    },
    handleSave() {
      this.rules.allMatch = this.allMatch
      this.rules.regExpression = this.regExpression
      this.rules.targetField = this.targetField
      this.rules.targetTypeId = this.targetTypeId
      if (this.currentRule) {
        const requestBody = {
          tagId: this.tagDetail.tagId,
          ruleId: this.currentRule.ruleId,
          ruleName: this.ruleName,
          ruleDescription: this.ruleDescription,
          rule: this.rules,
        }
        this.$http
          .put(
            this.$url + `/service/tags/rules/${this.currentRule.ruleId}`,
            requestBody
          )
          .then(res => {
            this.$emit('update-list')
            this.$emit('close')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        const requestBody = {
          tagId: this.tagDetail.tagId,
          ruleName: this.ruleName,
          ruleDescription: this.ruleDescription,
          rule: this.rules,
        }
        this.$http
          .post(this.$url + '/service/tags/rules', requestBody)
          .then(res => {
            this.$emit('update-list')
            this.$emit('close')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
  },
  watch: {
    targetTypeId(newVal, oldVal) {
      if (oldVal) {
        this.targetField = null
      }
    },
  },
}
</script>

<style scoped lang="scss">
// 弹出框样式
.outer-dialog-form {
  position: absolute;
  top: 0px;
  left: 0;
  bottom: 64px;
  right: 0;
  overflow: auto;
  padding: 0 20px;
}
.dialog-btn-footer {
  position: absolute;
  height: 64px;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: right;
  box-sizing: border-box;
  padding: 10px 20px 0;
}
</style>
