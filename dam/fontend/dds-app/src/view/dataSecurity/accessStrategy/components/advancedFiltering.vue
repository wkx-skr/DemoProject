<template>
  <div>
    <datablau-dialog
      :title="$t('accessStrategy.rowData')"
      width="800px"
      height="500px"
      :before-close="closeDialog"
      :visible="filteringDialog"
    >
      <datablau-button type="primary" size="mini" @click="addGroup">
        {{ $t('securityModule.addCondition') }}
      </datablau-button>
      <el-divider direction="vertical"></el-divider>
      <div class="lineLimitBox">
        <span class="lineLimit">{{ $t('accessStrategy.dataRowLimit') }}</span>
        <datablau-input
          :placeholder="$t('securityModule.inputNumber')"
          clearable
          v-model="limit"
          @keyup.native="numberMax"
        ></datablau-input>
      </div>
      <span class="viewText">
        <el-divider direction="vertical"></el-divider>
        <span>
          {{ $t('securityModule.table') }}：{{ curInfo.physicalName }}
        </span>
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
              :placeholder="$t('securityModule.selectColumn')"
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
              :placeholder="$t('accessStrategy.selectOper')"
              style="width: 160px"
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
              :placeholder="$t('securityModule.inputVal')"
              v-model="v.value"
              :disabled="v.disabled"
              clearable
            ></datablau-input>
            <div class="btnBox">
              <datablau-button type="icon" low-key @click="addItem(index)">
                <datablau-tooltip
                  :content="$t('securityModule.add')"
                  placement="top"
                >
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
                <datablau-tooltip
                  :content="$t('securityModule.delete')"
                  placement="top"
                >
                  <i class="iconfont icon-delete blue"></i>
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
              {{
                group.connector === 'AND'
                  ? $t('securityModule.and')
                  : $t('securityModule.or')
              }}
            </span>
          </span>
        </div>
        <span
          class="line"
          :class="{ andName: groupFlag == 'AND' }"
          v-show="groupsList.length > 1"
        >
          <span class="textBtn" @click="changeFilterGroup">
            {{
              groupFlag === 'AND'
                ? $t('securityModule.and')
                : $t('securityModule.or')
            }}
          </span>
        </span>
      </div>

      <div slot="footer">
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="btnFlag"
          size="mini"
          @click="primary"
        >
          {{ $t('securityModule.add') }}
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
    dtoMap: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    filteringDialog: {
      handler(val) {
        if (val) {
          if (this.dtoMap.dtos && this.dtoMap.dtos.length > 0) {
            this.loading = true
            // 编辑
            this.dtoMap.dtos.map(item => {
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
            this.groupsList = this.dtoMap.dtos
            this.limit = this.dtoMap.rowLimit
            this.groupFlag = this.dtoMap.connector
          } else {
            this.groupsList = [
              {
                connector: 'OR',
                conditionDtos: [
                  { objectId: '', connector: '', value: '', disabled: false },
                ],
              },
            ]
            this.limit = ''
            this.groupFlag = 'OR'
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
    btnFlag() {
      let resultList = []
      let flag = true
      this.groupsList.map(item => {
        item.conditionDtos.map(m => {
          if (m.connector && m.objectId) {
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
      HTTP.getColumns(this.assetInfo.assetId)
        .then(res => {
          this.loading = false
          this.options = res.data
        })
        .catch(e => {
          this.loading = false
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
          aryItem.name = this.options.filter(
            o => o.objectId === aryItem.objectId
          )[0].physicalName
          let value = aryItem.connector
          if (aryItem.connector === 'like') {
            value = this.$t('accessStrategy.contain')
          } else if (aryItem.connector === 'not in') {
            value = this.$t('accessStrategy.notBelongTo')
          } else if (aryItem.connector === 'in') {
            value = this.$t('accessStrategy.belongTo')
          } else if (aryItem.connector === 'is null') {
            value = this.$t('accessStrategy.empty')
          } else if (aryItem.connector === 'is not null') {
            value = this.$t('accessStrategy.notEmpty')
          }
          sqlItem += this.$t('accessStrategy.sqlTip', {
            name: aryItem.name,
            value: value,
            value1: aryItem.value,
          })
          index != item.conditionDtos.length - 1 &&
            (sqlItem += `${
              item.connector === 'AND'
                ? this.$t('securityModule.and')
                : this.$t('securityModule.or')
            }`)
        })
        sqlItem += ')'
        if (i != this.groupsList.length - 1) {
          sql += `${sqlItem} ${
            this.groupFlag == 'AND'
              ? this.$t('securityModule.and')
              : this.$t('securityModule.or')
          } `
        } else {
          sql += `${sqlItem} `
        }
      })
      this.limit &&
        (sql += `，${this.$t('accessStrategy.rowLimit', {
          limit: this.limit,
        })}`)
      this.$emit('sqlCompletion', {
        sql,
        groupsList: this.groupsList,
        groupFlag: this.groupFlag,
        limit: this.limit,
      })
      this.closeDialog()
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
  margin-top: 30px;
  .group {
    margin-bottom: 15px;
    margin-top: 20px;
    padding-left: 30px;
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
    margin-right: 15px;
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
