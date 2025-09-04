<template>
  <div class="naming-option-wrapper clearfixed" v-loading="loading">
    <!--<div class="head-wrapper">
      <datablau-switch
        v-model="setOption.IsUsingRealTimeTranslate"
        active-text="开"
        inactive-text="关"
        type="innerText"
      ></datablau-switch>
      <h2><i class="iconfont icon-tips" style="color: #fe4066;font-size: 14px;margin-right: 6px;"></i>实时应用命名标准来翻译表和字段中文名称：</h2>
      <div class="input-item" style="float: right">
        <span>分隔符</span>
        <datablau-input style="width: 160px;" v-model="setOption.NamingSeperator"></datablau-input>
      </div>
    </div>-->
    <!--<div class="top-tips">
      <i class="iconfont icon-tips"></i>
      {{`命名标准，配置于当前模型[${currentModelName}]`}}
    </div>-->
    <div class="content-wrapper">
      <div class="input-item">
        <span>翻译分隔符</span>
        <datablau-input style="width: 160px;" v-model="setOption.NamingSeperator"></datablau-input>
      </div>
    </div>
    <ul class="content-wrapper">
      <li>
        <!--<datablau-checkbox :checkboxType="'single'" v-model="setOption.IsTableTranslateEnabled">
          表命名设置
        </datablau-checkbox>-->
        <datablau-switch
          size="mini"
          active-text="表命名设置"
          v-model="setOption.IsTableTranslateEnabled"></datablau-switch>
        <div class="radio-wrapper">
          <span>名称大小写</span>
          <datablau-radio :disabled="!setOption.IsTableTranslateEnabled" v-model="setOption.TableNameCase">
            <el-radio label="None">无</el-radio>
            <el-radio label="Lower">小写</el-radio>
            <el-radio label="Upper">大写</el-radio>
            <el-radio label="Initial">首字母大写</el-radio>
          </datablau-radio>
        </div>
        <div class="input-item" style="margin-top: 10px;">
          <span>表前缀</span>
          <datablau-input :disabled="!setOption.IsTableTranslateEnabled" v-model="setOption.TableNamePrefix"></datablau-input>
          <span style="margin-left: 18px;">表后缀</span>
          <datablau-input :disabled="!setOption.IsTableTranslateEnabled" v-model="setOption.TableNamePostfix"></datablau-input>
          <span style="margin-left: 18px;">最大长度</span>
          <datablau-input type="number" :disabled="!setOption.IsTableTranslateEnabled" v-model="setOption.TableNameMaxLength"></datablau-input>
        </div>
      </li>
      <li>
        <!--<datablau-checkbox :checkboxType="'single'" v-model="setOption.IsColumnTranslateEnabled">
          字段命名设置
        </datablau-checkbox>-->
        <datablau-switch
          size="mini"
          active-text="字段命名设置"
          v-model="setOption.IsColumnTranslateEnabled"></datablau-switch>
        <div class="radio-wrapper">
          <span>名称大小写</span>
          <datablau-radio :disabled="!setOption.IsColumnTranslateEnabled" v-model="setOption.ColumnNameCase">
            <el-radio label="None">无</el-radio>
            <el-radio label="Lower">小写</el-radio>
            <el-radio label="Upper">大写</el-radio>
            <el-radio label="Initial">首字母大写</el-radio>
          </datablau-radio>
        </div>
        <div class="input-item" style="margin-top: 10px;">
          <span>字段前缀</span>
          <datablau-input :disabled="!setOption.IsColumnTranslateEnabled" v-model="setOption.ColumnNamePrefix"></datablau-input>
          <span style="margin-left: 18px;">字段后缀</span>
          <datablau-input :disabled="!setOption.IsColumnTranslateEnabled" v-model="setOption.ColumnNamePostfix"></datablau-input>
          <span style="margin-left: 18px;">最大长度</span>
          <datablau-input type="number" :disabled="!setOption.IsColumnTranslateEnabled" v-model="setOption.ColumnNameMaxLength"></datablau-input>
        </div>
      </li>
      <li>
        <!--<datablau-checkbox :checkboxType="'single'" v-model="setOption.IsIndexTranslateEnabled">
          索引命名设置
        </datablau-checkbox>-->
        <datablau-switch
          size="mini"
          active-text="索引命名设置"
          v-model="setOption.IsIndexTranslateEnabled"></datablau-switch>
        <div class="radio-wrapper">
          <span>名称大小写</span>
          <datablau-radio :disabled="!setOption.IsIndexTranslateEnabled" v-model="setOption.IndexNameCase">
            <el-radio label="None">无</el-radio>
            <el-radio label="Lower">小写</el-radio>
            <el-radio label="Upper">大写</el-radio>
            <el-radio label="Initial">首字母大写</el-radio>
          </datablau-radio>
          <span style="margin-left: 177px;">最大长度</span>
          <datablau-input style="width: 160px;" type="number" :disabled="!setOption.IsIndexTranslateEnabled" v-model="setOption.IndexNameMaxLength"></datablau-input>
        </div>
        <div class="input-item" style="margin-top: 10px;">
          <span>主键默认宏</span>
          <datablau-input style="width: 260px;" :disabled="!setOption.IsIndexTranslateEnabled" v-model="setOption.PKDefaultMacro"></datablau-input>
          <span style="margin-left: 100px;">唯一键默认宏</span>
          <datablau-input style="width: 260px;"  :disabled="!setOption.IsIndexTranslateEnabled" v-model="setOption.UKDefaultMacro"></datablau-input>
          <div style="margin-top: 10px;"></div>
          <span>外键默认宏</span>
          <datablau-input style="width: 260px;"  :disabled="!setOption.IsIndexTranslateEnabled" v-model="setOption.FKDefaultMacro"></datablau-input>
          <span style="margin-left: 100px;">非唯一键默认宏</span>
          <datablau-input style="width: 260px;"  :disabled="!setOption.IsIndexTranslateEnabled" v-model="setOption.NUKDefaultMacro"></datablau-input>
        </div>
      </li>
    </ul>
    <div  class="btn-wrapper">
      <datablau-button
        type="cancel"
        @click="cancel"
      ></datablau-button>
      <datablau-button
        type="strong"
        @click="confirmNamingOption"
      >确定</datablau-button>
      <datablau-button
        type="important"
        @click="applyNamingOption"
      >应用</datablau-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      setOption: {},
      count: 0,
      loading: false
    }
  },
  props: ['dataByType', 'getTableHTMLFunction', 'getViewHTMLFunction', 'graph', 'getTableNameNamingMap', 'getColumnNameNamingMap', 'getIndexNameNamingMap', 'LayerEdit', 'Changes', 'currentModelName'],
  mounted () {
    this.setOption = _.cloneDeep(this.dataByType.namingOption)
  },
  methods: {
    applyNamingOption () {
      this.$confirm('是否将当前命名设置应用到模型的表、字段和索引', '提示', {
        type: 'info'
      }).then(() => {
        // if (JSON.stringify(this.dataByType.namingOption) !== JSON.stringify(this.setOption)) {
        let change = new (this.Changes)('modifyNamingOptionAndApply', {
          pre: _.cloneDeep(this.dataByType.namingOption),
          now: null,
          tablePre: Object.values(this.dataByType.table).filter(table => !table.properties.deleted).map(i => ({
            properties: {
              Name: i.properties.Name,
              Id: i.properties.Id
            },
            children: i.children && i.children.map(j => ({
              properties: {
                Macro: j.properties.Macro,
                Name: j.properties.Name
              }
            }))
          })),
          tableNow: [],
          viewPre: Object.values(this.dataByType.view).filter(view => !view.properties.deleted).map(i => ({
            properties: {
              Name: i.properties.Name,
              Id: i.properties.Id
            },
            children: i.children && i.children.map(j => ({
              properties: {
                Macro: j.properties.Macro,
                Name: j.properties.Name
              }
            }))
          })),
          viewNow: []
        })
        this.dataByType.namingOption = this.setOption
        this.dataByType.namingOption.changed = true
        this.loading = true
        this.count = 0

        change.obj.now = _.cloneDeep(this.dataByType.namingOption)

        Object.values(this.dataByType.table).filter(table => !table.properties.deleted).forEach(async table => {
          // 业务对象等不需要格式化名称
          if (table.properties.TypeId === 80000004) {
            table.properties.Name = this.getTableNameNamingMap(table.properties.Name)
          }
          table.properties.changed = true
          table.children && table.children.forEach(async column => {
            if (column.objectClass === 'Datablau.LDM.EntityKeyGroup') {
              let keyId = table.children.length + this.count++
              if (column.properties.Name && column.properties.Name.search(/(\d+)$/) !== -1) {
                keyId = Number.parseInt(column.properties.Name.slice(column.properties.Name.search(/(\d+)$/)))
              }
              if (column.properties.Macro) {
                if (column.properties.KeyGroupType === 'PrimaryKey') {
                  column.properties.Macro = this.dataByType.namingOption.PKDefaultMacro
                } else if (column.properties.KeyGroupType === 'UniqueKey') {
                  column.properties.Macro = this.dataByType.namingOption.UKDefaultMacro
                } else if (column.properties.KeyGroupType === 'NonUniqueKey') {
                  column.properties.Macro = this.dataByType.namingOption.NUKDefaultMacro
                } else if (column.properties.KeyGroupType === 'ForeignKey') {
                  column.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
                }
              }
              if (column.properties.Macro) {
                column.properties.Name = this.getIndexNameNamingMap(column.properties.Macro, table.properties.Name, keyId)
              } else {
                column.properties.Name = this.getIndexNameNamingMap(column.properties.Macro, column.properties.Name, keyId)
              }
            } else if (column.properties.TypeId === 80000005) { // 字段
              column.properties.Name = this.getColumnNameNamingMap(column.properties.Name)
            }
            column.properties.changed = true
          })
          let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
          if (cell) {
            cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
            cell.changed = true
            this.graph.graph.refresh(cell)
          }
        })
        change.obj.tableNow = Object.values(this.dataByType.table).filter(table => !table.properties.deleted).map(i => ({
          properties: {
            Name: i.properties.Name,
            Id: i.properties.Id
          },
          children: i.children && i.children.map(j => ({
            properties: {
              Macro: j.properties.Macro,
              Name: j.properties.Name
            }
          }))
        }))
        Object.values(this.dataByType.view).filter(table => !table.properties.deleted).forEach(async table => {
          // View 不需要格式化名称
          // table.properties.Name = this.getTableNameNamingMap(table.properties.Name)
          table.properties.changed = true
          table.children && table.children.forEach(column => {
            if (column.objectClass === 'Datablau.LDM.EntityKeyGroup') {
              let keyId = table.children.length + this.count++
              if (column.properties.Name && column.properties.Name.search(/(\d+)$/) !== -1) {
                keyId = Number.parseInt(column.properties.Name.slice(column.properties.Name.search(/(\d+)$/)))
              }
              if (column.properties.KeyGroupType === 'PrimaryKey') {
                column.properties.Macro = this.dataByType.namingOption.PKDefaultMacro
              } else if (column.properties.KeyGroupType === 'UniqueKey') {
                column.properties.Macro = this.dataByType.namingOption.UKDefaultMacro
              } else if (column.properties.KeyGroupType === 'NonUniqueKey') {
                column.properties.Macro = this.dataByType.namingOption.NUKDefaultMacro
              } else if (column.properties.KeyGroupType === 'ForeignKey') {
                column.properties.Macro = this.dataByType.namingOption.FKDefaultMacro
              }
              column.properties.Name = this.getIndexNameNamingMap(column.properties.Macro, table.properties.Name, keyId)
            } else if (column.properties.TypeId === 80000005) { // 字段
              column.properties.Name = this.getColumnNameNamingMap(column.properties.Name)
            }
            column.properties.changed = true
          })
          let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
          if (cell) {
            cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
            cell.changed = true
            this.graph.graph.refresh(cell)
          }
        })
        change.obj.viewNow = Object.values(this.dataByType.view).filter(view => !view.properties.deleted).map(i => ({
          properties: {
            Name: i.properties.Name,
            Id: i.properties.Id
          },
          children: i.children && i.children.map(j => ({
            properties: {
              Macro: j.properties.Macro,
              Name: j.properties.Name
            }
          }))
        }))
        // this.graph.graph.getView().refresh()
        this.graph.editor.undoManager.undoableEditHappened(new (this.LayerEdit)([change]))
        this.loading = false
        this.$emit('closeNamingOptionDialog')
        // } else {
        //   this.$emit('closeNamingOptionDialog')
        // }
      }).catch(() => {

      })
    },
    confirmNamingOption () {
      let change = new (this.Changes)('modifyNamingOption', {
        pre: _.cloneDeep(this.dataByType.namingOption),
        now: null
      })
      if (JSON.stringify(this.dataByType.namingOption) !== JSON.stringify(this.setOption)) {
        this.dataByType.namingOption = this.setOption
        this.dataByType.namingOption.changed = true
        change.obj.now = _.cloneDeep(this.dataByType.namingOption)
        this.graph.editor.undoManager.undoableEditHappened(new (this.LayerEdit)([change]))
      }
      this.$emit('closeNamingOptionDialog')
    },
    cancel () {
      this.$emit('closeNamingOptionDialog')
    }
  }
}
</script>

