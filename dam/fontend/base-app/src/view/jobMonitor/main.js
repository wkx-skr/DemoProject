import ResizeHorizontal from "@/components/common/ResizeHorizontal";
import serverMessage from './serverMessage.vue'
import instanceMessage from './instanceMessage.vue'
import {JobServerLabel} from "@/view/jobMonitor/Constant";

export default {
  components: {
    serverMessage,
    instanceMessage,
  },
  data() {
    return {
      defaultProps: {
        value: 'id',
        label: 'name',
        isLeaf: 'isLeaf'
      },
      currentMessage: null,
      currentInstance: null,
    }
  },
  methods: {
    loadNodes(node, resolve) {
      if (node.level === 0) {
        this.$http.post(`/job/manager/getJobInstances`).then(res => {
          this.$nextTick(() => {
            setTimeout(() => {
              $('.el-tree-node')[0].click()
              $('.el-tree-node .el-tree-node__expand-icon')[0].click()
            })
          })
          resolve(res.data.map(item => {
            return {
              id: item.serverId,
              name: `${item.host}:${item.port} (${item.master? 'Scheduler': 'Node'})`,
              message: item
            }
          }))
        })
      } else if (node.level === 1) {
        this.$http.post(`/job/manager/getInstProcess?serverId=${node.data.id}`).then(res => {
          if (res.data && res.data.executions) {
            resolve(res.data.executions.map(item => {
              item.serverId = node.data.id
              return {
                id: node.data.id + item.jobServerName,
                name: JobServerLabel[item.jobServerName] || item.jobServerName,
                isLeaf: true,
                message: item
              }
            }))
          } else {
            resolve([])
          }
        }).catch(_ => {
          resolve([])
        })
      }

    },
    dataIconFunction(data, node) {
      if (node.level === 1) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (node.level === 2) {
        // if (node.data.jobServerStatus === 'NOT_START') {
        //   return 'el-icon-finished'
        // } else {
        //   return 'el-icon-refresh-right'
        // }
        return 'iconfont icon-xitong'
      }
    },
    handleNodeClick(data, node) {
      this.currentInstance = null
      this.currentMessage = null
      setTimeout(() => {
        if (node.level === 1) {
          this.currentMessage = data.message
        }
        if (node.level === 2) {
          this.currentInstance = data.message
        }
      })
    },
    updateTreeItem(message) {
      const treeItem = this.$refs.tree.getNode(message.serverId + message.jobServerName)
      treeItem.data.message = message
      treeItem.data.name = message.jobServerName
    }
  },
  mounted() {
    setTimeout(() => {
      new ResizeHorizontal({
        leftDom: $('.tree-area'),
        middleDom: $('.resize-column-middle'),
        rightDom: $('.content-area'),
        noCrack: true,
        minWith: { leftMinWidth: 280 },
      })
    }, 1000)
  },
}
