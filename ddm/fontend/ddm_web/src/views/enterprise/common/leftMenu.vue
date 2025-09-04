<template>
  <div class="enterLeft">
    <div class="treeBox">
      <div class="muluBox">
        <span>数据架构目录浏览</span>
        <i class="el-icon-refresh" @click="categoryTree"></i>
      </div>
      <datablau-tree
        v-loading="loading"
        ref="treeList"
        :data="menu"
        node-key="id"
        default-expand-all
        highlight-current
        draggable
        :props="defaultProps"
        :use-default-sort="false"
        :data-supervise="true"
        :data-options-function="dataOptionsFunction"
        :allow-drop="drog"
        @node-click="nodeClick"
        @node-drag-end="handleDragEnd"
        :expand-on-click-node="false"
        :data-icon-function="dataIconFunction"
      >
<!--:render-content="renderContent"-->
      </datablau-tree>

    </div>
    <Dialog :flag="flag" :title="title" :from="from" @save="save" @cancel="cancel"></Dialog>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import Dialog from '../component/dialog'
export default {
  components: { Dialog },
  props: {},
  data () {
    return {
      menu: [],
      show: false,
      left: 0,
      tops: 0,
      menuEdit: {},
      flag: false,
      from: {
        name: '',
        alias: '',
        description: ''
      },
      defaultProps: {
        label: 'name',
        children: 'child',
        id: 'id'
      },
      title: '编辑',
      delBut: true,
      addBut: true,
      loading: true,
      drag: true,
      version: '' // 版本
    }
  },
  watch: {},
  computed: {},
  methods: {
    dataIconFunction (data, node) {
      data.level = node.level
      switch (data.level) {
        case 1 : return 'icon architecture'
        case 2 : return 'icon area'
        case 3 : return 'icon theme'
      }
    },
    renderContent (h, { node, data, store }) {
      // console.log(node, data)
    },
    dataOptionsFunction (data) {
      const options = []
      this.menuEdit = data
      let bianji = {
        icon: 'iconfont icon-bianji',
        label: '编辑',
        callback: () => {
          data.label = '编辑'
          this.menuClick(data)
        },
        args: 'folder'
      }
      let deleteObj = {
        icon: 'iconfont icon-delete',
        label: '删除',
        callback: () => {
          data.label = '删除'
          this.menuClick(data)
        },
        args: 'folder'
      }
      let tianjia = {
        icon: 'iconfont icon-tianjia',
        label: '添加子主题',
        callback: () => {
          data.label = '添加子主题'
          this.menuClick(data)
        },
        args: 'folder'
      }
      let ary = []
      if (data.level === 1 || (data.level === 2 && data.children.length !== 0)) {
        ary = [tianjia, bianji]
      } else if (data.level >= 3) {
        ary = [bianji, deleteObj]
      } else {
        ary = [tianjia, bianji, deleteObj]
      }
      options.push(...ary)
      return options
    },
    // 左侧菜单
    categoryTree () {
      this.loading = true
      this.$bus.$off('update').$on('update', res => {
        this.menuFilter(res)
        this.$nextTick(() => {
          this.$refs.treeList.setCurrentKey(res[0].id)
        })
        // console.log(res[0], 'levelChange1')
        this.$bus.$emit('showTopData', res[0])
        this.$bus.$emit('levelChange', res[0])
        this.$bus.$emit('level', res[0])
      })
      HTTP.categoryTree().then(res => {
        // console.log(res[0], 'levelChange2')
        this.menuFilter(res)
        this.$bus.$emit('showTopData', res[0])
        this.$bus.$emit('levelChange', res[0])
        this.$bus.$emit('level', res[0])
        this.version = res[0].version
        this.$nextTick(() => {
          this.$refs.treeList.setCurrentKey(res[0].id)
        })
      }).catch(e => {
        // this.$showFailure(e)
        this.loading = false
      })
      this.$bus.$off('nextTickMethod').$on('nextTickMethod', res => {
        this.searchData(this.menu, res)
        this.$refs.treeList.setCurrentKey(res)
      })
    },
    menuFilter (data) {
      data.map(item => {
        if (item.child) {
          item.children = item.child
          this.menuFilter(item.child)
        }
      })
      this.menu = data
      this.loading = false
    },
    menuClick (event) {
      if (event.label === '编辑') {
        this.from.name = this.menuEdit.name
        this.from.id = this.menuEdit.id
        this.from.alias = this.menuEdit.alias
        this.from.description = this.menuEdit.description ? this.menuEdit.description : ''
        this.flag = true
        this.title = '编辑'
      } else if (event.label === '删除') {
        this.$confirm('您确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.delComm()
        }).catch(() => {})
      } else if (event.label === '添加子主题') {
        this.from = {
          name: ''
        }
        this.flag = true
        this.title = '添加子主题'
        this.from.parentId = this.menuEdit.id
      }
      this.show = false
    },
    save (from) {
      this.from = from
      if (!this.from.name) {
        this.$message.warning('名称为必填项')
        return
      }
      this.flag = false
      if (this.title === '添加子主题') { // 添加子主题弹窗
        this.addSubtopics()
      } else if (this.title === '编辑') { // 编辑弹窗
        this.objectmap()
      }
    },
    cancel () {
      this.flag = false
    },
    // 右键编辑
    objectmap () {
      HTTP.newNameTree(this.from).then(res => {
        this.categoryTree()
      }).catch(e => {
      })
    },
    // 右键菜单删除
    delComm () {
      HTTP.delNameTree({ 'id': this.menuEdit.id }).then(res => {
        this.categoryTree()
      }).catch(e => {
      })
    },
    // 添加子主题
    addSubtopics () {
      HTTP.addNameTree(this.from).then(res => {
        this.categoryTree()
      }).catch(e => {
      })
    },
    // 拖拽结束
    handleDragEnd (draggingNode, dropNode, dropType, ev) {
      // draggingNode拖  dropNode 放
      // 3级目录移到2级目录中存放
      this.$confirm('您确定要更改该目录顺序吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        if (draggingNode.level === 3 && dropNode.level === 2 && dropType === 'inner') {
          this.drag = true
        }
        if (!this.drag) {
          return
        }
        if (draggingNode.level === 3 && dropNode.level === 2) {
          // 3级往2级里面放
          draggingNode.data.parentId = dropNode.data.id
        } else {
          draggingNode.data.parentId = dropNode.data.parentId
        }
        this.sortList(this.menu, draggingNode.data.parentId) // 通过改变拖拽的元素的父id找到父菜单
      }).catch(() => {
        this.categoryTree()
        return false
      })
    },
    // 找父菜单
    sortList (obj, tag) {
      obj.some(item => {
        if (item.id === tag) {
          this.sortListMethod(item) // 找到的父菜单发送请求
          return false
        } else if (item.children) {
          this.sortList(item.children, tag)
        }
      })
    },
    // 发送更改目录
    sortListMethod (menu) {
      let list = []
      menu.children.some((item, index) => {
        let obj = {
          'version': this.version,
          'id': item.id,
          'parentId': item.parentId,
          'sort': index + 1
        }
        list.push(obj)
      })
      HTTP.treeSort(list).then(res => {
        this.categoryTree()
      }).catch(e => {
        // this.$showFailure(e)
      })
    },
    // tree 节点点击
    nodeClick (data, node, sel) {
      this.searchParent(this.menu, data.parentId)
      this.$bus.$emit('showTopData', data)
      if (data.id) {
        this.$bus.$emit('levelChange', data)
      }
      this.$bus.$emit('level', data)
    },
    // 查找点击的父节点
    searchParent (obj, tag) {
      obj.some(item => {
        if (item.id === tag) {
          let params = {
            name: item.name,
            id: item.id
          }
          this.$bus.$emit('parentName', params)
          return true
        } else if (item.children) {
          this.searchParent(item.children, tag)
        }
      })
    },
    // head中领域和副主题按钮点击
    searchData (obj, tag) {
      obj.some(item => {
        if (item.id === tag) {
          this.nodeClick(item)
          return true
        } else if (item.children) {
          this.searchData(item.children, tag)
        }
      })
    },
    // 拖拽时判定目标节点能否被放置
    drog (draggingNode, dropNode, type) {
      // draggingNode托  dropNode放
      if (
        (draggingNode.level === 2 && dropNode.level === 2 && type === 'inner') || // 2级不能往2级中放
        (draggingNode.level === 3 && dropNode.level === 3 && type === 'inner') || // 3级不能变成3级的子集
        (draggingNode.level === 3 && dropNode.level === 2 && type !== 'inner') || // 3级不能变成2级
        (draggingNode.level === 2 && dropNode.level === 3) || // 2级不能变成3级的子集
        (draggingNode.level === 3 && dropNode.level === 1) ||
        (draggingNode.level === 2 && dropNode.level === 1) // 3级，2级不能变成1级
      ) {
        this.drag = false
        return false
      } else {
        this.drag = true // 元素可以拖拽，页面有变化
        return true
      }
    }
  },
  beforeDestroy () {
    this.$nextTick(null)
  },
  mounted () {
    this.categoryTree()
  }
}
</script>
<style lang="scss" scoped>
.enterLeft{
  padding: 20px 0;
  margin-left: 20px;
  color: #20293B;
  position: relative;
  .contextmenu{
    width: 85px;
    padding: 10px 0;
    background: #fff;
    box-shadow: 2px 3px 5px 1px #eee;
    border: 1px solid #e3e3e3;
    position: absolute;
    li{
      height: 25px;
      line-height: 25px;
      padding: 0 10px;
      cursor: pointer;
      &:hover{
        background: #eee
      }
      &.disabled{
        color: #999;
        cursor: not-allowed
      }
    };
  }
  .company-info-edit-wrapper {
    h1{
      margin-bottom: 30px;
    }
    form>div{
      width: 100%;
    }
  }
  .treeBox{
    .muluBox{
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      font-family: \ PingFangSC-Regular,PingFang SC;
      font-weight: 400;
    }
    i{
      cursor: pointer;
      color: #7D8493;
      line-height: 1;
      z-index: 11;
      font-size: 16px;
      margin-right: 10px;
      position: relative;
    }
    /deep/.el-tree-node__content .icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      position: relative;
      top: 4px;
      &.architecture{
        background: url("/static/image/architecture.svg");
        background-size: 100%;
      }
      &.area{
        background: url("/static/image/area.svg");
        background-size: 100%;
      }
      &.theme{
        background: url("/static/image/theme.svg");
        background-size: 100%;
      }
    }
  }

}
</style>
