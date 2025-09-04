<template>
    <div class="default-rules" v-loading="loading">
      <div class="top-header-info-panel-wrapper">
        <span class="page-title">内置检查规则</span>
        <!--<i class="el-icon-refresh" @click="refresh" style="margin-right:10px"></i>-->
        <span class="rule-count">一共含有规则：【{{ total }}】</span>
      </div>
      <div class="table-container">
        <datablau-table
          height="100%"
          :data="tableData">
          <el-table-column
            prop="ruleNum"
            label="编码"
            width="120"
          >
            <template slot-scope="scope">
              <datablau-list-icon dataType="icon-menu-gzgl"></datablau-list-icon>
              {{ scope.row.ruleNum }}
            </template>
          </el-table-column>
          <el-table-column
            prop="ruleSeverity"
            label="严重程度"
            width="200"
          >
            <template slot-scope="scope">
              <div class="severity">
                <div class="dot" :class="scope.row.ruleSeverity"></div>
                {{ scope.row.ruleSeverity }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="displayMessage"
            label="规则内容"
          >
            <template slot-scope="scope">
              <span v-html="scope.row.displayMessage"></span>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            prop="enable"
            label="启用状态"
            header-align="left"
            align="left"
            width="100"
          >
            <template slot-scope="scope">
              <datablau-switch
                style="display: inline-block;margin-right:5px"
                v-model="scope.row.enable"
                @change="updateDefaultRule([scope.row])"
              ></datablau-switch>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            prop="enable"
            label="操作"
            header-align="left"
            align="left"
            width="60"
          >
            <template slot-scope="scope">
              <datablau-button
                type="icon"
                @click="handleEdit(scope.row)"
                tooltipContent="编辑"
              ><i class="iconfont icon-bianji"></i></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <datablau-dialog
        :visible.sync="dialogVisible"
        title="系统内置检查规则编辑"
        width="600px"
        append-to-body
        v-loading="loading"
      >
        <div class="content" v-if="currentRow.rowArr.length > 0">
          <div class="row" v-if="Object.keys(currentRow.parameter).length === 0">
            {{ currentRow.rowArr[0] }}
          </div>
          <span
            class="row"
            v-for="(val,idx) in currentRow.parameter"
            :key="idx"
          >
                <template></template>
                <span>
                    {{ currentRow.rowArr[idx - 1] }}
                </span>
                   <el-input-number size="small" :min='0' v-model="currentRow.parameter[idx]"></el-input-number>
            </span>
          <span>
                {{ currentRow.rowArr.length - 1 > 0 ? currentRow.rowArr[currentRow.rowArr.length - 1] : '' }}
            </span>
          <datablau-select
            v-model="currentRow.ruleSeverity"
            style="width: 300px;margin-top:20px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
          <span slot="footer">
            <datablau-button @click="dialogVisible = false">取 消</datablau-button>
            <datablau-button type="primary" @click="handleSave">
              保 存
            </datablau-button>
          </span>
        </datablau-dialog>
    </div>
</template>
<script>
import HTTP from '@/resource/http'

export default {
  data () {
    return {
      options: [
        {
          label: 'ERROR',
          value: 'ERROR'
        },
        {
          label: 'WARN',
          value: 'WARN'
        },
        {
          label: 'INFO',
          value: 'INFO'
        }
      ],
      currentRow: {
        parameter: {},
        rowArr: []
      },
      dialogVisible: false,
      loading: false,
      tableData: [],
      total: 0
    }
  },
  mounted () {
    this.getDefaultRules()
  },
  inject: ['refresh'],
  methods: {
    handleSave () {
      this.updateDefaultRule([this.currentRow])
    },
    updateDefaultRule (arr) {
      let formatArr = arr.map(v => {
        let { createTime, creator, enable, id, message, parameter, ruleNum, ruleSeverity } = v
        return {
          createTime,
          creator,
          enable,
          id,
          message,
          parameter,
          ruleNum,
          ruleSeverity
        }
      })
      this.loading = true
      HTTP.updateDefaultRule(formatArr)
        .then(res => {
          this.$blauShowSuccess('保存成功')
          this.dialogVisible = false
          this.getDefaultRules()
        })
        .catch(err => {
          this.loading = false
          this.$showFailure(err)
        })
    },
    handleEdit (row) {
      this.dialogVisible = true
      this.currentRow = _.cloneDeep(row)
    },
    getDefaultRules () {
      this.loading = true
      HTTP.getDefaultRules()
        .then(res => {
          this.loading = false
          this.tableData = res
          res.sort((a, b) => a.id - b.id)
          res.forEach(v => {
            let rowMessage = v.message.replace(/\{(.+?)\}/g, '$')
            let rowArr = rowMessage.split('$')
            v.rowArr = _.cloneDeep(rowArr)
            for (let index in v.parameter) {
              rowArr[index - 1] = rowArr[index - 1] + ` <b>${v.parameter[index]}</b> `
            }
            v.displayMessage = rowArr.join('')
          })
          this.total = res.length
        })
        .catch(err => {
          this.loading = false
          this.$showFailure(err)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .datablau-table b:hover {
  color: unset;
}
.top-header-info-panel-wrapper {
  line-height: 40px;
  padding-left: 20px;

  .page-title {
    vertical-align: top;
    color: #20293B;
    font-weight: bold;
    line-height: 40px;
  }

  .rule-count {
    vertical-align: top;
    display: inline-block;
    margin-left: 10px;
    font-size: 12px;
    color: #777;
    line-height: 40px;
  }

}
.db-table {
    overflow: auto;
}
.default-rules {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
}

.table-container {
  position: absolute;
  top: 40px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}

.severity {
  .dot {
    display: inline-block;
    margin-right: 6px;
    width: 10px;
    height: 10px;

    &.WARN {
      background: #FF8632;
    }

    &.ERROR {
      background: #FF2E2E;
    }

    &.INFO {
      background: #FFC009;
    }
  }
}
</style>
