<template>
  <div class="menu-source">
    <div class="source-title">数据源选择</div>
    <div class="source-selected-labels">{{ displayString }}</div>
    <el-input
      class="keyword-input"
      placeholder="输入关键字"
      size="small"
      v-model="keyword"
    ></el-input>

    <div class="source-tree-outer">
      <el-tree
        ref="sourceTree"
        :key="cal"
        :data="data.sourceData"
        node-key="id"
        show-checkbox
        :default-expand-all="autoExpand"
        :filter-node-method="filterNode"
        @check-change="handleCheckChange"
      ></el-tree>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: { sourceData: [] },
      keyword: '',
      cal: 0,
      checkedSource: [],
      interval1: null,
    }
  },
  mounted() {
    this.getSourceData()
  },
  watch: {
    keyword(value) {
      if (!value) this.cal++
      this.$refs.sourceTree.filter(value)
    },
  },
  computed: {
    autoExpand() {
      return Boolean(this.keyword.length)
    },
    displayString() {
      const arr = this.checkedSource
      let rtn = ''
      arr.forEach(item => {
        if (!isNaN(item.id)) {
          rtn += item.label + ','
        }
      })
      return rtn.substr(0, rtn.length - 1)
    },
  },
  methods: {
    handleCheckChange() {
      const self = this
      clearInterval(this.interval1)
      this.interval1 = setTimeout(() => {
        self.checkedSource = this.$refs.sourceTree.getCheckedNodes()
        const checkedIds = []
        self.checkedSource.forEach(item => {
          if (!isNaN(item.id)) {
            checkedIds.push(item.id)
          }
        })
        self.$bus.$emit('termRecognizerJob--dataSource', checkedIds)
      }, 0)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    renderContent(h, { node, data, store }) {
      return (
        <span class="test">
          <span>
            <span>{node.label}</span>
          </span>
        </span>
      )
    },

    getSourceData() {
      const self = this
      this.$http
        .get(this.$url + '/service/entities/models')
        .then(res => {
          var resultType = []
          var result = []
          res.data.forEach(item => {
            switch (item.type) {
              case 'ORACLE':
                item.type = 'Oracle'
                break
              case 'MYSQL':
                item.type = 'MySQL'
                break
              case 'SQLSERVER':
                item.type = 'SQL Server'
                break
              case 'POSTGRESQL':
                item.type = 'PostgreSQL'
                break
              case 'MART':
                item.type = 'Mart'
                break
              case 'HIVE':
                item.type = 'Hive'
                break
              case 'MONGODB':
                item.type = 'MongoDB'
                break
              case 'JSON':
                item.type = 'Json'
                break
              case 'CSV':
                item.type = 'CSV'
                break
              case 'EXCEL':
                item.type = 'Excel'
                break
              case 'ERWIN':
                item.type = 'Erwin'
                break
              case 'POWERDESIGNER':
                item.type = 'Power Designer'
                break
              case 'DB2':
                item.type = 'DB2'
                break
              case 'DATADICTIONARY':
                item.type = '数据字典'
                break
            }
          })
          res.data.forEach(item => {
            var i = resultType.indexOf(item.type)
            if (i == -1) {
              resultType.push(item.type)
              i = resultType.length - 1
              result[i] = []
            }
            result[i].push({
              label: item.definition,
              id: item.modelId,
            })
          })
          result.forEach((item, index) => {
            self.data.sourceData.push({
              label: resultType[index],
              id: resultType[index],
              children: item,
            })
          })
        })
        .catch(err => {
          self.$notify.error({
            title: '错误',
            message: '读取数据源列表失败',
          })
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.source-selected-labels {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
