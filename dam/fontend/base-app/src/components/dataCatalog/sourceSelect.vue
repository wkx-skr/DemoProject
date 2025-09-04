<template>
  <div class="source-select-outer">
    <datablau-input
      class="keyword-input"
      :placeholder="$t('common.placeholder.normal')"
      size="mini"
      v-model="keyword"
      clearable
    ></datablau-input>
    <div class="source-tree-outer">
      <datablau-tree
        class="light-blue-tree"
        ref="sourceTree"
        :data="sourceData"
        node-key="id"
        :show-checkbox="showCheckbox1"
        :default-expand-all="autoExpand"
        @node-click="sourceUpdated"
        :filter-node-method="filterNode"
        :render-content="renderContent"
      ></datablau-tree>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sourceData: [],
      keyword: '',
      showCheckbox1: false,
    }
  },
  props: ['showCheckbox'],
  mounted() {
    if (!this.showCheckbox) {
      this.showCheckbox1 = false
    } else {
      this.showCheckbox1 = this.showCheckbox
    }
    const self = this
    this.getSourceData()
    if (this.showCheckbox) {
      this.$parent.$refs.sourceTree = this.$refs.sourceTree
      this.$parent.$parent.$refs.sourceTree = this.$refs.sourceTree
    }
  },
  watch: {
    keyword(value) {
      this.$refs.sourceTree.filter(value)
    },
  },
  computed: {
    autoExpand() {
      return true
      //				return Boolean(this.keyword.length)
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },
    renderContent(h, { node, data, store }) {
      if (data.type == 'model') {
        return (
          <span
            style="flex: 1; display: flex;align-items: center;"
            data-code={data.code}
          >
            <span
              class="iconfont icon-shujuyuan"
              style="margin-right:8px"
            ></span>
            <span oneline-eclipse>{node.label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="iconfont icon-file" style="margin-right:8px">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span oneline-eclipse>{node.label}</span>
          </span>
        )
      }
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
              type: 'model',
            })
          })
          result.forEach((item, index) => {
            self.sourceData.push({
              label: resultType[index],
              id: resultType[index],
              children: item,
            })
          })
          self.sourceData.unshift({
            label: self.$version.dataCatalog.allSources,
            id: null,
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    sourceUpdated(data) {
      if (this.showCheckbox === true) {
        return
      }
      this.$parent.checkedSourcesDetail = data
      this.$parent.$parent.checkedSourcesDetail = data
      if (typeof data.id === 'number') {
        this.$parent.checkedSources = data.id
        this.$parent.$parent.checkedSources = data.id
      } else if (data.id == null) {
        this.$parent.checkedSources = null
        this.$parent.$parent.checkedSources = null
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.source-tree-outer {
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}
.keyword-input {
  width: 93%;
  display: block;
  margin: 0 auto;
}
</style>
