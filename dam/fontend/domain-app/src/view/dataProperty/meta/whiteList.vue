<template>
  <div class="white-list-wrapper" v-loading="loading">
    <datablau-dialog
      :title="
        $t('meta.DS.tableDetail.security.whiteListDialogTitle', {
          columnName: this.columnName,
        })
      "
      :visible.sync="dialogVisibleWhiteList"
      width="800px"
    >
      <div>
        <datablau-table :data="whiteListData">
          <el-table-column
            prop="userChineseName"
            :label="$t('meta.DS.tableDetail.security.fullName')"
          ></el-table-column>
          <el-table-column
            prop="username"
            :label="$t('meta.DS.tableDetail.security.username')"
          ></el-table-column>
          <el-table-column
            prop="orgFullName"
            :label="$t('meta.DS.tableDetail.security.org')"
          ></el-table-column>
          <el-table-column
            prop="createTime"
            :label="$t('meta.DS.tableDetail.security.createTime')"
          >
            <template slot-scope="scope">
              {{ moment(scope.row.createTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column
            prop="effectiveEndTime"
            :label="$t('meta.DS.tableDetail.security.effectiveEndTime')"
          >
            <template slot-scope="scope">
              {{ moment(scope.row.effectiveEndTime).format('YYYY-MM-DD') }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="showOperater"
            :label="$t('meta.DS.tableDetail.security.operation')"
            fixed="right"
            align="center"
            :width="80"
          >
            <template slot-scope="scope">
              <!-- <el-popover
                :disabled="
                  isSecurity && !$auth['MAIN_DATA_AUTH_CATALOG_WHITE_LIST']
                "
                :ref="'popover-whitelist-' + scope.$index"
                popper-class="popover-access-control-panel"
                placement="top"
                width="160"
                trigger="click"
              >
                <p>{{ $t('meta.DS.tableDetail.security.delConfirm') }}</p>
                <div style="margin-top: 10px; text-align: left">
                  <datablau-button
                    type="primary"
                    @click="removeWhiteUser(scope)"
                  >
                    {{ $t('common.button.ok') }}
                  </datablau-button>
                  <datablau-button
                    type="text"
                    @click="closeWhiteUserPop(scope)"
                  >
                    {{ $t('common.button.cancel') }}
                  </datablau-button>
                </div>
                <datablau-button
                  type="text"
                  slot="reference"
                  :disabled="
                    isSecurity && !$auth['MAIN_DATA_AUTH_CATALOG_WHITE_LIST']
                  "
                >
                  {{ $t('common.button.remove') }}
                </datablau-button>
              </el-popover> -->
              <datablau-button
                type="text"
                @click="removeWhiteUser(scope)"
                :disabled="
                  isSecurity && !$auth['MAIN_DATA_AUTH_CATALOG_WHITE_LIST']
                "
              >
                {{ $t('common.button.remove') }}
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <span slot="footer">
        <datablau-button type="important" @click="closeWhiteUser">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('meta.DS.tableDetail.security.tips')"
      :visible.sync="selectDialog"
      v-if="selectDialog"
      :before-close="cancelSelect"
      width="420px"
    >
      <p style="margin-top: 15px">
        <i
          class="el-icon-warning"
          style="font-size: 24px; margin-right: 6px; color: #e6a23c"
        ></i>
        {{ $t('meta.DS.tableDetail.security.modifysecurtyLevelConfirm') }}
      </p>
      <div style="margin-top: 20px">
        <span>
          {{
            $t(
              'meta.DS.tableDetail.security.fieldShouldInheritTheViewSecurityLevel'
            )
          }}
        </span>
        <el-radio-group v-model="curSelect" style="margin-left: 10px">
          <el-radio label="a">
            {{ $t('meta.DS.tableDetail.security.yes') }}
          </el-radio>
          <el-radio label="b">
            {{ $t('meta.DS.tableDetail.security.no') }}
          </el-radio>
        </el-radio-group>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="cancelSelect">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="sureSelect">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 数据标准 -->
    <div
      v-if="itemType === 80010066"
      class="set-level-wrapper"
      style="top: 0; right: 0"
      :style="itemType != 82800002 ? 'float: right;' : ''"
    >
      <span class="data-level-hint">
        {{ $t('meta.DS.tableDetail.security.set') }}{{ itemType | getName(this)
        }}{{ $t('meta.DS.tableDetail.security.security') }}
      </span>
      <datablau-select
        class="set-level"
        style="width: 150px; vertical-align: middle; display: inline-block"
        clearable
        v-model="tableAssetsLevel"
        @focus="tableFocus"
        @change="changTableAccessLevel"
        prefix-icon="el-icon-search"
        :placeholder="$t('meta.common.pleaseSelect')"
        :disabled="isSecurity && !$auth['MAIN_DATA_AUTH_SECURITY_LEVEL']"
      >
        <el-option
          v-for="item in levelOption"
          :key="item.id"
          :label="item.name"
          :value="item.code"
        ></el-option>
      </datablau-select>
    </div>
    <!-- 表格，视图 -->
    <template v-if="itemType !== 80010066 && itemType !== 82800002">
      <datablau-input
        clearable
        style="margin-top: 10px; width: 240px"
        :placeholder="$t('meta.DS.tableDetail.security.fillColumnName')"
        v-model="searchQuery"
        :iconfont-state="true"
      ></datablau-input>
      <div
        class="set-level-wrapper ab-pos"
        style="top: 10px; right: 0"
        :style="itemType != 82800002 ? 'float: right;' : ''"
      >
        <span class="data-level-hint">
          {{ $t('meta.DS.tableDetail.security.set')
          }}{{ itemType | getName(this)
          }}{{ $t('meta.DS.tableDetail.security.security') }}
        </span>
        <datablau-select
          class="set-level"
          style="width: 150px; vertical-align: middle; display: inline-block"
          clearable
          v-model="tableAssetsLevel"
          @focus="tableFocus"
          @change="changTableAccessLevel"
          prefix-icon="el-icon-search"
          :placeholder="$t('meta.common.pleaseSelect')"
          :disabled="isSecurity && !$auth['MAIN_DATA_AUTH_SECURITY_LEVEL']"
        >
          <el-option
            v-for="item in levelOption"
            :key="item.id"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </datablau-select>
      </div>
      <datablau-table
        v-loading="tableLoading"
        class="datablau-table table"
        :data="columnTableShow"
        style="margin-top: 10px"
      >
        <el-table-column
          width="70"
          :label="$t('meta.DS.tableDetail.security.index')"
        >
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          width="200"
          prop="physicalName"
          :label="$t('meta.DS.tableDetail.security.columnName')"
        >
          <template slot-scope="scope">
            <div
              style="line-height: 32px; display: inline-block"
              v-if="scope.row.type"
            >
              <span
                v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"
              ></span>
            </div>
            {{ scope.row.physicalName }}
          </template>
        </el-table-column>
        <el-table-column
          width="300"
          show-overflow-tooltip
          prop="chineseName"
          :label="$t('meta.DS.tableDetail.security.chineseName')"
        ></el-table-column>
        <el-table-column
          prop="assetsLevel.name"
          :label="$t('meta.DS.tableDetail.security.dataSecurityLevel')"
        >
          <template slot-scope="scope">
            <datablau-select
              :disabled="isSecurity && !$auth['MAIN_DATA_AUTH_SECURITY_LEVEL']"
              class="mini-select"
              clearable
              style="max-width: 200px"
              v-model="scope.row.assetsLevel && scope.row.assetsLevel.code"
              @focus="focus(scope.row)"
              @change="changAccessLevel(scope.row, ...arguments)"
              :placeholder="$t('meta.common.pleaseSelect')"
            >
              <el-option
                v-for="item in levelOption"
                :key="item.id"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </datablau-select>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.security.desensitizeRule')"
          :min-width="100"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="editCol(scope.row)">
              {{ $t('common.button.scan') }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.security.whiteList')"
          width="100"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              @click="showWhiteList(scope.row)"
              :disabled="!scope.row.whiteListCount"
            >
              {{ scope.row.whiteListCount ? scope.row.whiteListCount : 0 }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </template>
    <!--报表-->
    <template v-if="itemType === 82800002">
      <div class="descriptionMessage-title" style="margin-top: 20px">
        <p class="message-title">
          {{ $t('meta.DS.tableDetail.security.relDbs') }}
        </p>
      </div>
      <datablau-input
        clearable
        style="margin: 10px 0; width: 240px"
        :placeholder="$t('meta.DS.tableDetail.security.fillColumnName')"
        :iconfont-state="true"
        v-model="searchQuery"
      ></datablau-input>
      <div
        class="set-level-wrapper ab-pos"
        style="top: 10px; right: 0"
        :style="itemType != 82800002 ? 'float: right;' : ''"
      >
        <span class="data-level-hint">
          {{ $t('meta.DS.tableDetail.security.setReportSecurity') }}
        </span>
        <datablau-select
          :disabled="isSecurity && !$auth['MAIN_DATA_AUTH_SECURITY_LEVEL']"
          class="set-level"
          clearable
          style="width: 150px; vertical-align: middle; display: inline-block"
          v-model="tableAssetsLevel"
          @focus="tableFocus"
          @change="changTableAccessLevel"
          prefix-icon="el-icon-search"
          :placeholder="$t('meta.common.pleaseSelect')"
        >
          <el-option
            v-for="item in levelOption"
            :key="item.id"
            :label="item.name"
            :value="item.code"
          ></el-option>
        </datablau-select>
      </div>
      <datablau-table :data="columnTableShow">
        <el-table-column
          width="100"
          :label="$t('meta.DS.tableDetail.security.index')"
        >
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="modelName"
          :label="$t('meta.DS.tableDetail.security.database')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.modelName ? scope.row.modelName : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="tableName"
          :label="$t('meta.DS.tableDetail.security.table')"
        ></el-table-column>
        <el-table-column
          prop="columnName"
          :label="$t('meta.DS.tableDetail.security.columnName')"
        >
          <template slot-scope="scope">
            <div
              style="line-height: 32px; display: inline-block"
              v-if="scope.row.type"
            >
              <span
                v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"
              ></span>
            </div>
            {{ scope.row.columnName }}
          </template>
        </el-table-column>
        <el-table-column
          width="200"
          prop="level"
          :label="$t('meta.DS.tableDetail.security.securityLevel')"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.modelName ? scope.row.level : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="白名单" width="100">
          <template slot-scope="scope">
            <datablau-button
              v-if="scope.row.columnId"
              type="text"
              @click="showWhiteListRelateReport(scope.row)"
            >
              {{ $t('meta.DS.tableDetail.security.detail') }}
            </datablau-button>
            <datablau-button v-else type="text" disabled>
              {{ $t('meta.DS.tableDetail.security.detail') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </template>
  </div>
</template>

<script>
import moment from 'moment'
import HTTP from '@/http/main.js'

export default {
  props: {
    itemId: {
      required: true,
    },
    itemType: {
      required: true,
    },
    isSecurity: {
      type: Boolean,
      default: false,
    },
  },
  filters: {
    getName(val, that) {
      let name = ''
      switch (parseFloat(val)) {
        case 80010066:
        case 80500008:
          name = that.$t('meta.DS.tableDetail.security.standard')
          break
        case 80000004:
          name = that.$t('meta.DS.tableDetail.security.tableLevel')
          break
        default:
          name = that.$t('meta.DS.tableDetail.security.tableLevel')
      }
      return name
    },
  },
  data() {
    return {
      curSelect: 'a',
      selectDialog: false,
      loading: false,
      tableLoading: false,
      whiteListData: [],
      columnName: '',
      columnTable: [],
      columnTableShow: [],
      dialogVisibleWhiteList: false,
      moment: moment,
      focusCanChange: true,
      levelIdToNameMap: {},
      searchQuery: '',
      searchQuery1: '',
      tableAssetsLevel: '',
      tableAssetsLevelBak: '',
      tableAssetsLevelName: '',
      levelOption: [],
      showOperater: true,
      childrenIds: [],
      curAssetsCode: '',
      isFirst: true,
    }
  },
  mounted() {
    // console.log(this.isSecurity)
    // console.log(this.itemType)
    // console.log(this.$auth.MAIN_DATA_AUTH_SECURITY_LEVEL)
    this.initData()
  },
  beforeDestroy() {},
  methods: {
    cancelSelect() {
      this.tableAssetsLevel = this.tableAssetsLevelBak
      this.selectDialog = false
    },
    sureSelect() {
      this.modifyData()
    },
    modifyData() {
      let params = {
        assetsCode: this.curAssetsCode,
      }
      if (this.isFirst) {
        params.itemId = this.itemId
        params.itemType = this.itemType
      } else {
        params.itemType = 80000005
        params.childrenIds = this.childrenIds
      }
      this.$http
        .put(this.$url + '/service/auth/assets/tag/change', params)
        .then(res => {
          this.selectDialog = false
          if (this.curSelect === 'a' && this.isFirst) {
            this.isFirst = false
            this.modifyData()
          } else {
            this.$message.success(this.$t('meta.DS.message.modifySucceed'))
            this.initData() // 刷新当前列表
            this.$bus.$emit('refreshListData') // 刷新外部list
          }
        })
        .catch(e => {
          this.selectDialog = false
          this.initData()
          this.$showFailure(e)
        })
    },
    editCol(row) {
      this.$emit('handleLook', row)
    },
    dataTypeFormatter(row) {
      if (!row.type) {
        return ''
      }
      const type = row.type.toLowerCase()
      if (
        type.includes('int') ||
        type.includes('long') ||
        type.includes('number')
      ) {
        return 'number'
      } else if (type.includes('char') || type.includes('text')) {
        return 'string'
      } else if (type.includes('time') || type.includes('date')) {
        return 'time'
      } else {
        return row.type
      }
    },
    iconHtmlFormat(name) {
      let formatedName = ''
      let color = ''
      formatedName = name.slice(0, 3).toUpperCase()
      switch (name) {
        case 'time':
          formatedName = 'TIME'
          color = '#29a7ca'
          break
        case 'number':
          color = '#8c5dff'
          break
        case 'string':
          color = '#f7a789'
          break
        default:
          color = '#aaa'
          break
      }
      return `<span style="
    color: #fff;background:${color};width:34px;height:22px;line-height:22px;text-align:center;border-radius:3px;display:inline-block;margin-right: 5px;">${formatedName}</span>`
    },
    tableFocus() {
      if (this.focusCanChange) {
        this.tableAssetsLevelBak = this.tableAssetsLevel
      }
    },
    focus(row) {
      if (this.focusCanChange) {
        row.accessLevelIdBak = (row.assetsLevel && row.assetsLevel.code) || ''
      }
    },
    changTableAccessLevel(assetsCode) {
      this.focusCanChange = false
      if (assetsCode) {
        if (this.childrenIds.length > 0) {
          this.selectDialog = true
          this.curAssetsCode = assetsCode
          this.isFirst = true
        } else {
          this.$DatablauCofirm(
            this.$t('meta.DS.tableDetail.security.modifysecurtyLevelConfirm'),
            this.$t('meta.DS.tableDetail.security.tips'),
            {
              confirmButtonText: this.$t('common.button.ok'),
              cancelButtonText: this.$t('common.button.cancel'),
              type: 'warning',
            }
          )
            .then(() => {
              let params = {
                assetsCode,
                itemId: this.itemId,
                itemType: this.itemType,
              }
              this.$http
                .put(this.$url + '/service/auth/assets/tag/change', params)
                .then(res => {
                  this.$message.success(
                    this.$t('meta.DS.message.modifySucceed')
                  )
                  this.initData() // 刷新当前列表
                  this.$bus.$emit('refreshListData') // 刷新外部list
                })
                .catch(e => {
                  this.selectDialog = false
                  this.initData()
                  this.$showFailure(e)
                })
            })
            .catch(() => {
              this.tableAssetsLevel = this.tableAssetsLevelBak
            })
            .finally(() => {
              this.focusCanChange = true
            })
        }
      } else {
        this.$DatablauCofirm(
          this.$t('meta.DS.tableDetail.security.modifysecurtyLevelConfirm'),
          this.$t('meta.DS.tableDetail.security.tips'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            let newList = []
            const params = {
              name: this.tableAssetsLevelName,
            }
            newList.push(params)
            this.$http
              .put(
                `${this.$url}/service/entities/${this.itemId}/tags/delete?typeId=${this.itemType}`,
                newList
              )
              .then(res => {
                this.$message.success(this.$t('meta.DS.message.modifySucceed'))
                this.initData() // 刷新当前列表
                this.$bus.$emit('refreshListData') // 刷新外部list
                this.focusCanChange = true
              })
              .catch(e => {
                this.$showFailure(e)
              })
          })
          .catch(() => {
            this.tableAssetsLevel = this.tableAssetsLevelBak
          })
          .finally(() => {
            this.focusCanChange = true
          })
      }
    },
    changAccessLevel(row, assetsCode) {
      this.focusCanChange = false
      const h = this.$createElement
      this.$DatablauCofirm(
        this.$t('meta.DS.tableDetail.security.modifysecurtyLevelConfirm'),
        this.$t('meta.DS.tableDetail.security.tips'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          if (assetsCode) {
            this.$http
              .put(this.$url + '/service/auth/assets/tag/change', {
                itemId: row.columnObjectId,
                itemType: 80000005,
                assetsCode,
              })
              .then(res => {
                this.getWhiteList()
                this.$message.success(this.$t('meta.DS.message.modifySucceed'))
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            let newList = []
            const params = {
              name: row.assetsLevel.name,
            }
            newList.push(params)
            this.$http
              .put(
                `${this.$url}/service/entities/${row.columnObjectId}/tags/delete?typeId=80000005`,
                newList
              )
              .then(res => {
                this.$message.success(this.$t('meta.DS.message.modifySucceed'))
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(() => {
          row.assetsLevel.code = row.accessLevelIdBak
        })
        .finally(() => {
          this.focusCanChange = true
        })
    },
    closeWhiteUser() {
      this.dialogVisibleWhiteList = false
    },
    removeWhiteUser(scope) {
      this.$DatablauCofirm(
        this.$t('meta.DS.tableDetail.visitControl.removeConfirm'),
        this.$t('common.info.title'),
        'warning',
        {
          showCancelButton: true,
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
        }
      )
        .then(() => {
          this.$http
            .delete(this.$url + '/service/auth/whiteList/' + scope.row.id)
            .then(res => {
              this.$message.success(this.$t('meta.DS.message.delSucceed'))
              this.getWhiteListItemData(scope.row.itemId)
              this.getWhiteList()
            })
            .catch(e => {
              this.showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    closeWhiteUserPop(scope) {
      this.$refs['popover-whitelist-' + scope.$index].doClose()
    },
    showWhiteList(row) {
      this.columnName = row.physicalName
      this.getWhiteListItemData(row.columnObjectId)
      this.dialogVisibleWhiteList = true
      this.showOperater = true
    },
    showWhiteListRelateReport(row) {
      this.columnName = row.columnName
      this.getWhiteListItemData(row.columnId)
      this.dialogVisibleWhiteList = true
      this.showOperater = false
    },
    getWhiteListItemData(itemId) {
      this.$http
        .post(this.$url + '/service/auth/whiteList/item', {
          itemId,
          itemType: 80000005,
        })
        .then(res => {
          this.whiteListData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initData() {
      this.$http
        .get(this.$url + '/service/auth/assets')
        .then(res => {
          this.levelOption = res.data
          this.levelOption.forEach(level => {
            this.levelIdToNameMap[level.id] = level.name
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.$http
        .post(this.$url + '/service/auth/item/assets', {
          itemId: this.itemId,
          itemType: this.itemType,
        })
        .then(res => {
          if (res.data) {
            this.tableAssetsLevel = res.data.code
            this.tableAssetsLevelName = res.data.name
          } else {
            this.tableAssetsLevel = ''
            this.tableAssetsLevelName = ''
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.getWhiteList()
    },
    getWhiteList() {
      this.tableLoading = true
      if (this.itemType !== 80010066 && this.itemType !== 82800002) {
        this.$http
          .post(this.$url + '/service/auth/whiteList/table', {
            itemId: this.itemId,
            itemType: this.itemType,
            onlyWhiteListColumn: false,
          })
          .then(res => {
            this.tableLoading = false
            this.columnTable = res.data
            this.childrenIds = []
            res.data.map(item => {
              this.childrenIds.push(item.columnObjectId)
            })
            this.columnTableShow = this.columnTable
          })
          .catch(e => {
            this.tableLoading = false
            this.$showFailure(e)
          })
      }
      if (this.itemType === 82800002) {
        HTTP.getSecuReportDetail({ reportId: this.itemId })
          .then(res => {
            this.tableLoading = false
            this.columnTable = res.data.relatedTableDto
              ? res.data.relatedTableDto
              : []
            this.columnTableShow = res.data.relatedTableDto
              ? res.data.relatedTableDto
              : []
          })
          .catch(e => {
            this.tableLoading = false
            this.$showFailure(e)
          })
      }
    },
  },
  watch: {
    searchQuery(val) {
      if (val === '') {
        this.columnTableShow = this.columnTable
      } else {
        this.columnTableShow = this.columnTable.filter(item => {
          const name =
            this.itemType === 82800002 ? item.columnName : item.physicalName
          return name.toLowerCase().indexOf(val.toLowerCase()) !== -1
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.white-list-wrapper {
  padding-bottom: 20px;
  h2 {
    font-size: 15px;
  }
}
.btn-wrapper {
  float: right;
  .el-button + .el-button {
    margin-left: 10px;
  }
}
.pagination-panel {
  margin-top: 10px;
  text-align: right;
}
.set-level /deep/ .el-input__inner {
  background: url('~@/assets/images/icon/set.png') no-repeat 3px center;
  background-size: 20px;
  padding: 0 0 0 26px;
  box-sizing: border-box;
  font-size: 14px;
  padding-left: 28px !important;
}
.el-table {
  font-size: 12px;
}
.set-level-wrapper {
  // border: 1px solid #dcdfe6;
  text-align: right;
  &:hover {
    border-color: #409eff;
  }
  &.ab-pos {
    position: absolute;
    top: 25px;
    right: 20px;
    z-index: 10;
    width: 300px;
  }
  .el-select /deep/ .el-input__inner {
    height: 30px;
    line-height: 30px;
  }
  .data-level-hint {
    display: inline-block;
    line-height: 34px;
    height: 34px;
    // border: 1px solid #dcdfe6;
    // border-right: none;
    box-sizing: border-box;
    padding: 0 10px;
    vertical-align: middle;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .set-level {
    /deep/ .el-select {
      .el-input__inner {
        // border: 0;
      }
    }
  }
  &:hover {
    .data-level-hint {
      border-color: #409eff;
    }
    .el-select /deep/ .el-input__inner {
      border-color: #409eff;
    }
  }
}
</style>
