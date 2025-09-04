<template>
  <div id="data-masking-rule" class="dialog-form-content">
    <!-- 选择目录 -->
    <datablau-dialog
      :title="$t('securityModule.selectCatalog')"
      size="s"
      :height="480"
      width="600px"
      :destroy-on-close="true"
      :visible.sync="showDirectory"
      v-if="showDirectory"
    >
      <div class="tree-search-box">
        <datablau-input
          style="width: 100%"
          v-model="treeKey"
          :iconfont-state="true"
          clearable
          :placeholder="$t('securityModule.search')"
        ></datablau-input>
      </div>
      <div class="tree-box">
        <datablau-tree
          @node-click="handleNodeClick"
          :data-icon-function="dataIconFunction"
          :filter-node-method="filterNode"
          node-key="catalogId"
          :props="defaultProps"
          :data="treeData"
          :data-supervise="true"
          ref="tree"
          :empty-text="$t('securityModule.noCatalogInfo')"
        ></datablau-tree>
      </div>

      <span slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="!selectGra.catalogId"
          @click="sure"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 测试弹层 -->
    <tableAndColumn
      v-if="showTableAndColumn"
      :visible="showTableAndColumn"
      :clickTable="clickTable"
      :isMask="true"
      :singleSelect="true"
    ></tableAndColumn>
    <datablau-form-submit style="top: 10px">
      <datablau-form
        :class="{ 'only-see-form': isView }"
        :rules="rules"
        :model="form"
        ref="form"
        label-width="180px"
      >
        <el-form-item :label="$t('securityModule.ruleName')" prop="name">
          <datablau-input
            :disabled="isView"
            style="width: 430px"
            v-model="form.name"
            :placeholder="$t('securityModule.input')"
            maxlength="32"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('securityModule.selectCatalog')"
          prop="ruleInfoCatalogId"
        >
          <datablau-input
            ref="selectGra"
            v-model="form.ruleInfoCatalogName"
            :placeholder="$t('securityModule.placeSelect')"
            style="width: 430px"
            @focus="openDirector"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('maskingRule.databaseType1')"
          prop="databaseType"
        >
          <datablau-select
            :disabled="isView"
            style="width: 430px"
            v-model="form.databaseType"
            :placeholder="$t('securityModule.placeSelect')"
          >
            <el-option
              v-for="item in databaseList"
              :label="item.pluginName"
              :value="item.pluginName"
              :key="item.pluginName"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          class="el-form-item-require"
          :class="{ 'require-error': isError }"
          style="display: inline-block"
          :label="$t('maskingRule.ruleContent')"
          prop="ruleContent"
        >
          <div class="button-content" v-if="!isView">
            <datablau-button
              style="margin-left: 10px; height: 24px; line-height: 22px"
              type="secondary"
              @click="insertSql('[[column]]')"
            >
              {{ $t('maskingRule.insertAttr') }}
            </datablau-button>
          </div>
          <el-input
            :disabled="isView"
            id="sqlTemplate"
            ref="sqlContent"
            style="width: 430px"
            v-model="form.ruleContent"
            type="textarea"
            :rows="4"
            :placeholder="$t('maskingRule.ruleSuportFun')"
            show-word-limit
          ></el-input>
          <div class="item-tip" v-if="isError">{{ tipError }}</div>
        </el-form-item>
        <el-form-item :label="$t('securityModule.ruleDes')">
          <datablau-input
            :disabled="isView"
            style="width: 430px"
            v-model="form.disc"
            type="textarea"
            :rows="4"
            :placeholder="$t('securityModule.input')"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('maskingRule.selTestColumn')" v-if="!isView">
          <datablau-input
            v-model="curColumn.name"
            style="width: 430px"
            :placeholder="$t('securityModule.placeSelect')"
            @focus="selectColumn"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('maskingRule.test')" v-if="!isView">
          <datablau-button
            type="important"
            :disabled="!curColumn.objectId"
            @click="handleTest"
          >
            {{ $t('maskingRule.test') }}
          </datablau-button>
          <i
            class="el-icon-loading"
            style="color: #409eff; font-size: 16px; margin-left: 8px"
            v-if="testLoading"
          ></i>
        </el-form-item>
        <el-form-item
          :label="$t('maskingRule.testResult')"
          v-if="showResult && !isView"
        >
          <div
            class="tip-box"
            :class="{ 'err-tip-box': testError }"
            style="display: inline-block"
          >
            <i
              :class="[
                'iconfont',
                testError ? 'icon-gaojing' : 'icon-zhengque',
              ]"
            ></i>
            {{
              testError
                ? $t('maskingRule.testFail')
                : $t('maskingRule.testSuccess')
            }}
          </div>
          <div>{{ $t('maskingRule.runSql') }}{{ testResult }}</div>
        </el-form-item>
      </datablau-form>
      <div slot="buttons">
        <datablau-button type="important" @click="beforeSave" v-if="!isView">
          {{ $t('securityModule.sure') }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeEdit">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import API from '@/view/dataSecurity/util/api'
import { datasourceList } from '@/view/dataSecurity/util/util.js'
import tableAndColumn from '@/view/dataSecurity/components/tableAndColumn.vue'
export default {
  components: {
    tableAndColumn,
  },
  data() {
    return {
      isError: false,
      tipError: '',
      form: {
        name: '',
        disc: '',
        ruleContent: '',
        ruleInfoCatalogName: '', // 目录名称
        ruleInfoCatalogId: '', // 目录id
        databaseType: '',
      },
      databaseList: [],
      rules: {},
      currentTips: '',
      showTableAndColumn: false,
      curColumn: {}, // 当前选中的测试字段
      testResult: '',
      testError: false,
      showResult: false,
      testLoading: false,
      showDirectory: false,
      treeKey: '',
      selectGra: {},
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
    }
  },
  watch: {
    treeKey(val) {
      this.$nextTick(() => {
        this.$refs.tree.$refs.tree.filter(val)
      })
    },
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
    isView: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
    treeData: {
      type: Array,
      default() {
        return []
      },
    },
    ruleData: {
      type: Object,
      default() {
        return {}
      },
    },
    catalogMap: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  mounted() {
    // this.databaseList = datasourceList()
    this.tipError = this.$t('securityModule.input')
    this.rules = {
      name: [
        {
          required: true,
          message: this.$t('securityModule.input'),
          trigger: 'blur',
        },
      ],
      ruleInfoCatalogId: [
        {
          required: true,
          message: this.$t('securityModule.placeSelect'),
          trigger: 'change',
        },
      ],
      databaseType: [
        {
          required: true,
          message: this.$t('securityModule.placeSelect'),
          trigger: 'change',
        },
      ],
      ruleContent: [
        // { required: true, validator: this.contentValidate, trigger: 'blur' },
      ],
    }
    this.getBasePlugin()
    this.$nextTick(() => {
      if (this.isEdit || this.isView) {
        const pathList = this.ruleData.catalogPath.split('/')
        this.form = {
          name: this.ruleData.ruleName,
          disc: this.ruleData.ruleDesc,
          ruleContent: this.ruleData.ruleContent,
          ruleInfoCatalogName: pathList[pathList.length - 1],
          ruleInfoCatalogId: this.ruleData.catalogId
            ? this.ruleData.catalogId
            : '', // 目录id
          databaseType: this.ruleData.dbType,
        }
      } else {
        if (this.catalogMap.id) {
          this.form.ruleInfoCatalogName = this.catalogMap.name
          this.form.ruleInfoCatalogId = this.catalogMap.id
        }
      }
    })
  },
  methods: {
    getBasePlugin() {
      const params = {
        pluginType: 10000,
      }
      API.pluginListApi(params)
        .then(res => {
          this.databaseList = res.data
          console.log(this.databaseList)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 根据关键字过滤策略目录树
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    openDirector() {
      this.$refs.selectGra.blur()
      this.showDirectory = true
      this.treeKey = ''
      this.selectGra = {}
    },
    sure() {
      this.showDirectory = false
      this.form.ruleInfoCatalogId = this.selectGra.catalogId
      this.form.ruleInfoCatalogName = this.selectGra.name
    },
    close() {
      this.showDirectory = false
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    handleNodeClick(data) {
      this.selectGra = data
    },
    clickTable(name, options) {
      switch (name) {
        case 'close':
          this.showTableAndColumn = false
          break
        case 'sureTable':
          this.showTableAndColumn = false
          this.curColumn = options.data[0]
          break
        default:
          break
      }
    },
    selectColumn() {
      this.showTableAndColumn = true
    },
    async handleTest() {
      const flag = await this.contentValidate()
      if (!flag || this.testLoading) {
        return
      }
      this.testLoading = true
      this.showResult = false
      const params = {
        modelId: this.curColumn.modelId,
        schemaName: this.curColumn.schema,
        tableId: this.curColumn.parentId,
        tableName: this.curColumn.parentPhysicalName,
        columnId: this.curColumn.objectId,
        columnName: this.curColumn.physicalName,
        rule: this.form.ruleContent,
      }
      API.getRuleTest(params)
        .then(res => {
          this.testLoading = false
          this.testResult = res.data.executeSql
          this.showResult = true
          if (res.data.success) {
            this.testError = false
          } else {
            this.testError = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async contentValidate() {
      if (this.form.ruleContent === '') {
        this.isError = true
        this.tipError = this.$t('securityModule.input')
      } else {
        // 判断是否含字段占位符
        if (this.form.ruleContent.includes('[[column]]')) {
          this.isError = false
        } else {
          this.isError = true
          this.tipError = this.$t('maskingRule.inputContentTip')
        }
      }
      return !this.isError
    },
    insertSql(st) {
      const oTxt1 = document.getElementById('sqlTemplate')
      let cursurPosition = -1
      if (oTxt1.selectionStart) {
        // 非IE浏览器
        cursurPosition = oTxt1.selectionStart
      } else {
        // IE
        try {
          var range = document.selection.createRange()
        } catch (e) {
          this.$datablauMessage.warning(this.$t('maskingRule.insertError'))
          return
        }
        range.moveStart('character', -oTxt1.value.length)
        cursurPosition = range.text.length
      }
      const st1 = this.form.ruleContent.substring(0, cursurPosition)
      const st2 = this.form.ruleContent.substring(cursurPosition)
      this.form.ruleContent = st1 + ' ' + st + ' ' + st2
      this.$refs.sqlContent.focus()
      this.contentValidate()
    },
    closeEdit() {
      this.$emit('close')
    },
    save() {
      const form = this.form
      let ruleInfoCatalog = ''
      this.treeData.map(item => {
        if (item.catalogId === this.form.ruleInfoCatalogId) {
          ruleInfoCatalog = item.name
        }
      })
      let obj = {
        ruleName: form.name, // 脱敏规则名称
        catalogId: form.ruleInfoCatalogId, // 目录id
        catalogPath: ruleInfoCatalog, // 目录名字
        dbType: form.databaseType, // 数据库类型
        ruleContent: form.ruleContent, // 规则内容
        ruleDesc: form.disc, // 规则描述
      }
      if (this.isEdit) {
        obj.ruleId = this.ruleData.ruleId
        this.updateDatamaskingRule(obj)
      } else {
        this.createDatamaskingRule(obj)
      }
    },
    async beforeSave() {
      const flag = await this.contentValidate()
      this.$refs.form.validate(async valid => {
        if (valid && flag) {
          this.save()
        } else {
          return false
        }
      })
    },
    createDatamaskingRule(obj) {
      API.newDesensitizeRule(obj)
        .then(res => {
          this.$datablauMessage.success(this.$t('securityModule.newSuccess'))
          this.closeEdit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateDatamaskingRule(obj) {
      API.modifyDesensitizeRule(obj)
        .then(res => {
          this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
          this.closeEdit()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.last-el-form-item {
  margin-bottom: 0 !important;
}
.tip-box {
  color: #66bf16;
  &.err-tip-box {
    color: #f2220a;
    i {
      color: #f2220a;
    }
  }
  i {
    color: #66bf16;
    margin-left: 10px;
    margin-right: 5px;
  }
}
.button-content {
  height: 34px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
}
/deep/ .el-form-item-require {
  &.require-error {
    .el-input__inner {
      border-color: #f56c6c;
    }
  }
  .el-form-item__label {
    &:before {
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
    }
  }
  .el-form-item__content {
    position: relative;
    .item-tip {
      line-height: 14px;
      height: 14px;
      position: absolute;
      bottom: -14px;
      color: #f56c6c;
    }
  }
}
.tip-box {
  // color: $primary-color;
  line-height: 34px;
  &.err-tip-box {
    color: #ff7519;
    i {
      display: inline-block;
      color: #ff7519;
    }
  }
  i {
    // color: $primary-color;
    margin-left: 10px;
    margin-right: 5px;
  }
}
/deep/ .el-form {
  .el-form-item {
    margin-bottom: 14px;
    .el-form-item__label {
      line-height: 34px;
    }
    .el-form-item__content {
      line-height: 34px;
      .el-input-number {
        line-height: 34px;
        span {
          height: 32px;
          line-height: 32px;
          width: 34px;
        }
        .el-input {
          .el-input__inner {
            line-height: 34;
            height: 34px;
          }
        }
      }
    }
  }
}

#data-masking-rule {
  box-sizing: border-box;
  // padding: 0 20px;
  // position: absolute;
  // top: 0;
  // left: 0;
  // right: 0;
  // bottom: 0;
  //解决ie不兼容var的问题
  background-color: #fff;
  background-color: var(--default-bgc);
  z-index: 9;
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  .header {
    box-sizing: border-box;
    height: 40px;
    line-height: 40px;
    .title {
      display: inline-block;
      font-size: 13px;
      color: rgb(190, 190, 190);
    }
    .back-btn {
      display: inline-block;
      float: right;
    }
  }
  .title-line {
    margin-bottom: 20px;
    position: relative;
    height: 20px;
    p {
      float: left;
      padding-left: 6px;
      border-left: 4px solid #4386f5;
      width: 70px;
      font-size: 14px;
      background-color: var(--default-bgc);
    }
    .line {
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
      border-bottom: 1px solid #e0e0e0;
      z-index: -1;
    }
  }
  .row {
    padding-top: 18px;
    width: 100%;
    height: 40px;
    .label {
      float: left;
      text-align: right;
      width: 80px;
      padding-right: 12px;
    }
    .box {
      float: left;
    }
  }
  .tag-row {
    height: unset;
    padding-top: 18px;
    overflow: hidden;
  }
  .el-icon-question {
    position: relative;
    left: 5px;
    color: lightblue;
    font-size: 16px;
    cursor: pointer;
  }
  .right-content {
    min-height: 47px;
    /deep/ .el-form-item {
      &:last-child {
        margin-bottom: 14px;
      }
    }
  }
}
.function-box {
  .name-content {
    float: left;
    height: 390px;
    position: relative;
    width: 230px;
    box-sizing: border-box;
    padding-bottom: 10px;
    overflow: hidden;
    ul {
      background: transparentize(#dddddd, 0.7);
      padding: 0px 20px 0px 10px;
      box-sizing: border-box;
      overflow: auto;
      position: absolute;
      top: 0px;
      left: 0;
      right: 0;
      bottom: 10px;
      li {
        // width: 200px;
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        color: #555555;
        padding-left: 20px;
        position: relative;
        cursor: pointer;
        &.active {
          background: transparentize(#409eff, 0.91);
          color: #409eff;
          font-weight: 500;
          &:before {
            content: '';
            position: absolute;
            left: 10px;
            top: 7px;
            width: 2px;
            height: 16px;
            background: #409eff;
          }
        }
      }
    }
  }
  .intro {
    height: 390px;
    padding: 24px 20px 20px 20px;
    width: 520px;
    box-sizing: border-box;
    float: right;
    position: relative;
    .des-title {
      font-weight: 500;
      color: #555555;
      line-height: 22px;
      font-size: 16px;
    }
    .des-content {
      margin-top: 8px;
      color: #555555;
      line-height: 24px;
      font-size: 14px;
      max-height: 260px;
      overflow-y: auto;
    }
    .btns {
      position: absolute;
      left: 20px;
      right: 20px;
      bottom: 20px;
      text-align: right;
    }
  }
}
</style>
