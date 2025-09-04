<template>
  <div class="content">
    <div class="dialog-content">
      <datablau-input
          :placeholder='$v.RuleChecking.pleaseFuzzySearch'
          :iconfont-state="true"
          v-model='keyword'
          clearable
          style="width: 440px; margin-bottom: 10px;"
      ></datablau-input>
      <div
          class="tree-component"
          id='bind-model-tree'
      >
        <datablau-tree
            ref='tree1'
            node-key='sId'
            class='light-blue-tree'
            :data='freeModels2'
            :render-content='renderContent'
            :props='businessDefaultProps'
            @node-click='handleNodeClick'
            :filter-node-method='filterNode'
            :default-expanded-keys='expandedKeys'
            v-loading='loadingData'
        >
        </datablau-tree>
      </div>
    </div>
    <span slot='footer' class='dialog-bottom'>
      <el-button type="cancel" size='mini' @click='close'>取消</el-button>
      <el-button
        type='primary'
        size='mini'
        @click='bind'
        :disabled='disableBindModel2'
      >确定</el-button>
    </span>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
export default {
  //   props:['expandBranch'],
  data () {
    return {
      freeModels2: [],
      businessDefaultProps: {
        label: 'name',
        id: 'id'
      },
      expandedKeys: ['c1'],
      disableBindModel2: true,
      loadingData: false,
      keyword: ''
    }
  },
  mounted () {
    this.loadingData = true
    this.getFreeModels2()
    setTimeout(() => {
      this.bindModelTree = $('#bind-model-tree')[0]
      // Ps.initialize(this.bindModelTree)
    })
  },
  watch: {
    keyword (val) {
      this.$refs.tree1.filter(val)
    }
  },
  methods: {
    filterNode (value, data, node) {
      setTimeout(() => {
        // Ps.update(this.bindModelTree)
      }, 100)
      if (!value) return true
      if (!data.name) return false
      let hasValue = false
      let current = node
      do {
        if (
          current.data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
          (typeof current.data.alias === 'string' &&
            current.data.alias.length > 0 &&
            current.data.alias.toLowerCase().indexOf(value.toLowerCase()) !==
              -1)
        ) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    bind () {
      this.$bus.$emit('modelSelected', _.clone(this.modelClicked))
    },
    close () {
      this.$bus.$emit('removeModelSelectDialog')
      this.$emit('removeModelSelectDialog')
    },
    handleNodeClick (data, node) {
      if (data.type === 'model') {
        this.handleNodeExpand(data, node)
        this.disableBindModel2 = false
        this.modelClicked = data
      } else if (data.type === 'branch') {
        this.disableBindModel2 = false
        this.modelClicked = data
        this.modelClicked.parent = node.parent.data
      } else {
        setTimeout(() => {
          // Ps.update(this.bindModelTree)
        }, 100)

        this.disableBindModel2 = true
      }
    },
    handleNodeExpand (data, node) {
      if (this.expandBranch && data.type === 'model') {
        this.getModelBaseLine(data.id)
      }
      let index = this.expandedKeys.indexOf(data.sId)
      if (index === -1) {
        this.expandedKeys.push(data.sId)
      }
    },
    handleNodeCollapse (data, node) {
      let index = this.expandedKeys.indexOf(data.sId)
      this.expandedKeys.splice(index, 1)
    },
    getModelBaseLine (modelId, master) {
      const self = this
      self.$http
        .get(self.$url + '/service/models/ddm/models/' + modelId + '/baselines')
        .then((res) => {
          var children = []
          if (master) {
            children.push(master)
          } else {
            children.push({ // 此处还需要补充更多master的属性
              name: 'master',
              id: modelId,
              sId: modelId,
              type: 'branch'
            })
          }
          res.data.forEach((item) => {
            item.sId = item.id
            item.type = 'branch'
            children.push(item)
          })
          self.$refs.tree1.updateKeyChildren('m' + modelId, children)
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    getFreeModels2 () {
      this.$http.get(this.$url + '/service/models/tree/').then(res => {
        let data = _.cloneDeep(res.data)
        this.modifyArrKey(data)
        this.freeModels2 = [data]
        this.loadingData = false
      }).catch((e) => {
        this.$showFailure(e)
        this.loadingData = false
      })
    },
    renderContent (h, { node, data, store }) {
      let fileClass = ''
      if (node.expanded) {
        fileClass = 'iconfont icon-openfile'
      } else {
        fileClass = 'iconfont icon-file'
      }
      let label = node.label
      if (typeof data.alias === 'string' && data.alias.length > 0) {
        label += ' (' + data.alias + ')'
      }
      if (node.level === 1) {
        return (
          <span style='flex: 1 display: flexalign-items: center'>
            <span class={fileClass} style="margin-right: 10px;"></span>
            <span style='font-weight:bold'>{label}</span>
          </span>
        )
      } else if (!data.type) {
        return (
          <span style='flex: 1 display: flexalign-items: center'>
            <span class={fileClass} style="margin-right: 10px;"></span>
            <span>{label}</span>
          </span>
        )
      } else if (data.type === 'model') {
        return (
          <span style='flex: 1 display: flexalign-items: center'>
            <span class='tree-icon model'></span>
            <span>{label}</span>
          </span>
        )
      } else {
        return (
          <span style='flex: 1 display: flexalign-items: center'>
            <span class='tree-icon branch'></span>
            <span>{label}</span>
          </span>
        )
      }
    },
    modifyArrKey (obj) {
      // debugger
      const self = this
      obj.sId = 'c' + obj.id
      if (obj.children !== null) {
        sort.sortConsiderChineseNumber(obj.children)
        obj.children.forEach((item) => {
          self.modifyArrKey(item)
        })
      }
      if (obj.models && obj.models.length > 0) {
        obj.models.forEach((item) => {
          if (obj.children === null) {
            obj.children = []
          }
          item.type = 'model'
          //        item.children = []
          item.sId = 'm' + item.id
          //        item.children.push({//此处还需要补充更多master的属性
          //          name:'master',
          //          id:item.id,
          //          sId:item.id,
          //          type:'branch'
          //        })
          obj.children.push(item)
        })
      }
    },
    modelTreeIconFunction (data, node) {
      if (data.nodeType === 'model') {
        return 'iconfont icon-shujuyuan'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  height: 40vh;
  min-height: 400px;

  .dialog-content {
    //min-height: 50vh;
    position: absolute;
    left: 20px;
    top: 10px;
    bottom: 45px;
    right: 20px;
    //border: 1px solid red;

    .tree-component {
      position: absolute;
      left: 0;
      top: 40px;
      bottom: 0;
      right: 0;
      //border: 1px solid red;

      .light-blue-tree {
        height: 100%;
        overflow: auto;
      }
    }
  }
}

</style>
