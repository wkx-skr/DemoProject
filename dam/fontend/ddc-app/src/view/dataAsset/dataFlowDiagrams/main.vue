<template>
  <div class="data-flow-diagrams-container">
    <div class="top-section">
      <el-form :inline="true" size="mini">
        <el-form-item label="应用系统">
          <el-cascader v-model="modelCategoryId" :options="systemOptions" clearable filterable :props="{
            value: 'categoryId',
            label: 'name',
            children: 'nodes',
            checkStrictly: true,
            emitPath: false,
          }" placeholder="请选择"></el-cascader>
        </el-form-item>
        <el-form-item>
          <datablau-button type="normal" @click="onSearch">
            查询
          </datablau-button>
          <datablau-button type="normal" @click="onReset">重置</datablau-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="main-section">
      <div class="diagram-area" ref="containerRef" v-loading="loadingDiagram">
        <div id="container" class="echart-container"></div>
      </div>
    </div>
    <datablau-dialog title="关系详情列表" :visible.sync="flag" :modal="false" :close-on-click-modal="false" width="60vw"
                     append-to-body>
      <div class="details-table" v-loading="loadingDetails">
        <datablau-table :data="lineDetailsData" height="100%" style="width: 100%">
          <el-table-column prop="modelCategoryNameLeft" label="上游系统" show-overflow-tooltip></el-table-column>
          <el-table-column label="上游操作" width="120">
            <template #default="{ row }">
              <span v-if="row.permissionsCrudLeft">
                <el-tag v-for="tag in getPermissionTags(row.permissionsCrudLeft)" :key="tag.char" :type="tag.type"
                        size="mini" effect="light" style="margin-right: 4px">
                  {{ tag.char }}
                </el-tag>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="业务对象名称" prop="l3Name" width="200" show-overflow-tooltip
                           align="center"></el-table-column>
          <el-table-column prop="l4Name" label="逻辑实体名称" width="200" show-overflow-tooltip></el-table-column>
          <el-table-column label="下游操作" width="120">
            <template #default="{ row }">
              <span v-if="row.permissionsCrudRight">
                <el-tag v-for="tag in getPermissionTags(row.permissionsCrudRight)" :key="tag.char" :type="tag.type"
                        size="mini" effect="light" style="margin-right: 4px">
                  {{ tag.char }}
                </el-tag>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="modelCategoryNameRight" label="下游系统" show-overflow-tooltip></el-table-column>
          <!-- Empty state provided by datablau-table or element-plus table -->
          <template #empty>
            <el-empty description="无详细信息"></el-empty>
          </template>
        </datablau-table>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import { graphData, allSystemData } from './mockData.js'
import { Graph, Arrow } from '@antv/g6'