<style lang="scss" scoped>
  .datablau-radio /deep/ .el-radio__input.is-disabled + span.el-radio__label {
    color: #555;
  }
  .top-abs {
    position: absolute;
    top: 0;
    right: 0;
  }
  .datablau-checkbox2 /deep/ .el-checkbox__label {
    padding-left: 10px;
  }
  .datablau-checkbox2 /deep/ .el-checkbox__inner {
    border-color: #979797;
    border-radius: 1px;
  }
  .datablau-checkbox2 /deep/ .is-checked .el-checkbox__inner {
    border-color: #409EFF;
  }
  .el-radio {
    margin-right: 20px;
    /deep/ .el-radio__label {
      font-size: 12px;
      color: #555;
    }
    /deep/.is-checked+.el-radio__label {
      color: #409EFF;
    }
  }
  .top-tips {
    color: #555;
    font-size: 12px;
    line-height: 14px;
    .iconfont {
      margin-right: 6px;
      font-size: 14px;
    }
  }
  .datablau-input /deep/ .el-input__inner {
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      color: #555;
    }
  .btn-wrapper {
    margin-top: 27px;
    float: right;
    position: absolute;
    right: 0;
    bottom: 10px;
    .is-block {
      height: 30px;
      line-height: 28px;
      font-size: 12px;
      font-weight: 400;
    }
  }
  .naming-option-wrapper {
    position: relative;
    font-size: 12px;
    height: 471.8px;
  }
  .head-wrapper {
    h2 {
      font-size: 12px;
      font-weight: normal;
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
    }
    .datablau-switch {
      display: inline-block;
    }
    .datablau-input /deep/ .el-input__inner {
      height: 30px;
      line-height: 30px;
    }
  }
  .input-item {
    span {
      margin-right: 6px;
    }
  }
  .content-wrapper {
    li {
      margin-top: 20px;
      vertical-align: middle;
    }
    .radio-wrapper {
      margin-top: 10px;
      span {
        color: #555;
        font-weight: 500;
        margin-right: 9px;
        vertical-align: middle;
        display: inline-block;
        width: 100px;
        text-align: right;
      }
      .datablau-radio {
        display: inline-block;
        vertical-align: middle;
      }
    }
    .input-item {
      span {
        display: inline-block;
        width: 100px;
        text-align: right;
        color: #555;
        font-weight: 500;
      }
      /deep/ .datablau-input {
        width: 160px;
      }
    }
  }
  /deep/ .el-checkbox__label {
    font-size: 12px;
    color: #555;
    font-weight: 500;
  }
</style>
