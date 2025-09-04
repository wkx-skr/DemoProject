<template>
  <div>
    <datablau-dialog
      :title="'行级数据'"
      width="960px"
      height="500px"
      :before-close="closeDialog"
      :visible="filteringDialog"
    >
      <datablau-button type="primary" size="mini" @click="addGroup">
        新增条件组
      </datablau-button>
      <el-divider direction="vertical"></el-divider>
      <div class="lineLimitBox">
        <span class="lineLimit">数据行数限制</span>
        <datablau-input
          :placeholder="'请输入数字'"
          clearable
          v-model="limit"
          @keyup.native="numberMax"
        ></datablau-input>
      </div>
      <span class="viewText">
        <el-divider direction="vertical"></el-divider>
        <span>数据表：{{ curInfo.physicalName }}</span>
      </span>
      <div
        class="groups"
        :class="{
          lineGroups: groupsList.length > 1,
          andNameLine: groupFlag == 'AND',
        }"
      >
        <div
          class="group"
          :class="{
            lineGroups: group.conditionDtos.length > 1,
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
                :value="item.objectId + '-' + item.physicalName"
              ></el-option>
            </datablau-select>
            <datablau-select
              v-model="v.connector"
              clearable
              size="mini"
              filterable
              placeholder="请选择操作符"
              style="width: 160px"
            >
              <el-option
                v-for="item in operatorList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
            <datablau-input
              :placeholder="'请输入值'"
              v-model="v.value"
              clearable
            ></datablau-input>
            <div class="btnBox">
              <datablau-button type="icon" low-key @click="addItem(index)">
                <datablau-tooltip content="添加" placement="top">
                  <i class="iconfont icon-tianjia blue"></i>
                </datablau-tooltip>
              </datablau-button>
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
                <!--:class="{
                    color9:
                      groupsList.length === 1 && groupsList[0].conditionDtos.length === 1,
                  }"-->
              </datablau-button>
            </div>
          </div>
          <span
            class="line"
            :class="{ andName: group.connector == 'AND' }"
            v-show="group.conditionDtos.length > 1"
          >
            <span class="textBtn" @click="changeFilter(index)">
              {{ group.connector === 'OR' ? '或' : '且' }}
            </span>
          </span>
        </div>
        <span
          class="line"
          :class="{ andName: groupFlag == 'AND' }"
          v-show="groupsList.length > 1"
        >
          <span class="textBtn" @click="changeFilterGroup">
            {{ groupFlag === 'OR' ? '或' : '且' }}
          </span>
        </span>
      </div>

      <div slot="footer">
        <datablau-button @click="closeDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="btnFlag"
          size="mini"
          @click="primary"
        >
          {{ $t('common.button.add') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../../util/api'
export default {
  props: {
    filteringDialog: {
      type: Boolean,
    },
    assetInfo: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    filteringDialog: {
      handler(val) {
        if (val) {
          this.groupsList = [
            {
              connector: 'OR',
              conditionDtos: [{ objectId: '', connector: '', value: '' }],
            },
          ]
          this.limit = ''
          this.groupFlag = 'OR'
          this.getColumns()
        }
      },
      immediate: true,
    },
  },
  computed: {
    btnFlag() {
      let resultList = []
      let flag = true
      this.groupsList.map(item => {
        item.conditionDtos.map(m => {
          if (
            m.connector &&
            m.objectId &&
            (m.value || parseFloat(m.value) === 0)
          ) {
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
      ],
      groupsList: [
        {
          connector: 'OR',
          conditionDtos: [{ objectId: '', connector: '', value: '' }],
        },
      ],
      groupFlag: 'OR',
      limit: '',
      // table: 'departments_copy',
      page: 1,
      curInfo: {},
    }
  },
  methods: {
    getAssetInfo(e) {
      this.curInfo = e
    },
    getColumns() {
      HTTP.getColumns(this.assetInfo.assetId)
        .then(res => {
          this.options = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
    primary() {
      let sql = ``
      this.groupsList.forEach((item, i) => {
        let sqlItem = '('
        item.conditionDtos.length < 2 && (item.connector = '')
        item.conditionDtos.forEach((aryItem, index) => {
          let nameId = aryItem.objectId.split('-')
          aryItem.objectId = nameId[0]
          aryItem.name = nameId[1]
          // let name = nameId[1]
          let value = aryItem.connector
          if (aryItem.connector === 'like') {
            value = `包含`
          } else if (aryItem.connector === 'not in') {
            value = `不属于`
          } else if (aryItem.connector === 'in') {
            value = `属于`
          }
          sqlItem += `字段${aryItem.name}的值${value}'${aryItem.value}'`
          index != item.conditionDtos.length - 1 &&
            (sqlItem += `${item.connector == 'OR' ? '或' : '且'}`)
        })
        sqlItem += ')'
        if (i != this.groupsList.length - 1) {
          sql += `${sqlItem} ${this.groupFlag == 'OR' ? '或' : '且'} `
        } else {
          sql += `${sqlItem} `
        }
      })
      this.limit && (sql += `，行数限制：${this.limit}行`)
      // sql += this.groupsList.length > 1 ? ')' : ''
      this.$emit('sqlCompletion', {
        sql,
        groupsList: this.groupsList,
        groupFlag: this.groupFlag,
        limit: this.limit,
      })
      // `SELECT * FROM ${this.table} WHERE `
      // LIMIT this.limit
      this.closeDialog()
    },
    // 新增条件组
    addGroup() {
      this.groupsList.push({
        connector: 'OR',
        conditionDtos: [{ objectId: '', connector: '', value: '' }],
      })
    },
    removeItem(index, i) {
      if (
        this.groupsList[index].conditionDtos.length === 1 &&
        this.groupsList.length == 1
      ) {
        this.groupsList[index].conditionDtos = [
          { objectId: '', connector: '', value: '' },
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
      })
    },
    changeFilterGroup() {
      this.groupFlag = this.groupFlag == 'AND' ? 'OR' : 'AND'
    },
    changeFilter(index, i) {
      let val = this.groupsList[index].connector
      this.groupsList[index].connector = val == 'OR' ? 'AND' : 'OR'
    },
    numberMax(e) {
      e.target.value = e.target.value.replace(/[^\d]/g, '')
      if (e.target.value > 2000000000) {
        // if (e.target.value > 9999999999) {
        e.target.value = 2000000000
      }
      if (e.target.value) {
        this.limit = parseInt(e.target.value)
      } else {
        this.limit = null
      }
      console.log(this.limit)
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

<style scoped lang="scss">
.groups {
  position: relative;
  padding-left: 30px;
  margin-bottom: 20px;
}
.group {
  margin-bottom: 15px;
  margin-top: 20px;
  padding-left: 30px;
  position: relative;
}
.lineGroups {
  & > div:first-child {
    position: relative;
    &:after {
      content: '';
      display: block;
      position: absolute;
      top: -3px;
      height: 10px;
      left: -17px;
      border-right: 2px solid #87cefa;
      transform: rotate(45deg);
    }
  }
  & > div:last-of-type {
    position: relative;
    &:after {
      content: '';
      display: block;
      position: absolute;
      bottom: -2px;
      height: 10px;
      left: -17px;
      border-right: 2px solid #87cefa;
      transform: rotate(-45deg);
    }
  }
}
.groupItem {
  margin-bottom: 10px;
  & > div {
    display: inline-block;
    margin-right: 15px;
  }
}
.andNameLine > div {
  &:first-child:after {
    border-right: 2px solid #90ee90;
  }
  &:last-of-type:after {
    border-right: 2px solid #90ee90;
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
}
.viewText {
  position: absolute;
  top: -35px;
  font-size: 12px;
  left: 84px;
  span {
    color: #999;
  }
}
</style>
