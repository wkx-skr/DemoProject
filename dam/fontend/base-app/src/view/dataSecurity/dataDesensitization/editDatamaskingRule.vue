<template>
  <div>
    <datablau-dialog
      id="data-masking-rule-dialog"
      :title="isEdit ? '编辑脱敏规则' : '新建脱敏规则'"
      :visible.sync="show"
      :height="462"
      size="s"
      :before-close="closeEdit"
    >
      <div id="data-masking-rule" class="dialog-form-content">
        <el-form :rules="rules" :model="form" ref="form" label-width="120px">
          <el-form-item label="规则名称" prop="name">
            <datablau-input
              style="width: 400px"
              v-model="form.name"
              placeholder="请输入规则的中文名称"
              maxlength="32"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item label="选择目录" prop="ruleInfoCatalogId">
            <datablau-select
              style="width: 400px"
              v-model="form.ruleInfoCatalogId"
              placeholder="选择目录"
            >
              <el-option
                v-for="item in treeData"
                :label="item.name"
                :value="item.catalogId"
                :key="item.catalogId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="数据库类型" prop="databaseType">
            <datablau-select
              style="width: 400px"
              v-model="form.databaseType"
              placeholder="选择类型"
            >
              <el-option
                v-for="item in databaseList"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            style="display: inline-block"
            label="规则内容"
            prop="ruleContent"
          >
            <div class="button-content">
              <datablau-button
                style="margin-left: 10px; height: 24px; line-height: 22px"
                type="secondary"
                @click="insertSql('[[column]]')"
              >
                插入字段参数
              </datablau-button>
            </div>
            <el-input
              id="sqlTemplate"
              ref="sqlContent"
              style="width: 400px"
              v-model="form.ruleContent"
              type="textarea"
              :rows="4"
              placeholder="规则内容支持各数据库的函数"
              show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="规则描述" class="last-el-form-item">
            <datablau-input
              style="width: 400px"
              v-model="form.disc"
              type="textarea"
              :rows="4"
              placeholder="请输入内容"
              show-word-limit
            ></datablau-input>
          </el-form-item>
        </el-form>
        <div></div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="closeEdit">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="beforeSave">
          确认
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>
<script>
import API from '@/view/dataSecurity/util/api'
export default {
  data() {
    const contentValidate = async (rule, value, callback) => {
      console.log(value)
      if (value === '') {
        callback(new Error('请输入规则内容'))
      } else {
        // 判断是否含字段占位符
        if (value.includes('[[column]]')) {
          callback()
        } else {
          callback(new Error('规则内容中没有[[column]]占位符'))
        }
      }
    }
    return {
      form: {
        name: '',
        disc: '',
        ruleContent: '',
        ruleInfoCatalogId: this.ruleInfoCatalogId, // 目录id
        databaseType: '',
      },
      databaseList: [],
      rules: {
        name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        ruleInfoCatalogId: [
          {
            required: true,
            message: '请选择目录',
            trigger: 'change',
          },
        ],
        databaseType: [
          {
            required: true,
            message: '请选择类型',
            trigger: 'change',
          },
        ],
        ruleContent: [
          { required: true, validator: contentValidate, trigger: 'blur' },
        ],
      },
      currentTips: '',
    }
  },
  props: ['isEdit', 'show', 'treeData', 'ruleInfoCatalogId', 'ruleData'],
  mounted() {
    this.databaseList = [
      { label: 'MYSQL', value: 'MYSQL' },
      { label: 'HIVE', value: 'HIVE' },
      { label: 'ORACLE', value: 'ORACLE' },
      { label: 'STARROCKS', value: 'STARROCKS' },
    ]
    if (this.isEdit) {
      this.form = {
        name: this.ruleData.ruleName,
        disc: this.ruleData.ruleDesc,
        ruleContent: this.ruleData.ruleContent,
        ruleInfoCatalogId: this.ruleData.catalogId, // 目录id
        databaseType: this.ruleData.dbType,
      }
    }
  },
  methods: {
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
          this.$message.warning('插入位置错误')
          return
        }
        range.moveStart('character', -oTxt1.value.length)
        cursurPosition = range.text.length
      }
      const st1 = this.form.ruleContent.substring(0, cursurPosition)
      const st2 = this.form.ruleContent.substring(cursurPosition)
      this.form.ruleContent = st1 + ' ' + st + ' ' + st2
      this.$refs.sqlContent.focus()
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
    beforeSave() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.save()
        } else {
          return false
        }
      })
    },
    createDatamaskingRule(obj) {
      API.newDesensitizeRule(obj)
        .then(res => {
          this.$message.success('创建成功')
          this.closeEdit()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateDatamaskingRule(obj) {
      API.modifyDesensitizeRule(obj)
        .then(res => {
          this.$message.success('编辑成功')
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
    color: #e6ad00;
    i {
      display: inline-block;
      color: #e6ad00;
    }
  }
  i {
    // color: $primary-color;
    margin-left: 10px;
    margin-right: 5px;
  }
}
/deep/ .el-form-item {
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
  z-index: 4;
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
