<template>
  <div>
    <datablau-dialog
      title="条件设置"
      size="m"
      height="500px"
      :before-close="closeDialog"
      :visible="filteringDialog"
    >
      <div
        style="
          background: #f7f8fb;
          padding: 12px 20px;
          margin-left: -20px;
          margin-right: -20px;
        "
      >
        <datablau-button
          class="iconfont icon-tianjia"
          type="normal"
          size="mini"
          @click="addGroup"
        >
          新建条件组
        </datablau-button>
        <div class="lineLimitBox" style="margin-left: 14px">
          <span class="lineLimit">数据行数限制</span>
          <datablau-input
            placeholder="请输入"
            clearable
            v-model="limit"
            @keyup.native="numberMax"
            style="width: 160px"
          ></datablau-input>
        </div>
        <div class="lineLimitBox" style="margin-left: 14px">
          <span class="lineLimit">主键</span>
          <el-select
            v-model="pks"
            clearable
            filterable
            collapse-tags
            multiple
            style="width: 160px; display: inline-block"
          >
            <el-option
              v-for="item in pksOptions"
              :key="item.objectId"
              :label="`${item.physicalName}${
                (item.logicalName && `(${item.logicalName})`) || ''
              }`"
              :value="item.physicalName"
            ></el-option>
          </el-select>
        </div>
      </div>
      <span class="viewText">
        <!-- <el-divider direction="vertical"></el-divider> -->
        <span>当前任务下的同一个表的所有字段都使用该条件设置</span>
      </span>
      <div
        v-loading="loading"
        class="groups"
        :class="{
          lineGroups: groupsList.length > 1,
          andNameLine: groupFlag == 'AND',
        }"
      >
        <div
          class="group"
          :class="{
            lineGroup: group.conditionDtos.length > 1,
            andNameLine: group.connector == 'AND',
          }"
          v-for="(group, index) in groupsList"
          :key="'group' + index"
        >
          <div
            class="groupItem"
            v-for="(v, i) in group.conditionDtos"
            :key="'item' + i"
          >
            <datablau-select
              v-model="v.objectId"
              clearable
              size="mini"
              filterable
              placeholder="请选择字段"
              style="width: 160px"
            >
              <el-option
                v-for="item in options"
                :key="item.objectId"
                :label="`${item.physicalName}${
                  (item.logicalName && `(${item.logicalName})`) || ''
                }`"
                :value="item.objectId"
              ></el-option>
            </datablau-select>
            <datablau-select
              v-model="v.connector"
              clearable
              size="mini"
              filterable
              placeholder="请选择操作符"
              style="width: 112px"
              @change="type => changeOperator(type, v)"
            >
              <el-option
                v-for="item in operatorList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
            <datablau-input
              placeholder="请输入值或质量规则参数"
              v-model="v.value"
              :disabled="v.disabled"
              clearable
              style="width: 180px"
            ></datablau-input>
            <div class="btnBox">
              <datablau-button
                type="icon"
                low-key
                @click="removeItem(index, i)"
                :disabled="
                  groupsList.length === 1 && groupsList[0].length === 1
                "
              >
                <datablau-tooltip content="删除" placement="top">
                  <i class="iconfont icon-delete blue"></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button type="icon" low-key @click="addItem(index)">
                <datablau-tooltip content="添加" placement="top">
                  <i class="iconfont icon-tianjia blue"></i>
                </datablau-tooltip>
              </datablau-button>
            </div>
          </div>
          <span
            class="line"
            :class="{ andName: group.connector == 'AND' }"
            v-show="group.conditionDtos.length > 1"
          >
            <span class="textBtn" @click="changeFilter(index)">
              {{ group.connector === 'AND' ? '且' : '或' }}
            </span>
          </span>
        </div>
        <span
          class="line"
          :class="{ andName: groupFlag == 'AND' }"
          v-show="groupsList.length > 1"
        >
          <span class="textBtn" @click="changeFilterGroup">
            {{ groupFlag === 'AND' ? '且' : '或' }}
          </span>
        </span>
      </div>

      <div slot="footer">
        <div class="lineLimitBox" style="float: left">
          <span class="lineLimit errorlineLimit">数据错误行数阈值</span>
          <datablau-input
            placeholder="请输入"
            clearable
            v-model="maxErrorRow"
            @keyup.native="numberMax2"
            style="width: 128px"
          ></datablau-input>
        </div>
        <datablau-button
          type="primary"
          :disabled="groupsValidation || maxErrorRow === ''"
          size="mini"
          @click="primary"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
export default {
  props: {
    filteringDialog: {
      type: Boolean,
    },
    // assetInfo: {
    //   type: Object,
    //   default: () => {},
    // },
    dtoMap: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    filteringDialog: {
      handler(val) {
        if (val) {
          if (
            this.dtoMap.conditionsGroup &&
            this.dtoMap.conditionsGroup.dtos.length > 0
          ) {
            this.loading = true
            // 编辑
            this.dtoMap.conditionsGroup.dtos.map(item => {
              item.conditionDtos.map(m => {
                if (
                  m.connector === 'is not null' ||
                  m.connector === 'is null'
                ) {
                  m.disabled = true
                } else {
                  m.disabled = false
                }
              })
            })
            this.groupsList = this.dtoMap.conditionsGroup.dtos
            this.limit = this.dtoMap.maxInputRow
            this.groupFlag = this.dtoMap.conditionsGroup.connector
            this.maxErrorRow = this.dtoMap.maxErrorRow
            this.$nextTick(() => {
              this.pks = this.dtoMap.pks
            })
          } else {
            this.groupsList = [
              {
                connector: 'OR',
                conditionDtos: [
                  { objectId: '', connector: '', value: '', disabled: false },
                ],
              },
            ]
            this.limit = this.dtoMap.maxInputRow
            this.groupFlag = 'OR'
            this.maxErrorRow = this.dtoMap.maxErrorRow
            this.$nextTick(() => {
              this.pks = this.dtoMap.pks
            })
          }
          this.getColumns()
        }
      },
      immediate: true,
    },
    dtoMap: {
      handler(val) {
        // console.log(val)
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    groupsValidation() {
      let resultList = []
      let flag = true
      this.groupsList.map(item => {
        item.conditionDtos.map(m => {
          if ((m.connector && m.objectId) || (!m.connector && !m.objectId)) {
            resultList.push(true)
          } else {
            resultList.push(false)
          }
        })
      })
      flag = resultList.some(item => !item)
      return flag
    },
  },
  data() {
    return {
      loading: false,
      options: [{ physicalName: 'aa', objectId: 'aa' }],
      operatorList: [
        { value: '>', label: '>' },
        { value: '<', label: '<' },
        { value: '>=', label: '>=' },
        { value: '<=', label: '<=' },
        { value: '!=', label: '!=' },
        { value: '=', label: '=' },
        { value: 'like', label: 'like' },
        { value: 'not in', label: 'not in' },
        { value: 'in', label: 'in' },
        { value: 'is null', label: 'is null' },
        { value: 'is not null', label: 'is not null' },
      ],
      groupsList: [
        {
          connector: 'OR',
          conditionDtos: [
            { objectId: '', connector: '', value: '', disabled: false },
          ],
        },
      ],
      groupFlag: 'OR',
      limit: '',
      page: 1,
      curInfo: {},
      maxErrorRow: '',
      pks: null,
      pksOptions: [],
    }
  },
  methods: {
    changeOperator(type, val) {
      if (type === 'is null' || type === 'is not null') {
        val.disabled = true
        val.value = ''
      } else {
        val.disabled = false
      }
    },
    getAssetInfo(e) {
      this.curInfo = e
    },
    getColumns() {
      this.pks = null
      const requestUrl = `${this.$meta_url}/entities/${this.dtoMap.tableId}/columns`
      this.$http
        .get(requestUrl)
        .then(res => {
          this.loading = false
          this.options = res.data
          this.pksOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialog() {
      this.$emit('closeDialog')
      this.groupsList = []
    },
    primary() {
      let sql = ``
      this.groupsList.forEach((item, i) => {
        let sqlItem = '('
        item.conditionDtos.length < 2 && (item.connector = '')
        item.conditionDtos.forEach((aryItem, index) => {
          aryItem.name = this.options.filter(
            o => o.objectId === aryItem.objectId
          )[0]?.physicalName
          let value = aryItem.connector
          if (aryItem.connector === 'like') {
            value = '包含'
          } else if (aryItem.connector === 'not in') {
            value = '不属于'
          } else if (aryItem.connector === 'in') {
            value = '属于'
          } else if (aryItem.connector === 'is null') {
            value = '空'
          } else if (aryItem.connector === 'is not null') {
            value = '非空'
          }
          sqlItem += `字段${aryItem.name}的值${value}'${aryItem.value}'`
          index != item.conditionDtos.length - 1 &&
            (sqlItem += `${item.connector === 'AND' ? '且' : '或'}`)
        })
        sqlItem += ')'
        if (i != this.groupsList.length - 1) {
          sql += `${sqlItem} ${this.groupFlag == 'AND' ? '且' : '或'} `
        } else {
          sql += `${sqlItem} `
        }
      })
      this.limit && (sql += `，行数限制：${this.limit}行`)
      let obj = {
        id: this.dtoMap.id,
        maxInputRow: this.limit,
        maxErrorRow: this.maxErrorRow,
        pks: this.pks,
      }
      let allCompletelyNonEmpty = this.groupsList.every(group => {
        return group.conditionDtos.every(dto => {
          return dto.objectId && dto.connector
        })
      })
      if (allCompletelyNonEmpty) {
        obj.conditionsGroup = {
          dtos: this.groupsList,
          connector: this.groupFlag,
          rowLimit: this.limit,
        }
      }
      this.$http
        .post(this.$quality_url + `/quality/dataRule/updateRuleTable`, obj)
        .then(res => {
          this.closeDialog()
          this.$message.success('创建成功')
          this.$emit('sqlCompletion')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 新增条件组
    addGroup() {
      this.groupsList.push({
        connector: 'OR',
        conditionDtos: [
          { objectId: '', connector: '', value: '', disabled: false },
        ],
      })
    },
    removeItem(index, i) {
      if (
        this.groupsList[index].conditionDtos.length === 1 &&
        this.groupsList.length == 1
      ) {
        this.groupsList[index].conditionDtos = [
          { objectId: '', connector: '', value: '', disabled: false },
        ]
        return
      }
      this.groupsList[index].conditionDtos.splice(i, 1)
      if (this.groupsList[index].conditionDtos.length === 0) {
        this.groupsList.splice(index, 1)
      }
    },
    addItem(index) {
      this.groupsList[index].conditionDtos.push({
        objectId: '',
        connector: '',
        value: '',
        disabled: false,
      })
      this.groupsList[index].connector = 'OR'
    },
    changeFilterGroup() {
      this.groupFlag = this.groupFlag === 'OR' ? 'AND' : 'OR'
    },
    changeFilter(index, i) {
      let val = this.groupsList[index].connector
      this.groupsList[index].connector = val == 'AND' ? 'OR' : 'AND'
    },
    numberMax(e) {
      e.target.value = e.target.value.replace(/[^\d]/g, '')
      if (e.target.value > 2000000000) {
        e.target.value = 2000000000
      }
      if (e.target.value) {
        this.limit = parseInt(e.target.value)
      } else {
        this.limit = null
      }
    },
    numberMax2(e) {
      e.target.value = e.target.value.replace(/[^\d]/g, '')
      if (e.target.value > 2000000000) {
        e.target.value = 2000000000
      }
      if (e.target.value) {
        this.maxErrorRow = parseInt(e.target.value)
      } else {
        this.maxErrorRow = null
      }
    },
  },
  beforeDestroy() {
    this.$bus.$off('assetInfo')
  },
  mounted() {
    this.$bus.$on('assetInfo', this.getAssetInfo)
  },
}
</script>
<style lang="scss">
.datablau-select.multi-select.lineLimit .el-select .el-select__tags input {
  width: 80% !important;
}
</style>
<style scoped lang="scss">
.groups {
  position: relative;
  padding-left: 24px;
  margin-bottom: 20px;
  margin-top: 30px;
  .group {
    margin-bottom: 15px;
    margin-top: 20px;
    padding-left: 35px;
    position: relative;
  }
}

.lineGroups,
.lineGroup {
  position: relative;
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: -3px;
    height: 10px;
    left: 13px;
    border-right: 2px solid #87cefa;
    transform: rotate(45deg);
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    bottom: -2px;
    height: 10px;
    left: 13px;
    border-right: 2px solid #87cefa;
    transform: rotate(-45deg);
  }
}
.andNameLine {
  &:before {
    border-right: 2px solid #90ee90;
  }
  &:after {
    border-right: 2px solid #90ee90;
  }
}
.groupItem {
  margin-bottom: 10px;
  & > div {
    display: inline-block;
    margin-right: 4px;
  }
}

.blue {
  color: #409eff;
}
.color9 {
  color: #999;
}
.textBtn {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #87cefa;
  border-radius: 10px;
  top: 50%;
  left: -8px;
  color: #fff;
  margin-top: -10px;
  text-align: center;
  line-height: 20px;
  z-index: 11;
  cursor: pointer;
}
.line {
  content: '';
  display: block;
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 10px;
  border-right: 2px solid #87cefa;
}
.andName {
  border-right: 2px solid #90ee90;
  .textBtn {
    background: #90ee90;
  }
}
.lineLimitBox {
  display: inline-block;
}
.lineLimit {
  margin-right: 10px;
  color: #555;
  &.errorlineLimit {
    &:before {
      content: '*';
      color: #e8331e;
      font-size: 15px;
      position: relative;
      top: 1px;
      left: -3px;
    }
  }
}
.viewText {
  position: absolute;
  top: -35px;
  font-size: 12px;
  left: 92px;
  span {
    color: #999;
  }
}
</style>
