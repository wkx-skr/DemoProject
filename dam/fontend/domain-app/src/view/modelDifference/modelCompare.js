require('@/assets/styles/base.css')
require('@/assets/styles/base.scss')
require('@/assets/styles/table.scss')
require('@/assets/styles/page.scss')
require('@/assets/styles/list.scss')
export default {
  data() {
    return {
      data: {},
      treeLoading: false,
      businessData: [],
      businessDefaultProps: {
        label: 'name',
        id: 'name',
        children: 'differences',
      },
      itemData: {},
      tableData: [],
      keyword: '',
      type: undefined,
      modelId: undefined,
      versionId: undefined,
      requestUrl: '',
    }
  },
  watch: {
    keyword(value) {
      this.$refs.tree1.filter(value)
    },
  },
  mounted() {
    console.log(this.$route.query)
    this.modelId = this.$route.query.modelId
    if (this.$route.query.type == 'history') {
      this.versionId = this.$route.query.version
      this.requestUrl =
        this.$url +
        '/service/models/' +
        this.modelId +
        '/version/' +
        this.versionId +
        '/delta'
    } else {
      this.requestUrl =
        this.$url + '/service/models/' + this.modelId + '/compareResult'
    }

    this.getData()
  },
  methods: {
    getData() {
      this.$http
        .get(this.requestUrl)
        .then(res => {
          this.data = res.data
          this.businessData = this.data
          this.tableData = [this.data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleNodeClick(data) {},
    handleExpandChange(row, expandedRows) {
      console.log(row)
      let isOpen = false
      for (let i = 0; i < expandedRows.length; i++) {
        if (row == expandedRows[i]) {
          isOpen = true
          break
        }
      }
      if (isOpen) {
      } else {
      }
    },
    renderContent(h, { node, data, store }) {
      if (data.name == 'Entity') {
        return (
          <div class="tree-item">
            <span class="tree-icon entity"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else if (data.name == 'Relationship') {
        return (
          <div class="tree-item">
            <span class="tree-icon relationship"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else if (data.name == 'Attribute') {
        return (
          <div class="tree-item">
            <span class="tree-icon attribute"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else if (data.name == 'KeyGroup') {
        return (
          <div class="tree-item">
            <span class="tree-icon keygroup"></span>
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      } else {
        return (
          <div class="tree-item">
            <span>{node.label}</span>
            <span class="right">
              {data.rightObject ? data.rightObject : data.rightValue}&nbsp;
            </span>
            <span class="left">
              {data.leftObject ? data.leftObject : data.leftValue}
            </span>
          </div>
        )
      }
    },
    filterNode(value, data) {
      if (!value) return true
      if (!data.name) return false
      return (
        false ||
        //          (data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1)
        (data.leftObject &&
          data.leftObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.leftValue &&
          data.leftValue.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.rightObject &&
          data.rightObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.rightValue &&
          data.rightValue.toLowerCase().indexOf(value.toLowerCase()) !== -1)
      )
    },
  },
}
