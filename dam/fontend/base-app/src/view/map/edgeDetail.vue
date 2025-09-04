<template>
  <div v-if="loaded" :key="lineageKey">
    <div class="map-detail">
      <div
        class="map-title oneline-eclipse"
        :title="
          $modelCategoriesMap[detail.cat.from] +
          ' >> ' +
          $modelCategoriesMap[detail.cat.to]
        "
      >
        {{ $modelCategoriesMap[detail.cat.from] }}
        <i class="fa fa-arrow-right"></i>
        {{ $modelCategoriesMap[detail.cat.to] }}
      </div>
      <div class="list-box" style="top: 80px">
        <el-tabs v-model="activeName">
          <el-tab-pane :label="$t('meta.map.call')" name="call"></el-tab-pane>
          <el-tab-pane
            :label="$t('meta.map.lineage')"
            name="lineage"
            v-if="!callOnly"
          ></el-tab-pane>
        </el-tabs>
        <div class="list-content">
          <el-table
            v-if="activeName === 'call'"
            :data="detail.call"
            tooltip-effect="light"
            :height="tableHeight"
          >
            <el-table-column :width="9"></el-table-column>
            <el-table-column label="#" :width="37">
              <template slot-scope="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column
              prop="callType"
              :width="80"
              :label="$t('meta.map.callType')"
              :formatter="callTypeFormat"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="calleeModelName"
              :label="$t('meta.map.dbName')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="resourceName"
              :label="$t('meta.map.resourceName')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="description"
              :label="$t('meta.map.description')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span v-if="scope.row.description">
                  {{ scope.row.description.slice(0, 500) }}
                  <span v-if="scope.row.description.length > 500">...</span>
                </span>
              </template>
            </el-table-column>
          </el-table>
          <el-table
            v-if="activeName === 'lineage'"
            :data="detail.lineage"
            tooltip-effect="light"
            :height="tableHeight"
            @row-click="handleRowClick"
          >
            <el-table-column width="10"></el-table-column>
            <el-table-column label="#" :width="37">
              <template slot-scope="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column
              prop="from.model"
              :label="$t('meta.map.sourceModel')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="from.tab"
              :label="$t('meta.map.sourceTable')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="to.model"
              :label="$t('meta.map.targetModel')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="to.tab"
              :label="$t('meta.map.targetTable')"
              show-overflow-tooltip
            ></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'systemDetail',
  props: ['rawData'],
  data() {
    return {
      edges: [],
      id: undefined,
      detail: {
        call: [],
        lineage: [],
      },
      loaded: false,
      lineageKey: 0,
      apiKey: 0,
      activeName: 'call',
      tableHeight: 100,
      callOnly: false,
      callTypeMap: {},
      callTypeArr: [
        {
          value: 'DB_LINK',
          label: 'DB link',
          desc: this.$t('meta.interface.callType.dbLinkDesc'),
        },
        {
          value: 'FILE_TRANSFER',
          label: this.$t('meta.interface.callType.changeFile'),
          desc: this.$t('meta.interface.callType.changeFileDesc'),
        },
        {
          value: 'DIRECT',
          label: 'Direct',
          desc: this.$t('meta.interface.callType.directDesc'),
        },
        {
          value: 'MESSAGE',
          label: this.$t('meta.interface.callType.msg'),
          desc: this.$t('meta.interface.callType.msgDesc'),
        },
        {
          value: 'API',
          label: 'API',
          desc: this.$t('meta.interface.callType.apiDesc'),
        },
      ],
    }
  },
  mounted() {
    this.getCallTypeMap()
    this.edges = this.rawData.edges
    this.id = this.rawData.id
    this.callOnly = this.rawData.callOnly
    this.handleEdges()
    $(window).resize(this.resizeTable)
  },
  beforeDestroy() {
    $(window).unbind('resize')
  },
  watch: {
    activeName() {
      Ps.destroy($('.el-table__body-wrapper')[0])
      this.initResizeTable()
    },
  },
  methods: {
    initResizeTable() {
      this.tableHeight = $('.list-content')[0].offsetHeight
      setTimeout(() => {
        Ps.initialize($('.el-table__body-wrapper')[0])
      })
    },
    resizeTable() {
      this.tableHeight = $('.list-content')[0].offsetHeight
      setTimeout(() => {
        Ps.update($('.el-table__body-wrapper')[0])
      })
    },
    handleEdges() {
      const id = this.id
      this.edges.forEach(item => {
        if (item.id === id) {
          let from = item.from
          if (from.toString().indexOf('c') === 0) {
            from = from.toString().substring(1)
          }
          let to = item.to
          if (to.toString().indexOf('c') === 0) {
            to = to.toString().substring(1)
          }
          this.detail.cat = {
            from: from,
            to: to,
          }
          if (item.type === 'lineage' || item.type === 'both') {
            this.getTableLineage(from, to)
          } else {
            this.detail.lineage = []
          }
          if (item.type === 'call' || item.type === 'both') {
            this.getCall(from, to)
          } else {
            this.detail.call = []
          }
        }
      })
      this.loaded = true
    },
    getTableLineage(catId, catId2) {
      let requestUrl = this.$meta_url + '/lineage/relationships?catId=' + catId
      if (catId2) {
        requestUrl += '&targetCatId=' + catId2
      }
      this.$http.get(requestUrl).then(res => {
        this.detail.lineage = []
        const lineage = this.detail.lineage
        const data = res.data
        const endpoints = data.endpoints
        const relationships = data.relationships
        relationships.forEach(r => {
          lineage.push({
            from: endpoints[r.first],
            to: endpoints[r.second],
          })
        })
        this.resizeTable()
        this.lineageKey++
      })
    },
    getCall(from, to) {
      const requestUrl = this.$meta_url + '/service/systemcall/search'
      const requestBody = {
        pageSize: 500,
        currentPage: 0,
        srcModelCategoryIds: [to],
        dstModelCategoryIds: [from],
      }
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {
          this.detail.call = res.data.content
          this.initResizeTable()
          this.lineageKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRowClick(row) {
      this.$emit('row-click', {
        objectId: row.from.tabId,
        physicalName: row.from.tab,
      })
    },
    getCallTypeMap() {
      this.callTypeMap = {}
      this.callTypeArr.forEach(item => {
        this.callTypeMap[item.value] = item
      })
    },
    callTypeFormat(row, column, cellValue) {
      return this.callTypeMap[cellValue]
        ? this.callTypeMap[cellValue].label
        : cellValue
    },
  },
}
</script>

<style scoped lang="scss">
.label {
  width: 5em !important;
}
.category-detail {
  height: (128+25) px;
  padding: 25px 20px;
  color: #ccc;
  h2 {
    font-size: 16px;
    color: #fff;
    font-weight: normal;
  }
  p {
    color: #ccc;
    margin-top: 1em;
    text-align: justify;
    line-height: 1.5em;
  }
  .item {
    font-size: 14px;
    margin-top: 1em;
    line-height: 1.5em;
    .label {
      display: inline-block;
      font-weight: bold;
      width: 5em;
      text-align: right;
    }
    .detail {
      margin-left: 0.5em;
      display: inline-block;
      vertical-align: top;
    }
  }
}
</style>
