<template>
  <el-form size="small" label-position="right" label-width="6em">
    <!-- <el-form-item
      label="规则名称"
      :rules="{required: true}"
    >
      <el-input v-model="ruleName"></el-input>
    </el-form-item>
    <el-form-item
      label="规则描述"
    >
      <el-input
        v-model="ruleDescription"
        type="textarea"
        :autosize="{minRows: 3}"
      ></el-input>
    </el-form-item> -->
    <el-form-item label="数据类型">
      <el-select :disabled="true" v-model="targetTypeId">
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
    <el-form-item style="margin-bottom: 10px">
      <div style="height: 50px; padding-left: 0px; padding-top: 2em">
        <el-button
          @click="handleSave"
          style="margin-top: 3px"
          size="mini"
          type="primary"
        >
          保存方案
        </el-button>
        <el-button @click="handleClose" style="margin-top: 3px" size="mini">
          关闭
        </el-button>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: ['tagDetail', 'currentRule'],
  mounted() {
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
      targetTypeId: null,
      taggableObjects: [],
    }
  },
  created() {
    this.getTaggableObjects()
  },
  methods: {
    fieldLabelFormatter(field) {
      switch (field) {
        case 'G_NAME':
          return '物理名称'
        case 'G_ALIAS':
          return '逻辑名称'
        case 'G_DESCRIPTION':
          return '描述'
        default:
          return field
      }
    },
    getTaggableObjects() {
      // 获取所有可以打标签的对象和可以用来分析的属性
      this.$http
        .get(this.$url + '/service/tags/taggableObjects')
        .then(res => {
          console.log(res.data, 7894)
          res.data.forEach(item => {
            try {
              if (item.name === '元数据') {
                const idx = item.fieldNames.indexOf('数据源名称')
                item.fieldNames.splice(idx, 1)
              }
            } catch (e) {}
          })
          this.taggableObjects = res.data
          this.targetTypeId = 82800009
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
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
      this.$emit('saveRules', this.rules)
      // if (this.currentRule) {
      //   const requestBody = {
      //     tagId: this.tagDetail.tagId,
      //     ruleId: this.currentRule.ruleId,
      //     ruleName: this.ruleName,
      //     ruleDescription: this.ruleDescription,
      //     rule: this.rules
      //   }
      //   this.$http.put(this.$url + `/service/tags/rules/${this.currentRule.ruleId}`, requestBody).then(res => {
      //     this.$emit('update-list')
      //     this.$emit('close')
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // } else {
      //   const requestBody = {
      //     tagId: this.tagDetail.tagId,
      //     ruleName: this.ruleName,
      //     ruleDescription: this.ruleDescription,
      //     rule: this.rules
      //   }
      //   this.$http.post(this.$url + `/service/tags/rules`, requestBody).then(res => {
      //     this.$emit('update-list')
      //     this.$emit('close')
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // }
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

<style scoped></style>
