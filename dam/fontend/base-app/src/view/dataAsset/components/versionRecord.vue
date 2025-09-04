<template>
  <div style="position: absolute; top: 0px; bottom: 0; left: 20px; right: 20px">
    <datablau-form-submit>
      <datablau-table :data="tableData" :show-column-selection="false">
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
        <!-- <el-table-column
          :label="$t('assets.version.approverText')"
          prop="approver"
          :min-width="100"
        ></el-table-column> -->
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
          :page-sizes="[10, 20, 50]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
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
      tableData: [],
      pagination: {
        pageNum: 0,
        pageSize: 10,
        total: 0,
      },
      keyMap: {
        catalogName: '目录名称',
        catalogType: '目录类型',
        catalogPath: '目录路径',
        catalogKeywords: '关键词',
        applyReason: '申请原因',
        department: '数据权属',
        shareType: '可访问者',
        toStatus: '当前状态',
        editablePerson: '可编辑者',
        abbreviation: '英文简称',
        directoryStructure: '目录空间',
        describe: '描述',
        dataSteward: '数据管家',
        catalogExtensions: '扩展属性',
      },
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords(params) {
      const queryParams = {
        ...this.pagination,
        catalogId: this.catalogId,
        ...params,
      }
      api.getCatalogVersions(queryParams).then(res => {
        this.tableData = (res.data.data.content || []).map(item => {
          // console.log(item)
          const { changeTime, content } = item
          const parsedContent = this.handleRecordContent(content)
          return {
            ...item,
            time:
              changeTime.slice(0, 3).join('-') +
              ' ' +
              changeTime.slice(3, 6).join(':'),
            // content: JSON.parse(content),
            content: Object.keys(parsedContent)
              .map(key => `${key} : ${parsedContent[key]}`)
              .join('，'),
          }
        })
        this.pagination = {
          total: res.data.data.totalElements || 0,
          pageNum: queryParams.pageNum,
          pageSize: queryParams.pageSize,
        }
      })
    },
    handleRecordContent(content) {
      content = JSON.parse(content)
      content = content.newCatalogData
        ? JSON.parse(content.newCatalogData)
        : content
      const rs = {}
      Object.keys(content).forEach(key => {
        if (this.keyMap[key]) {
          if (key === 'toStatus') {
            rs[this.keyMap[key]] = this.formatStatus(content[key])
          } else if (key === 'catalogExtensions') {
            rs[this.keyMap[key]] = content[key]
              .map(item => `${item.proName}: ${item.proValue}`)
              .join(',')
          } else if (content[key]) {
            rs[this.keyMap[key]] = content[key] || ''
          }
        }
      })
      return rs
    },
    formatStatus(status) {
      let text
      switch (status) {
        case 'PUBLISHED':
          text = this.$t('assets.common.publishedText')
          break
        case 'UNPUBLISHED':
          text = this.$t('assets.common.unpublishText')
          break
        case 'UNDER_REVIEW':
          text = this.$t('assets.common.reviewText')
          break
        case 'OFFLINE':
          text = this.$t('assets.common.offlineText')
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
