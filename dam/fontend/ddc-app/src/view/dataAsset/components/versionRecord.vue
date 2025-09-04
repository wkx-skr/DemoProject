<template>
  <div style="position: absolute; top: 0px; bottom: 0; left: 0px; right: 0px">
    <datablau-form-submit>
      <datablau-table
        :data="tableData"
        :show-column-selection="false"
        :loading="loading"
      >
        <el-table-column
          :label="$t('assets.version.numberText')"
          :min-width="80"
          prop="version"
        ></el-table-column>
        <el-table-column
          :label="$t('assets.version.contentText')"
          :min-width="400"
          prop="content"
        ></el-table-column>
        <el-table-column
          :label="$t('assets.version.operatorText')"
          prop="changer"
          :min-width="80"
        ></el-table-column>
        <el-table-column
          :label="$t('assets.version.timeText')"
          prop="time"
          :min-width="100"
        ></el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          class="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pagination.pageNum"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, jumper, next"
          :total="pagination.total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import api from '../utils/api'
export default {
  name: 'VersionRecord',
  props: {
    catalogId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      tableData: [{}],
      pagination: {
        pageNum: 0,
        pageSize: 10,
        total: 0,
      },
      keyMap: {
        directoryStructure: this.$t('assets.version.directoryStructure'),
        catalogType: this.$t('assets.version.catalogType'),
        catalogPath: this.$t('assets.version.catalogPath'),
        catalogCode: this.$t('assets.version.catalogCode'),
        catalogName: this.$t('assets.version.catalogName'),
        abbreviation: this.$t('assets.version.abbreviation'),
        department: this.$t('assets.version.department'),
        approverName: this.$t('assets.version.approverName'),
        dataManager: this.$t('assets.version.dataManager'),
        catalogKeywords: this.$t('assets.version.catalogKeywords'),
        describe: this.$t('assets.version.describe'),
        catalogExtensions: this.$t('assets.version.catalogExtensions'),
        applyReason: this.$t('assets.version.applyReason'),
        reason: this.$t('assets.version.reason'),
        applyType: this.$t('assets.version.applyType'),
      },
      loading: false,
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords(params) {
      this.loading = true
      const queryParams = {
        ...this.pagination,
        catalogId: this.catalogId,
        ...params,
      }
      api
        .getCatalogVersions(queryParams)
        .then(res => {
          this.tableData = (res.data.data.content || []).map(item => {
            // console.log(item)
            const { changeTime, content } = item
            const parsedContent = this.handleRecordContent(content)
            return {
              ...item,
              time: changeTime.slice(0, 10) + ' ' + changeTime.slice(11, -4),
              content: Array.from(parsedContent.keys())
                .map(key => `${key} : ${parsedContent.get(key) || ''}`)
                .filter(item => !!item)
                .join('，'),
            }
          })
          this.pagination = {
            total: res.data.data.totalElements || 0,
            pageNum: queryParams.pageNum,
            pageSize: queryParams.pageSize,
          }
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          this.$blauShowFailure(error)
        })
    },
    // 处理版本内容
    handleRecordContent(content) {
      content = JSON.parse(content)
      content = content.newCatalogData
        ? {
            ...JSON.parse(content.newCatalogData),
            changeReason: content.changeReason,
            versionType: content.versionType,
          }
        : content
      // 最终展示结果 result
      const rs = new Map()
      const typeMap = {
        PUBLISHED: this.$t('assets.version.publish'),
        CHANGE: this.$t('assets.version.change'),
      }
      // 解析 keyMap，使得展示结果的属性顺序保持一致
      Object.keys(this.keyMap).forEach(key => {
        if (key === 'catalogExtensions') {
          if (content.catalogExtensions) {
            // 变更时，上面 JSON.parse 之后，catalogExtension 已经是数组了
            // 发布时，catalogExtension 是 JSON 串，需进行解析
            const extendProps =
              typeof content.catalogExtensions === 'string'
                ? JSON.parse(content.catalogExtensions || '')
                : content.catalogExtensions
            // console.log(extendProps)
            // 如果 extendProps 是数组类型，进行遍历，并将遍历的处理结果加到最终结果 rs 中
            if (extendProps instanceof Array) {
              extendProps.forEach(extend => {
                rs.set(extend.proName, extend.proValue || '-')
              })
            }
          }
        } else if (key === 'reason' || key === 'applyReason') {
          // 如果接口返回结果中有changeReason，则展示变更原因，否则展示申请原因
          rs.set(
            this.$t('assets.version.reason'),
            content.changeReason || content.reason
          )
        } else if (key === 'applyType') {
          rs.set(
            typeMap[content.versionType]
              ? typeMap[content.versionType] + this.$t('assets.version.way')
              : this.$t('assets.version.applyType'),
            content.applyType
          )
        } else {
          rs.set(this.keyMap[key], content[key] || '-')
        }
      })
      return rs
    },
    formatStatus(status) {
      let text
      switch (status) {
        case 'PUBLISHED':
          text = this.$t('assets.version.publishedText')
          break
        case 'UNPUBLISHED':
          text = this.$t('assets.version.unpublishText')
          break
        case 'UNDER_REVIEW':
          text = this.$t('assets.version.reviewText')
          break
        case 'OFFLINE':
          text = this.$t('assets.version.offlineText')
          break
        default:
          break
      }
      return text
    },
    handleSizeChange(size) {
      this.getRecords({
        pageNum: 1,
        pageSize: size,
      })
    },
    handleCurrentChange(page) {
      this.getRecords({
        pageNum: page,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.content-pagination {
  position: absolute;
  right: 0px;
  bottom: 0;
  left: 0px;
  height: 50px;
  padding-top: 9px;
  padding-left: 20px;
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .datablau-pagination {
    float: right;
  }
}
</style>
