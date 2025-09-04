<template>
  <div>
    <datablau-input
      style="width: 240px"
      clearable
      :placeholder="$t('meta.DS.treeSubOperation.placeholder')"
      v-model="keyword"
    ></datablau-input>
    <div
      style="height: 274px; position: relative; margin-top: 10px"
      id="bind-model-tree"
    >
      <!-- :render-content="renderContent" -->
      <datablau-tree
        ref="tree1"
        node-key="sId"
        class="light-blue-tree"
        :data="freeModels2"
        :data-icon-function="dataIconFunction"
        :props="businessDefaultProps"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
        :default-expanded-keys="expandedKeys"
        v-datablauLoading="loadingData"
      ></datablau-tree>
    </div>
    <div slot="bottom" class="dialog-bottom">
      <datablau-button
        type="important"
        @click="bind"
        :disabled="disableBindModel2"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
      <datablau-button type="secondary" @click="close">
        {{ $t('common.button.close') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  props: ['expandBranch'],
  data() {
    return {
      freeModels2: [],
      businessDefaultProps: {
        label: 'name',
        id: 'id',
      },
      expandedKeys: ['c1'],
      disableBindModel2: true,
      loadingData: false,
      keyword: '',
      path: '',
    }
  },
  mounted() {
    this.loadingData = true
    this.getFreeModels2()
    setTimeout(() => {
      this.bindModelTree = $('#bind-model-tree')[0]
      Ps.initialize(this.bindModelTree)
    })
  },
  watch: {
    keyword(val) {
      this.$refs.tree1.filter(val)
    },
  },
  methods: {
    filterNode(value, data, node) {
      setTimeout(() => {
        Ps.update(this.bindModelTree)
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
    bind() {
      this.$bus.$emit('modelSelected', _.clone(this.modelClicked))
    },
    close() {
      this.$bus.$emit('removeModelSelectDialog')
      this.$emit('removeModelSelectDialog')
    },
    handleModelPath(node, path) {
      if (!node.parent) {
        path.unshift(node.data.name)
        return path
      } else {
        path.unshift(node.parent.data.name)
        this.handleModelPath(node.parent, path)
      }
      return path
    },
    handleNodeClick(data, node) {
      if (data.type == 'model') {
        this.handleNodeExpand(data, node)
        this.disableBindModel2 = false
        let path = [data.name]
        this.path = this.handleModelPath(node, path)
          .filter(p => p)
          .join('/')
        this.modelClicked = data
        this.modelClicked.path = this.path
      } else if (data.type == 'branch') {
        this.disableBindModel2 = false
        let path = []
        this.path = this.handleModelPath(node, path)
          .filter(p => p)
          .join('/')
        this.modelClicked = data
        this.modelClicked.path = this.path
        this.modelClicked.parent = node.parent.data
      } else {
        setTimeout(() => {
          Ps.update(this.bindModelTree)
        }, 100)

        this.disableBindModel2 = true
      }
    },
    handleNodeExpand(data, node) {
      if (this.expandBranch && data.type == 'model') {
        this.getModelBaseLine(data.id)
      }
      const index = this.expandedKeys.indexOf(data.sId)
      if (index == -1) {
        this.expandedKeys.push(data.sId)
      }
    },
    handleNodeCollapse(data, node) {
      const index = this.expandedKeys.indexOf(data.sId)
      this.expandedKeys.splice(index, 1)
    },
    getModelBaseLine(modelId, master) {
      const self = this
      self.$http
        .get(self.$meta_url + '/models/ddm/models/' + modelId + '/baselines')
        .then(res => {
          var children = []
          if (master) {
            children.push(master)
          } else {
            children.push({
              // 此处还需要补充更多master的属性
              name: 'master',
              id: modelId,
              sId: modelId,
              type: 'branch',
            })
          }
          res.data.forEach(item => {
            item.sId = item.id
            item.type = 'branch'
            children.push(item)
          })
          self.$refs.tree1.updateKeyChildren('m' + modelId, children)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getFreeModels2() {
      // this.$http.get(this.$url + '/service/models/ddm/models')
      HTTP.getAllModels()
        .then(res => {
          let data
          if (typeof res.data == 'string') {
            data = _.cloneDeep(JSON.parse(res.data))
          } else {
            data = _.cloneDeep(res.data)
          }
          this.modifyArrKey(data)
          this.freeModels2 = [data]
          this.loadingData = false

          //          setTimeout(()=>{
          //            $('.el-tree-node')[0].click();
          //          });
        })
        .catch(e => {
          this.$showFailure(e)
          this.loadingData = false
        })
    },
    dataIconFunction(data, node) {
      if (node.level === 1 || !data.type) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.type == 'model') {
        return 'iconfont tree-icon model'
      } else {
        return 'tree-icon branch'
      }
    },
    renderContent(h, { node, data, store }) {
      let label = node.label
      if (typeof data.alias === 'string' && data.alias.length > 0) {
        label += ' (' + data.alias + ')'
      }
      if (node.level === 1) {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="iconfont icon-file" style="margin-right:8px"></span>
            <span style="font-weight:bold">{label}</span>
          </span>
        )
      } else if (!data.type) {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="iconfont icon-file" style="margin-right:8px"></span>
            <span>{label}</span>
          </span>
        )
      } else if (data.type == 'model') {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="tree-icon model"></span>
            <span>{label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="tree-icon branch"></span>
            <span>{label}</span>
          </span>
        )
      }
    },
    modifyArrKey(obj) {
      const self = this
      obj.sId = 'c' + obj.id
      if (obj.children != null) {
        this.$utils.sort.sortConsiderChineseNumber(obj.children)
        obj.children.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.models != null) {
        obj.models.forEach(item => {
          if (obj.children == null) {
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
  },
}
</script>

<style></style>