export default {
  data() {
    return {
      flag: false,
      graph: null,
      graphData: {},
      allSystemData: [],
      loadingDiagram: false,
      systemOptions: [],
      modelCategoryId: [],
      loadingDetails: false,
      lineDetailsData: [],
      permissionTagTypes: {
        C: 'success', // Green (Aligned)
        R: 'info', // Grey (Aligned)
        U: 'warning', // Yellow
        D: 'danger', // Red
      },
      highlightNode: null,
      boxWidth: 0,
      boxHeight: 0,
      resetView: null,
      // 新增：跟踪已选择的节点和边
      selectedNodes: new Set(),
      selectedEdges: new Set(),
    }
  },
  mounted() {
    this.boxWidth = this.$refs.containerRef.offsetWidth
    this.boxHeight = this.$refs.containerRef.offsetHeight
    this.fetchSystemTree()
    this.initData()
  },
  methods: {
    onSearch() {
      if (this.highlightNode && this.modelCategoryId) {
        console.log(
          this.highlightNode,
          this.modelCategoryId,
          'this.modelCategoryId'
        )
        this.highlightNode(this.modelCategoryId)
      }
    },
    onReset() {
      this.modelCategoryId = ''
      this.resetView && this.resetView()
    },
    // 获取搜索数据
    async fetchSystemTree() {
      try {
        const res = await this.$http.get('/base/modelCategory/getTree')
        const rawNodes = res?.data?.nodes || []
        this.systemOptions = this.processNodesForCascader(rawNodes)
      } catch (err) {
        this.$showFailure(err)
        this.systemOptions = []
      }
    },
    // 初始化关系图数据
    async initData() {
      // this.initGraph();
      // return
      try {
        let response = await this.$http.post(
          '/base/modelCategory/getModelCategories'
        )
        if (response.status == 200) {
          this.allSystemData = response.data || []
        }
        // 获取系统关系数据
        let response1 = await this.$http.post('/assets/dataflow/getAllDiagrams')
        if (response1.status == 200) {
          this.graphData = response1.data || {}
        }
        this.initGraph()
      } catch (err) {
        this.$showFailure(err)
        this.systemOptions = []
      }
    },
    async loadTableData(payload) {
      try {
        this.loadingDetails = true
        const res = await this.$http.post(
          '/assets/dataflow/getLineDetails',
          payload
        )
        this.lineDetailsData = res?.data || []
        if (this.lineDetailsData.length === 0) {
          this.$message.info('该关系线上无具体的实体关联信息')
        }
      } catch (err) {
        this.$showFailure(err)
        this.lineDetailsData = []
      } finally {
        this.loadingDetails = false
      }
    },
    processNodesForCascader(nodes) {
      if (!Array.isArray(nodes)) return []
      return nodes.map(node => {
        const displayName = node.name || node.categoryName // Prefer 'name' if exists
        const processedNode = {
          ...node,
          name: displayName,
          categoryId: node.categoryId,
        }

        // Recursively process children, handle empty arrays
        if (processedNode.nodes && Array.isArray(processedNode.nodes)) {
          processedNode.nodes = this.processNodesForCascader(
            processedNode.nodes
          )
          if (processedNode.nodes.length === 0) {
            // Set nodes to undefined if empty, Cascader might handle this better visually
            processedNode.nodes = undefined
          }
        } else {
          processedNode.nodes = undefined
        }
        processedNode.isLeaf = processedNode.nodes === undefined
        return processedNode
      })
    },

    processCircularEdges(edges) {
      const edgeMap = new Map()
      const processedEdges = []

      // 第一步：创建边的映射，键为 "source-target" 格式
      edges.forEach(edge => {
        const key = `${edge.source}-${edge.target}`
        const reverseKey = `${edge.target}-${edge.source}`

        // 检查是否存在反向边
        if (edgeMap.has(reverseKey)) {
          const reverseEdge = edgeMap.get(reverseKey)

          // 创建双向边，保留两个标签
          const bidirectionalEdge = {
            source: edge.source,
            target: edge.target,
            id: `${edge.source}-${edge.target}-bidirectional`,
            labels: {
              forward: edge.label, // 正向标签 (source→target)
              backward: reverseEdge.label, // 反向标签 (target→source)
            },
            isBidirectional: true, // 标记为双向箭头
            // 使用默认边的配置
            label: `${edge.label}、${reverseEdge.label}`, // 默认显示的合并标签
            // labelCfg: {
            //   // 默认标签位置配置
            //   position: 'center',
            //   refY: 0,
            //   style: {
            //     fill: '#666',
            //     fontSize: 8,
            //     background: {
            //       fill: '#fff',
            //       stroke: '#fff',
            //       padding: [2, 4, 1, 4],
            //       radius: 3,
            //     },
            //   },
            // },
            style: {
              // 双向边的样式
              stroke: '#e2e2e2',
              lineWidth: 1,
              endArrow: {
                path: Arrow.triangle(3, 4, 0),
                fill: '#e2e2e2',
              },
              startArrow: {
                path: Arrow.triangle(3, 4, 0),
                fill: '#e2e2e2',
              },
            },
          }

          // 移除已存在的反向边
          const index = processedEdges.findIndex(e => e.id === reverseEdge.id)
          if (index !== -1) {
            processedEdges.splice(index, 1)
          }

          // 添加双向边
          processedEdges.push(bidirectionalEdge)

          // 从映射中移除反向边
          edgeMap.delete(reverseKey)
        } else {
          // 不是环状边，标记为单向
          edge.isBidirectional = false

          // 设置单向边的默认样式
          edge.style = {
            stroke: '#e2e2e2',
            lineWidth: 1,
            endArrow: {
              path: Arrow.triangle(3, 4, 0),
              fill: '#e2e2e2',
            },
          }

          // edge.labelCfg = {
          //   position: 'center',
          //   refY: -10,
          //   style: {
          //     fill: '#666',
          //     fontSize: 8,
          //     background: {
          //       fill: '#fff',
          //       stroke: '#fff',
          //       padding: [2, 4, 1, 4],
          //       radius: 3,
          //     },
          //   },
          // }
          processedEdges.push(edge)
          edgeMap.set(key, edge)
        }
      })
      return processedEdges
    },
    computedNode(nodes, edges) {
      // 1. 计算每个节点的度数（连线数）
      const degreeMap = {}
      edges.forEach(edge => {
        degreeMap[edge.source] = (degreeMap[edge.source] || 0) + 1
        degreeMap[edge.target] = (degreeMap[edge.target] || 0) + 1
      })

      // 2. 找到最大度数
      let maxDegree = 0
      Object.values(degreeMap).forEach(deg => {
        if (deg > maxDegree) maxDegree = deg
      })

      // 3. 设置最小缩放比例（例如0.7，表示最小节点是最大节点的70%大小）
      const minScale = 0.75

      // 4. 为每个节点计算缩放比例并应用到节点大小
      nodes.forEach(node => {
        const degree = degreeMap[node.id] || 0

        // 计算缩放比例（连线最多的节点比例为1，其他按比例缩小）
        let scale = 1
        if (maxDegree > 0) {
          scale = minScale + (1 - minScale) * (degree / maxDegree)
        }

        // 应用缩放比例到节点大小
        const baseSize = node.size || [65, 30]
        node.size = [baseSize[0] * scale, baseSize[1] * scale]

        // 可选：也可以根据度数调整字体大小
        const baseFontSize = 10
        if (!node.labelCfg) node.labelCfg = {}
        if (!node.labelCfg.style) node.labelCfg.style = {}
        node.labelCfg.style.fontSize = baseFontSize * scale
      })
    },
    initGraph() {
      const layouts = {
        //当节点数量小于50个时
        fruchterman50: {
          type: 'fruchterman',
          gravity: 4,
          speed: 5,
          animation: true,
          center: [this.boxWidth / 2, this.boxHeight / 2],
          width: this.boxWidth,
          height: this.boxHeight,
          preventOverlap: true,
        },
        //当节点数量大于70-100个时
        radial70: {
          type: 'radial',
          nodeSize: 200,
          unitRadius: 180,
          // linkDistance: 1000,
          preventOverlap: true,
          maxPreventOverlapIteration: 200,
          strictRadial: false,
        },
      }
      let { nodes, edges } = this.buildGraphData()
      edges = this.processCircularEdges(edges)
      this.computedNode(nodes, edges)

      let layout = null
      let length = nodes.length
      if (length > 0 && length <= 50) {
        layout = layouts['fruchterman50']
      } else if (length > 50 && length <= 80) {
        layout = layouts['radial70']
      } else {
        // 插件默认布局
        layout = undefined
      }

      // 创建G6图实例
      this.graph = new Graph({
        container: 'container',
        width: this.boxWidth,
        height: this.boxHeight,
        layout,
        // 1. 修改节点文字样式
        defaultNode: {
          style: {
            fill: '#9EC9FF',
            stroke: '#5B8FF9',
            lineWidth: 1,
            cursor: 'pointer',
          },
          labelCfg: {
            style: {
              fill: '#333', // 文字颜色改为深色
              fontSize: 8, // 增大字号
              cursor: 'pointer',
            },
          },
          // type: 'rect',
        },
        defaultEdge: {
          // type: 'polyline',
          labelCfg: {
            style: {
              fill: '#666',
              fontSize: 7,
            },
            refY: -8,
            refX: -8,
            autoRotate: true, // 注意：G6 中使用 autoRotate 而不是 rotate
          },
          style: {
            // endArrow: {
            //   path: Arrow.triangle(3, 4, 0),
            //   fill: '#e2e2e2',
            // },
            // startArrow: {
            //   path: Arrow.triangle(3, 4, 0),
            //   fill: '#e2e2e2'
            // },
            stroke: '#e2e2e2',
            lineWidth: 1,
            cursor: 'pointer',
          },
        },
        modes: {
          default: [
            'drag-canvas',
            'drag-node',
            'zoom-canvas',
            {
              type: 'tooltip',
              formatText(model) {
                return `${model.tooltip}` // 完整显示名称
              },
              offset: 10,
              itemTypes: ['node'], // 只对节点生效
            },
          ],
        },
        // 定义不同状态下的样式
        nodeStateStyles: {
          highlight: {
            fill: '#FF9E7D',
            stroke: '#FF6B3B',
            lineWidth: 1,
          },
          // 新增淡化状态
          dim: {
            opacity: 0.2,
          },
        },
        edgeStateStyles: {
          highlight: {
            stroke: '#FF6B3B',
            lineWidth: 1.4,
          },
          // 新增连线激活状态
          active: {
            stroke: '#333', // 深色激活状态
            lineWidth: 1.8,
          },
          // 新增淡化状态
          dim: {
            opacity: 0.2,
          },
        },
      })

      // 注册边点击事件
      this.graph.on('edge:click', evt => {
        const edge = evt.item
        const model = edge.getModel()
        this.flag = true
        this.loadTableData({
          modelCategoryId: model.source,
          modelCategoryIdOther: model.target,
          flag: false,
        })
      })

      this.graph.on('node:click', evt => {
        const node = evt.item
        const model = node.getModel()
        this.modelCategoryId = Number(node._cfg.id)

        // 1. 获取当前节点及其邻居节点
        const neighborNodes = new Set()
        const relatedEdges = new Set()

        // 添加当前节点
        neighborNodes.add(node)

        // 获取直接相连的节点和边
        const edges = node.getEdges()
        edges.forEach(edge => {
          relatedEdges.add(edge)

          const source = edge.getSource()
          const target = edge.getTarget()

          if (source !== node) neighborNodes.add(source)
          if (target !== node) neighborNodes.add(target)
        })

        // 2. 将新选择的节点和边添加到已选择集合中
        neighborNodes.forEach(neighborNode => {
          this.selectedNodes.add(neighborNode)
        })
        relatedEdges.forEach(relatedEdge => {
          this.selectedEdges.add(relatedEdge)
        })

        // 3. 隐藏所有节点和边
        this.graph.getNodes().forEach(graphNode => {
          this.graph.hideItem(graphNode)
        })

        this.graph.getEdges().forEach(graphEdge => {
          this.graph.hideItem(graphEdge)
        })

        // 4. 显示所有已选择的节点和边（累积效果）
        this.selectedNodes.forEach(selectedNode => {
          this.graph.showItem(selectedNode)
        })

        this.selectedEdges.forEach(selectedEdge => {
          this.graph.showItem(selectedEdge)
        })

        // 5. 聚焦显示的区域
        // this.graph.fitView() // 添加边距
      })

      // 1. 节点悬停事件
      this.graph.on('node:mouseenter', e => {
        const currentNode = e.item
        const model = currentNode.getModel()

        // 获取所有邻居节点（直接相连的节点）
        const neighborNodes = new Set()
        // 获取当前节点的所有边
        const relatedEdges = currentNode.getEdges()

        // 收集相关节点和边
        relatedEdges.forEach(edge => {
          const source = edge.getSource()
          const target = edge.getTarget()

          // 添加源节点和目标节点（排除自身）
          if (source !== currentNode) neighborNodes.add(source)
          if (target !== currentNode) neighborNodes.add(target)

          // 高亮当前边
          this.graph.setItemState(edge, 'active', true)
        })

        // 设置所有节点状态
        this.graph.getNodes().forEach(node => {
          if (node === currentNode || neighborNodes.has(node)) {
            // 当前节点及邻居节点保持正常
            this.graph.clearItemStates(node, ['dim'])
          } else {
            // 其他节点淡化
            this.graph.setItemState(node, 'dim', true)
          }
        })

        // 设置所有边状态
        this.graph.getEdges().forEach(edge => {
          if (!relatedEdges.includes(edge)) {
            // 非相关边淡化
            this.graph.setItemState(edge, 'dim', true)
          }
        })
      })

      // 2. 节点离开事件
      this.graph.on('node:mouseleave', () => {
        // 清除所有节点和边的状态
        this.graph.getNodes().forEach(node => {
          this.graph.clearItemStates(node, ['dim', 'highlight'])
        })
        this.graph.getEdges().forEach(edge => {
          this.graph.clearItemStates(edge, ['active', 'dim', 'highlight'])
        })
      })

      // 3. 连线悬停事件
      this.graph.on('edge:mouseenter', e => {
        const currentEdge = e.item
        const sourceNode = currentEdge.getSource()
        const targetNode = currentEdge.getTarget()

        // 设置当前连线为激活状态
        this.graph.setItemState(currentEdge, 'active', true)

        // 设置所有节点状态
        this.graph.getNodes().forEach(node => {
          if (node === sourceNode || node === targetNode) {
            // 两端节点保持正常
            this.graph.clearItemStates(node, ['dim'])
          } else {
            // 其他节点淡化
            this.graph.setItemState(node, 'dim', true)
          }
        })

        // 设置所有边状态
        this.graph.getEdges().forEach(edge => {
          if (edge !== currentEdge) {
            // 非当前连线淡化
            this.graph.setItemState(edge, 'dim', true)
          }
        })
      })

      // 4. 连线离开事件
      this.graph.on('edge:mouseleave', () => {
        // 与节点离开事件使用相同的清理逻辑
        this.graph.getNodes().forEach(node => {
          this.graph.clearItemStates(node, ['dim', 'highlight'])
        })
        this.graph.getEdges().forEach(edge => {
          this.graph.clearItemStates(edge, ['active', 'dim', 'highlight'])
        })
      })

      // 暴露高亮节点方法（可在外部调用）
      this.highlightNode = nodeId => {
        // 清除所有状态
        this.resetView()

        const targetNode = this.graph.findById(nodeId)
        if (!targetNode) {
          console.warn(`Node ${nodeId} not found`)
          return
        }

        // 1. 获取当前节点及其邻居节点
        const neighborNodes = new Set()
        const relatedEdges = new Set()

        // 添加当前节点
        neighborNodes.add(targetNode)

        // 获取直接相连的节点和边
        const edges = targetNode.getEdges()
        edges.forEach(edge => {
          relatedEdges.add(edge)

          const source = edge.getSource()
          const target = edge.getTarget()

          if (source !== targetNode) neighborNodes.add(source)
          if (target !== targetNode) neighborNodes.add(target)
        })

        // 2. 隐藏所有节点和边
        this.graph.getNodes().forEach(graphNode => {
          this.graph.hideItem(graphNode)
        })

        this.graph.getEdges().forEach(graphEdge => {
          this.graph.hideItem(graphEdge)
        })

        // 3. 显示相关节点和边
        neighborNodes.forEach(neighborNode => {
          this.graph.showItem(neighborNode)
        })

        relatedEdges.forEach(relatedEdge => {
          this.graph.showItem(relatedEdge)
        })

        // 4. 聚焦显示的区域
        // this.graph.fitView()
      }
      // 暴露重置
      this.resetView = () => {
        // 清除所有状态
        this.graph.getNodes().forEach(node => {
          this.graph.clearItemStates(node, ['highlight', 'dim'])
        })
        this.graph.getEdges().forEach(edge => {
          this.graph.clearItemStates(edge, ['active', 'highlight', 'dim'])
        })

        // 显示所有原始节点和边
        this.graph.getNodes().forEach(node => {
          this.graph.showItem(node)
        })
        this.graph.getEdges().forEach(edge => {
          this.graph.showItem(edge)
        })

        // 清空已选择的节点和边集合
        this.selectedNodes.clear()
        this.selectedEdges.clear()

        // 恢复整体视图
        this.graph.fitView()
      }

      // 渲染图
      this.graph.data({ nodes, edges })
      this.graph.render()

      this.graph.fitView()
    },
    getPermissionTags(permissions) {
      if (!permissions) return []
      return permissions.split('').map(char => ({
        char,
        type: this.permissionTagTypes[char.toUpperCase()] || 'info',
      }))
    },
    computedStr(text) {
      const maxWidth = 48 // 节点直径约 60
      // 粗略估算字符宽度（英文/数字 10px，中文 10px）
      // 更精确可用 canvas.measureText，但性能开销大
      let width = 0
      let truncated = ''
      for (let char of text) {
        // 假设中文字符宽 10，英文/数字宽 6
        const charWidth = /[\u4e00-\u9fa5]/.test(char) ? 8 : 5
        if (width + charWidth > maxWidth) {
          truncated += '...'
          break
        }
        width += charWidth
        truncated += char
      }
      return truncated || '...'
    },
    /**
     * 根据 folderId 查找节点，并返回从根到该节点的 name 路径
     * @param {Array} data - 树形数据
     * @param {number} targetId - 要查找的 folderId
     * @param {string} defaultValue - 找不到时返回的默认值
     * @returns {string} 路径字符串，如 "OA系统/测试系统2-子001"
     */
    findPathById(data, targetId, defaultValue = '') {
      console.log('data', data, targetId)

      // 深度优先搜索
      function dfs(nodes, path) {
        for (const node of nodes) {
          const currentPath = [...path, node.name]

          if (node.categoryId == targetId) {
            return currentPath.join('/')
          }

          if (node.nodes && node.nodes.length > 0) {
            const found = dfs(node.nodes, currentPath)
            if (found) return found
          }
        }
        return null
      }

      const result = dfs(data, [])
      return result !== null ? result : defaultValue
    },
    buildGraphData() {
      const nodes = []
      const edges = []
      const processedEdges = new Set()

      // 添加所有系统节点
      this.allSystemData.forEach(system => {
        let systemPath = this.findPathById(
          this.systemOptions,
          system.categoryId,
          system.categoryName
        )
        nodes.push({
          id: system.categoryId.toString(),
          tooltip: systemPath,
          label: this.computedStr(systemPath),
        })
      })

      // 构建连线
      Object.keys(this.graphData).forEach(systemId => {
        const system = this.graphData[systemId]

        // 处理上游系统连线
        if (system.left?.length) {
          system.left.forEach(leftSystem => {
            const edgeKey = `${leftSystem.categoryId}-${systemId}`
            if (!processedEdges.has(edgeKey)) {
              edges.push({
                source: leftSystem.categoryId.toString(),
                target: systemId,
                id: edgeKey,
                label: leftSystem.l3Name,
              })
              processedEdges.add(edgeKey)
            }
          })
        }

        // 处理下游系统连线
        if (system.right?.length) {
          system.right.forEach(rightSystem => {
            const edgeKey = `${systemId}-${rightSystem.categoryId}`
            if (!processedEdges.has(edgeKey)) {
              edges.push({
                source: systemId,
                target: rightSystem.categoryId.toString(),
                id: edgeKey,
                label: rightSystem.l3Name,
              })
              processedEdges.add(edgeKey)
            }
          })
        }
      })

      return { nodes, edges }
    },
  },
  beforeDestroy() {
    if (this.graph) {
      this.graph.destroy()
    }
  },
}
</script>
<style scoped lang="scss">
.data-flow-diagrams-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 15px;
  box-sizing: border-box;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 10px 20px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  flex-shrink: 0;

  .el-form-item {
    margin-bottom: 0;
  }
}

