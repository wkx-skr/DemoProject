<template>
  <div>
    <div
      class="search-part"
      style="position: relative; margin-top: 10px; z-index: 1"
    >
      <datablau-input
        style="width: 200px; float: left; margin-right: 10px"
        :placeholder="
          isLogical
            ? $t('meta.DS.tableDetail.column.placeholderLogical')
            : $t('meta.DS.tableDetail.column.placeholder')
        "
        :iconfont-state="true"
        v-model="searchKeyword"
      ></datablau-input>
      <div class="searchTag">
        <datablau-button type="secondary" @click="callTagSelector">
          <i
            class="el-icon-plus"
            style="font-weight: bold; margin-right: 4px"
          ></i>
          {{ $t('meta.DS.tableDetail.column.tagFilter') }}
        </datablau-button>

        <el-tag
          style="margin-left: 0.3em"
          size="small"
          closable
          v-for="(v, i) in currentTag"
          @close="handleCloseTag(v, i)"
          v-if="currentTag && i < 6"
          :key="i"
        >
          {{ tagNames[i] }}
        </el-tag>
        <span v-if="currentTag && currentTag.length > 6">
          {{ $t('meta.DS.filter.etcTag').format(currentTag.length) }}
        </span>
        <el-button
          size="small"
          type="text"
          @click="cancelTagSelect"
          v-if="currentTag.length > 0"
          style="margin-left: 10px"
        >
          {{ $t('meta.DS.filter.cancelFilterByTag') }}
        </el-button>
      </div>
      <div class="button-part" style="position: absolute; right: 0; top: 0">
        <datablau-button
          type="important"
          @click="editColumns()"
          v-if="
            !editState &&
            ($auth['METADATA_EDIT'] ||
              (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
            !Boolean($route.query.isAssets)
          "
        >
          {{ $t('common.button.edit') }}
        </datablau-button>
        <datablau-button
          type="secondary"
          @click="cancelEdit()"
          v-if="editState"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="saveColumns()"
          v-if="editState"
          style="margin-left: 6px"
        >
          {{ $t('common.button.save') }}
        </datablau-button>
      </div>
    </div>
    <div
      style="
        position: absolute;
        top: 44px;
        left: 20px;
        right: 20px;
        bottom: 60px;
      "
    >
      <datablau-table
        style="margin-top: 10px"
        :data="tableData"
        :show-column-selection="columnOption.showColumnSelection"
        :column-selection="columnOption.columnSelection"
        :border="columnOption.columnResizable"
        height="100%"
      >
        <el-table-column
          width="60"
          align="left"
          :label="$t('meta.DS.tableDetail.column.num')"
        >
          <template slot-scope="scope">
            <span style="width: 25px; display: inline-block">
              {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
            </span>
            <!-- <div
              style="line-height: 32px; display: inline-block"
              v-if="scope.row.type"
            >
              <span
                v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"
              ></span>
            </div> -->
          </template>
        </el-table-column>
        <el-table-column
          :label="
            isLogical
              ? $t('meta.DS.tableDetail.column.columnNameLogical')
              : $t('meta.DS.tableDetail.column.columnName')
          "
          show-overflow-tooltip
          width="200"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="jumpToColumn(scope.row)">
              {{ scope.row.physicalName }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="logicalName"
          :label="$t('meta.DS.tableDetail.column.alias')"
          :show-overflow-tooltip="!editState"
          width="200"
        >
          <template slot-scope="scope">
            <datablau-input
              v-model="scope.row.logicalName"
              style="width: 165px"
              @keydown.enter.native="saveLogicalName"
              :iconfont-state="false"
              v-if="editState"
            ></datablau-input>
            <p v-else>{{ scope.row.logicalName }}</p>
          </template>
        </el-table-column>
        <el-table-column
          label="关联信息"
          prop="relationShipPhysicalColumnName"
          :min-width="120"
          show-overflow-tooltip
          v-if="isLogical"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.column.remarks')"
          prop="definition"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="typeName"
          :label="$t('meta.DS.tableDetail.column.dataType')"
          show-overflow-tooltip
          :min-width="120"
        ></el-table-column>
        <el-table-column
          prop="key"
          :label="$t('meta.DS.tableDetail.column.keyType')"
          show-overflow-tooltip
          :min-width="80"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.column.domain')"
          show-overflow-tooltip
          v-if="$featureMap['FE_DOMAIN']"
          :min-width="120"
        >
          <template slot-scope="scope">
            <datablau-tooltip
              :content="
                scope.row.domains[0] && scope.row.domains[0].state === 'X'
                  ? '已废弃'
                  : ''
              "
              placement="bottom-start"
              :disabled="
                !(scope.row.domains[0] && scope.row.domains[0].state === 'X')
              "
            >
              <datablau-link
                :class="{
                  XStyle:
                    scope.row.domains[0] && scope.row.domains[0].state === 'X',
                }"
                v-if="
                  Array.isArray(scope.row.domains) &&
                  scope.row.domains.length === 1
                "
                :categoryId="scope.row.domains[0].categoryId"
                :data-type="LDMTypes.Domain"
                :data-object="scope.row.domains[0]"
                :label="scope.row.domains[0].chineseName"
              ></datablau-link>
            </datablau-tooltip>
          </template>
        </el-table-column>
        <!--标准代码-->
        <el-table-column
          :label="$t('meta.DS.tableDetail.column.standardCode')"
          v-if="$featureMap['FE_DOMAIN']"
          prop="domainCode"
          show-overflow-tooltip
          :min-width="120"
        >
          <template slot-scope="scope">
            <datablau-link
              v-if="scope.row.domainCode"
              :data-type="LDMTypes.CODE"
              :data-id="scope.row.domainCode"
              :label="scope.row.domainCode"
              :class="{
                XStyle: scope.row.domainState && scope.row.domainState === 'X',
              }"
            ></datablau-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.column.tag')"
          :min-width="120"
        >
          <template slot-scope="scope">
            <div class="tag-box blue">
              <el-tooltip
                style="margin: 2px"
                v-for="t in scope.row.tags"
                :key="t.id"
                :disabled="!tooltipFormatter(t)"
                :content="tooltipFormatter(t)"
                :open-delay="200"
                placement="top"
              >
                <el-tag size="small">{{ t.name }}</el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('meta.DS.tableDetail.column.notNull')">
          <template slot-scope="scope">
            {{
              scope.row.notNull === false
                ? $t('meta.common.false')
                : $t('meta.common.true')
            }}
          </template>
        </el-table-column>
      </datablau-table>
      <div
        style="
          width: 100%;
          position: absolute;
          bottom: -60px;
          right: 0;
          height: 50px;
          background: #fff;
          border-top: 1px solid #eee;
        "
      >
        <datablau-pagination
          style="margin-top: 10px; text-align: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100, 500]"
          :page-size="pageSize"
          :layout="'total, sizes, prev, pager, next, jumper'"
          :total="totalItems"
          :disabled="editState"
        ></datablau-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import LDMTypes from '@constant/LDMTypes'
export default {
  props: {
    objectId: Number,
    heightValue: Number,
    inSystem: {
      type: Boolean,
      default: false,
    },
    isLogical: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.timeout = setTimeout(() => {
      // if(this.objectId){
      //   this.getColumns();
      // }
    }, 0)
    window.addEventListener('storage', this.onStorageHandle)
  },
  beforeDestroy() {
    clearTimeout(this.timeout)
    window.removeEventListener('storage', this.onStorageHandle)
    localStorage.removeItem('isUpdateDomainCode')
  },
  data() {
    return {
      LDMTypes: LDMTypes,
      loadingColumns: true,
      data: [],
      tableData: null,
      tableDataArr: [],
      shortTableData: [],
      showFullData: false,
      style: {
        headerCellStyle: {
          // backgroundColor:'var(--light-grey)',
          height: '30px',
          color: 'var(--base-font-color)',
          fontSize: '12px',
          padding: '0 0',
        },
        cellStyle: {
          // backgroundColor:'var(--light-grey)',
          // padding:'8px 0',
          // borderLeft:'none',
          // borderRight:'none',
          fontSize: '12px',
        },
        more: {
          height: '40px',
          lineHeight: '40px',
          textAlign: 'center',
        },
      },
      searchKeyword: '',
      currentTag: [],
      tagNames: null,
      editState: false,
      rows: [],
      columnOption: {
        // selectable: true,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
    }
  },
  methods: {
    // 监听storage变化，刷新列表
    onStorageHandle(e) {
      if (e.key === 'isUpdateDomainCode' && e.newValue === 'true') {
        this.getColumns()
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.tableData = this.shortTableData.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      )
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.tableData = this.shortTableData.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      )
    },
    // 编辑中文名
    editColumns() {
      this.editState = true
    },
    // 取消编辑中文名
    cancelEdit() {
      this.editState = false
      this.getColumns()
    },
    // 保存中文名
    saveColumns() {
      this.tableDataArr.forEach(element => {
        this.tableData.forEach(item => {
          if (element.id === item.id) {
            if (element.logicalName !== item.logicalName) {
              this.modifyColumns(item)
            }
          }
        })
      })
      this.editState = false
      Promise.all(this.rows)
        .then()
        .catch()
        .finally(() => {
          this.getColumns()
          this.$emit('getProp')
        })
    },
    modifyColumns(data) {
      const requestUrl = this.$meta_url + `/service/entities/${data.id}/summary`
      const requestBody = {
        id: data.objectId,
        logicalName: data.logicalName,
      }
      if (data.definition) {
        requestBody.definition = data.definition
      }
      this.rows.push(
        new Promise((resolve, reject) => {
          this.$http
            .put(requestUrl, requestBody)
            .then(res => {
              resolve(res)
            })
            .catch(e => {
              reject(e)
            })
        })
      )
    },
    dataTypeFormatter(row) {
      if (!row.typeName) {
        return ''
      }
      const type = row.typeName.toLowerCase()
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
        return row.typeName
      }
    },
    iconHtmlFormat(name) {
      let formatedName = ''
      let color = ''
      let txtColor = ''
      formatedName = name.slice(0, 3).toUpperCase()
      switch (name) {
        case 'time':
          formatedName = 'TIME'
          color = 'rgba(67, 193, 202, 0.1)'
          txtColor = '#43C1CA'
          break
        case 'number':
          color = 'rgba(140, 92, 255, 0.1)'
          txtColor = '#8C5DFE'
          break
        case 'string':
          color = 'rgba(235, 132, 73, 0.1)'
          txtColor = '#EB8449'
          break
        default:
          color = 'rgba(85, 85, 85, 0.1)'
          txtColor = '#777'
          break
      }
      return `<span style="
      color: ${txtColor};background:${color};font-family: PingFangSC-Medium, PingFang SC;width:56px;height:22px;font-size: 14px;line-height:22px;text-align:center;border-radius:2px;display:inline-block;margin-right: 5px;">${formatedName}</span>`
    },
    getColumns() {
      this.$http
        .get(this.$meta_url + '/service/entities/' + this.objectId + '/columns')
        .then(res => {
          localStorage.setItem('isUpdateDomainCode', false)
          res.data.forEach((col, i) => {
            col.key = (function () {
              let ret = ''
              col.keys.forEach(function (val) {
                switch (val.type) {
                  case 'PrimaryKey':
                    ret += ',PK'
                    break
                  case 'ForeignKey':
                    ret += ',FK'
                    break
                  case 'NonUniqueKey':
                    ret += ',NK'
                    break
                  case 'UniqueKey':
                    ret += ',UK'
                    break
                  default:
                    ret += ',未知'
                    break
                }
              })
              return ret.slice(1)
            })()
            this.$utils.sort.sortConsiderChineseNumber(col.tags, 'name')
          })
          this.data = res.data
          this.data.forEach(element => {
            element.typeName = element.type
          })
          this.data.sort((x1, x2) => {
            if (x1.ordinal && x2.ordinal) {
              return x1.ordinal - x2.ordinal
            }
          })
          this.totalItems = res.data.length
          this.shortTableData = this.data
          // this.getAccessibleList(this.data)
          this.tableDataArr = JSON.parse(JSON.stringify(res.data))
          this.filtData()
          this.loadingColumns = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.$emit('loaded')
        })
    },
    /* getAccessibleList(datas) {
      this.$http({
        url: this.$url + '/service/auth/check/batch',
        method: 'post',
        data: datas.map(data => ({
          itemType: 80000005,
          itemId: data.objectId,
        })),
      })
        .then(res => {
          datas.forEach(item => {
            this.$set(item, 'access', res.data[item.objectId])
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, */
    filtData() {
      this.tableData = []
      const keyword = this.searchKeyword.trim().toLowerCase()
      if (this.currentTag && this.currentTag.length > 0) {
        this.shortTableData.forEach(ele => {
          if (ele.tags.length > 0) {
            ele.tags.forEach(tagsItem => {
              this.currentTag.forEach(element => {
                if (
                  element === String(tagsItem.id) &&
                  (ele.physicalName.toLowerCase().includes(keyword) ||
                    (ele.logicalName &&
                      ele.logicalName.toLowerCase().includes(keyword)))
                ) {
                  if (this.tableData.indexOf(ele) === -1) {
                    this.tableData.push(ele)
                  }
                }
              })
            })
          }
        })
        this.totalItems = this.tableData.length
      } else {
        this.tableData = this.shortTableData.filter(
          item =>
            item.physicalName.toLowerCase().includes(keyword) ||
            (item.logicalName &&
              item.logicalName.toLowerCase().includes(keyword))
        )
        this.totalItems = this.tableData.length
      }
      this.currentPage = 1
      let s = this.pageSize
      let c = this.currentPage
      this.tableData = this.tableData.slice(s * (c - 1), s * c)
    },
    callTagSelector() {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.currentTag = keys
          this.tagNames = names
          this.currentPage = 1
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag,
      })
    },
    cancelTagSelect() {
      // TODO
      this.$bus.$emit('shutSelectorDialog')
      this.currentTag = []
      this.tagNames = null
      this.searchKeyword = ''
    },
    handleCloseTag(v, i) {
      // this.currentTag.splice(this.currentTag.indexOf(tag), 1)
      this.currentTag.splice(i, 1)
      this.tagNames.splice(i, 1)
      // this.getData()
    },
    handleExpand() {
      this.showFullData = true
      this.tableData = this.data
      /* setTimeout(()=>{
          this.draw();
        }); */
      this.$emit('height-update')
    },
    handleCollapse() {
      this.showFullData = false
      this.tableData = this.shortTableData
      this.$emit('height-update')
    },
    tooltipFormatter(tag) {
      if (tag.properties) {
        return JSON.parse(tag.properties).description
      } else {
        return ''
      }
    },
    jumpToColumn(object) {
      localStorage.setItem('isUpdateDomainCode', false)
      this.$bus.$emit('jumpToObject', {
        type: 'COLUMN',
        object: object,
        isAssets: this.$route.query.isAssets,
      })
    },
  },
  watch: {
    editState(value) {
      this.$emit('getEditState', value)
    },
    searchKeyword() {
      this.filtData()
    },
    currentTag() {
      this.filtData()
      if (this.currentTag.length === 0) {
        this.$bus.$emit('shutSelectorDialog')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.el-input--small .el-input__inner {
  height: 30px;
  line-height: 30px;
}
// .el-table--border, .el-table--group{
//   border-left: none;
//   border-right: none;
// }
.XStyle {
  .popBase {
    text-decoration: line-through;
  }
}
</style>
