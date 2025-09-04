<template>
  <div class="table-form-box">
    <div class="apply-reason" v-if="formData.reason || formData.applyReason">
      <div class="reason-title">
        <span class="iconfont icon-change change-icon"></span>
        <span class="change-text">{{ $t('userPane.myTodo.applyReason') }}</span>
      </div>
      <div class="reason-content">
        <is-show-tooltip
          :content="
            formData.reason ? formData.reason.value : formData.applyReason.value
          "
        ></is-show-tooltip>
      </div>
    </div>

    <div class="table-box">
      <datablau-form-submit>
        <datablau-table
          :data="tableFormData"
          height="100%"
          v-loading="tableFormLoading"
        >
          <el-table-column
            prop="assetsName"
            min-width="120"
            :label="$t('userPane.myTodo.assetsName')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="assetsCode"
            min-width="120"
            :label="$t('userPane.myTodo.assetsCode')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            v-if="$featureMap.FE_SECURITY"
            prop="securityLevel"
            min-width="135"
            :label="$t('userPane.myTodo.securityLevel')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="assetsType"
            min-width="120"
            :label="$t('userPane.myTodo.assetsType')"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div
                class="type-class"
                v-if="scope.row.assetsType !== 'METAMODEL_OBJECT'"
                :style="getAssetsType(scope.row.assetsType, 2)"
              >
                {{ getAssetsType(scope.row.assetsType, 1) }}
              </div>
              <div
                class="type-class"
                v-else
                :style="getAssetsType2(scope.row, 2)"
              >
                {{ getAssetsType2(scope.row, 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="source"
            min-width="100"
            :label="$t('userPane.myTodo.source')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="catalogPath"
            min-width="150"
            :label="$t('userPane.myTodo.catalogPath')"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="deptName"
            min-width="120"
            :label="$t('userPane.myTodo.deptName')"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
        <div class="table-form-btn" slot="buttons">
          <datablau-pagination
            @current-change="handlePageChange"
            @size-change="handleAssetSizeChange"
            :current-page.sync="tableFormParams.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="tableFormParams.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="formTotal"
            class="page"
          ></datablau-pagination>
        </div>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'AssetsInfo',
  components: { IsShowTooltip },
  props: {
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
    commonData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      formData: {},
      tableFormData: [],
      formTotal: 0,
      tableFormLoading: false,
      tableFormParams: {
        pageNum: 1,
        pageSize: 10,
      },
      allList: [],
    }
  },
  watch: {
    getDetailData: {
      handler(data) {
        if (data) {
          // 资产发布为批量发布
          this.getList(this.commonData.processInstanceId)
          const formDtos = this.handleAssetsProcessAttr(data.formDtos)
          const formData = {}
          formDtos.forEach(item => {
            formData[item.code] = item
          })
          this.formData = formData
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.getAllList()
  },
  methods: {
    getAllList() {
      this.$http
        .post(`/metadata/mm/getAllList`, {
          filterLdmModel: true,
          onlyM1Element: true,
        })
        .then(res => {
          this.allList = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    // 数据资产发布/数据资产下线 展示的属性
    handleAssetsProcessAttr(formDtos) {
      const defaultAttrKeys = ['reason']
      const attrs = []
      defaultAttrKeys.forEach(key => {
        const target = formDtos.find(item => item.code === key)
        if (target) {
          attrs.push({
            ...target,
            readable: true,
          })
        }
      })
      return attrs
    },
    handleAssetSizeChange(val) {
      this.tableFormParams.pageSize = val
      this.tableFormParams.pageNum = 1
      this.getList(this.commonData.processInstanceId)
    },
    handlePageChange(val) {
      this.tableFormParams.pageNum = val
      this.getList(this.commonData.processInstanceId)
    },
    getList(processInstance) {
      this.tableFormLoading = true
      this.$http
        .get(
          `/assets/workflow/assets/list/${processInstance}/${this.tableFormParams.pageNum}/${this.tableFormParams.pageSize}`
        )
        .then(res1 => {
          this.tableFormLoading = false
          this.formTotal = res1.data.data.totalElements
          this.tableFormData = res1.data.data.content.map(item => {
            const { assetsType } = item
            let name = ''
            switch (assetsType) {
              case 'TABLE':
              case 'DATA_OBJECT':
              case 'VIEW':
                name =
                  item.assetsName + (item.alias ? '(' + item.alias + ')' : '')
                break
              case 'DATA_STANDARD':
              case 'DATA_STANDARD_CODE':
              case 'INDEX':
                name =
                  item.assetsName + (item.alias ? '(' + item.alias + ')' : '')
                break

              default:
                name = item.assetsName
                break
            }
            return { ...item, assetsName: name }
          })
        })
    },
    transState(type) {
      if (type === 'UNPUBLISHED') {
        return '未发布'
      } else if (type === 'UNDER_REVIEW') {
        return '审核中'
      } else if (type === 'PUBLISHED') {
        return '已发布'
      } else if (type === 'OFFLINE') {
        return '已下线'
      } else {
        return '未发布'
      }
    },
    getAssetsType(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type) {
        case 'DATA_COLLECTION':
        case 'TABLE':
          result = this.$t('assets.assetList.dataSheet')
          color = '#3295f8'
          rgba = '(50,149,248,0.1)'
          iconType = 'TABLE'
          break
        case 'VIEW':
          result = this.$t('assets.assetList.view')
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          iconType = 'view'
          break
        case 'METAMODEL_OBJECT':
          result = '自定义对象'
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          iconType = 'view'
          break
        case 'DATA_OBJECT':
          result = this.$t('assets.assetList.dataItem')
          color = '#c44ad1'
          rgba = '(196,74,209,0.1)'
          iconType = 'COLUMN'
          break
        case 'DATA_STANDARD':
          result = this.$t('assets.assetList.dataStandard')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
          iconType = 'DOMAIN'
          break
        case 'DATA_STANDARD_CODE':
          result = this.$t('assets.assetList.standardCode')
          color = '#9D5B8B'
          rgba = '(157,91,139,0.1)'
          iconType = 'daima'
          break
        case 'INDEX':
          result = this.$t('assets.assetList.dataIndicators')
          color = '#d1af3e'
          rgba = '(209,175,62,0.1)'
          iconType = 'domain_code'
          break
        case 'REPORT':
          result = this.$t('assets.assetList.dataReport')
          color = '#008899'
          rgba = '(0,136,153,0.1)'
          iconType = 'Report'
          break
        case 'FILE':
          result = this.$t('assets.assetList.file')
          color = '#3397ff'
          rgba = '(51,151,255,0.1)'
          iconType = data.fileType ? data.fileType : 'file'
          break
        case 'DATA_SERVICE':
          result = this.$t('assets.assetList.dataService')
          color = '#35bae6'
          rgba = '(53,186,230,0.1)'
          iconType = 'service'
          break
        default:
          break
      }
      if (num === 1) {
        return result
      }
      if (num === 2) {
        const style = {
          color: color,
          background: 'rgba' + rgba,
          textAlign: 'center',
        }
        return style
      }
      if (num === 3) {
        return iconType
      }
    },
    getAssetsType2(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type.assetsType) {
        case 'METAMODEL_OBJECT':
          result = this.allList.filter(item => item.id === type.assetsTypeId)[0]
            ?.chineseName
          iconType = data.assetsType
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          break
        default:
          break
      }
      if (num === 1) {
        return result
      }
      if (num === 2) {
        const style = {
          color: color,
          background: 'rgba' + rgba,
          textAlign: 'center',
        }
        return style
      }
      if (num === 3) {
        return iconType
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.apply-reason {
  height: 32px;
  line-height: 32px;
  margin-top: 10px;
  margin-bottom: 10px;
  .reason-title {
    float: left;
    padding-left: 7px;
    background-color: rgba(64, 158, 255, 0.1);
    // width: 80px;
    font-size: 12px;
    color: #555;
    font-weight: 500;
    &:after {
      content: '';
      width: 0px;
      height: 0px;
      border-top: 16px solid transparent;
      border-bottom: 16px solid transparent;
      border-left: 16px solid rgba(64, 158, 255, 0.1);
      position: absolute;
      top: 9px;
      // left: 80px;
    }
    .change-icon {
      font-size: 16px;
      color: #409eff;
      line-height: 32px;
      float: left;
    }
    .change-text {
      display: inline-block;
      line-height: 32px;
      margin-left: 7px;
    }
  }
  .reason-content {
    float: left;
    margin-left: 20px;
    width: calc(100% - 170px);
  }
}
.table-box {
  position: absolute;
  top: 40px;
  left: -20px;
  right: -20px;
  bottom: 0px;
  /deep/ .db-table {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