.info-box {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d48806; // Adjusted color slightly for better contrast
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
}

.top-info {
  max-width: 300px;
}

.main-section {
  flex-grow: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
}

/* Styles for the Diagram Area */
.diagram-area {
  flex-grow: 1;
  position: relative; // For absolute positioning of info box & ECharts container
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  height: 100%;
  // margin-right: 20px; // Remove margin, rely on details panel padding/border

  // The direct child div where ECharts is initialized
  .echart-container {
    position: absolute; // Take full space of parent
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .empty-diagram-state {
    color: #909399;
    font-size: 14px;
    text-align: center;
    z-index: 1; // Above echart container if it exists but is empty
  }
}

/* Styles for the Details Panel */
.details-panel {
  position: relative; // Needed if close button is absolute positioned inside
  // width: 450px; // Fixed width // Remove fixed width
  width: 50%; // Set width to 50%
  flex-shrink: 0;
  // Removed margin-left, spacing handled by diagram-area margin-right
  border-left: 1px solid #e4e7ed; // Separator line
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; // Prevent content overflow
}

.panel-title {
  font-weight: 600; // Slightly bolder
  font-size: 15px; // Slightly larger
  color: #303133;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between; // Pushes title and icon apart
  align-items: center;
  margin-bottom: 15px; // Keep bottom margin

  .close-icon {
    cursor: pointer;
    color: #909399;
    font-size: 20px; // Adjust size for Unicode character
    font-weight: bold;
    padding: 0 5px; // Add some padding for easier clicking

    &:hover {
      color: #f56c6c; // Highlight red on hover
    }
  }
}

.details-table {
  height: 50vh;
  flex-grow: 1;
  overflow: hidden; // Table component should handle internal scroll

  // Ensure the table fills the container
  :deep(.el-table),
  :deep(.datablau-table) {
    height: 100%;
  }
}

/* Global loading mask style adjustment if needed */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.7); // Lighter loading mask
}
</style>
<style>
.g6-tooltip {
  border: 1px solid #e2e2e2;
  border-radius: 4px;
  font-size: 16px;
  color: #545454;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 8px;
  box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
</style>
