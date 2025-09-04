<template>
  <div class="datacatalog-network">
    <el-dialog
      title="资产地图"
      fullscreen
      :visible.sync="showNodeCenterMap"
      v-if="showNodeCenterMap"
      append-to-body
    >
      <div style="position: absolute; top: 50px; left: 0; bottom: 0; right: 0">
        <datablau-property-map
          :data-type="entiryMapData.type"
          :data-id="entiryMapData.objectId"
          :data-name="entiryMapData.name"
        ></datablau-property-map>
      </div>
    </el-dialog>
    <div class="grah networkrow">
      <div class="outnetwork" v-if="showOldNetwork">
        <default-lineage-network></default-lineage-network>
      </div>
      <div class="outnetwork asset-map" v-else ref="outNetwork2">
        <div class="network-card" @wheel.stop>
          <div ref="network2" class="network">
            <p>{{ dataLoaded ? emptyText : loadingSystem }}</p>
          </div>
          <div
            class="asset-network-tooltip"
            v-for="nodeTooltipData in nodeTooltipDataArr"
            :key="nodeTooltipData.id"
          >
            <el-form>
              <el-form-item label="名称">
                <span class="tooltip-name">
                  {{ nodeTooltipData.name }}
                </span>
              </el-form-item>
              <el-form-item label="规模">
                <span class="tooltip-name">
                  {{ nodeTooltipData.scale }}
                </span>
              </el-form-item>
              <el-form-item label="热度">
                <span class="tooltip-name">
                  {{ nodeTooltipData.hot }}
                </span>
              </el-form-item>
              <el-form-item
                label="下级目录"
                v-if="nodeTooltipData.childrenLength"
              >
                <span class="tooltip-childrenLength">
                  {{ nodeTooltipData.childrenLength }} 个
                </span>
              </el-form-item>
            </el-form>
          </div>
          <ul class="visControl">
            <li class="controlItem fit" @click="network2Fit">
              <el-tooltip
                effect="light"
                content="重置显示位置"
                placement="bottom"
              >
                <i class="el-icon-location-outline"></i>
              </el-tooltip>
            </li>
            <li class="controlItem filter" @click="showAllCatalog">
              <el-tooltip
                effect="light"
                content="显示所有目录"
                placement="bottom"
              >
                <i class="el-icon-connection"></i>
              </el-tooltip>
            </li>
          </ul>
        </div>
      </div>
      <div class="info" ref="info">
        <div class="link" v-if="showLink">
          <div class="topLink linkSection">
            <h4 class="linktitle">发现模型差异</h4>
            <ul>
              <li v-for="(item, index) in dashboardCompaire" :key="index">
                <el-tooltip
                  :content="item.modelCategory + '发现差异'"
                  effect="light"
                  placement="left"
                  :open-delay="300"
                  :popper-options="popperOptions"
                >
                  <span class="changeData" @click="handleSkipToData(item)">
                    {{ item.modelCategory }}发现差异
                  </span>
                </el-tooltip>
                <span class="job-time">{{ item.timestamp | timeFormat }}</span>
                <span class="data">{{ item.changeCnt }}项</span>
              </li>
            </ul>
          </div>
          <div class="bottomLink linkSection">
            <h4 class="linktitle">开发数据模型新版本</h4>
            <ul>
              <li v-for="(item, index) in dashboardDdmVersion" :key="index">
                <el-tooltip
                  :content="
                    item.modelName + '(' + item.versionName + ')' + item.creator
                  "
                  effect="light"
                  placement="left"
                  :open-delay="300"
                  :popper-options="popperOptions"
                >
                  <span
                    class="changeData version"
                    @click="handleSkipToModel(item)"
                  >
                    {{ item.modelName }} ({{ item.versionName }})
                    {{ item.creator }}
                  </span>
                </el-tooltip>
                <span class="data">{{ item.timestamp | timeFormat }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="node-detail" v-else>
          <datablau-catalog-detail
            v-if="nodeDetail && nodeDetail.type === 'rootCatalog'"
            :key="nodeDetail.id"
            :catalog-name="nodeDetail.label"
          ></datablau-catalog-detail>
          <datablau-table-detail
            v-else-if="nodeDetail && nodeDetail.type === 'table'"
            :key="nodeDetail.id"
            :catalog-name="nodeDetail.label"
            :objectId="nodeDetail.objId"
          ></datablau-table-detail>
          <datablau-catalog-detail
            v-else
            :key="nodeDetail.id"
            :catalog-name="nodeDetail.label"
          ></datablau-catalog-detail>
        </div>
      </div>
    </div>
    <div class="single-center-node" v-if="showNodeCenterMap && false">
      <div class="get-back-btn" @click="closeNodeCenterMap">
        <i class="fa fa-close"></i>
      </div>
    </div>
  </div>
</template>

<script>
import vis from 'vis'
// import moment from 'moment';
import defaultLineageNetwork from './defaultLineageNetwork.vue'
export default {
  data() {
    return {
      showOldNetwork: false,
      getLineageData: null,
      showLink: true,
      dashboardCompaire: [],
      dashboardDdmVersion: [],
      popperOptions: {},
      showPop: false,

      // asset network
      assetNetwrok: null,
      nodeTooltipDataArr: [
        // {
        //   name: '名称',
        //   scale: '规模',
        //   hot: '热度'
        // },
      ],
      idCount: 1,
      assetNetwrokMethodMap: {},
      clickTimer: null,
      typeIdMap: {
        rootNode: '1000',
        catalog: '1001',
        table: '1002',
        column: '1003',
      },
      showNodeCenterMap: false,
      entiryMapData: {},
      emptyText: '当前没有系统，不能展示系统关系，请先创建系统或导入系统名录。',
      loadingSystem: '数据加载中...',
      dataLoaded: false,
      nodeDetail: {},
    }
  },
  components: {
    defaultLineageNetwork,
  },
  computed: {},
  beforeMount() {
    this.showOldNetwork = this.$hideFunForRelease && false
    // this.showOldNetwork = this.$hideFunForRelease || true;
    this.showOldNetwork = this.$hideFunForRelease
  },
  mounted() {
    this.loadDashboardData()
    if (!this.showOldNetwork) {
      this.drawNetworkMap2()
    }
    if ($('#main-content')[0]) {
      this.popperOptions.boundariesElement = $('#main-content')[0]
    }
  },
  destroy() {
    this.assetNetwrokMethodMap.destroy && this.assetNetwrokMethodMap.destroy()
  },
  filters: {
    timeFormat(val) {
      let result = ''
      result = moment(val).format('YYYY-MM-DD HH:mm')
      return result
    },
  },
  methods: {
    handleSkipToModel(version) {
      const query = {
        modelId: version.referredModelId || version.modelId,
        branchId: version.modelId,
      }
      this.$router.push({
        name: 'ddm',
        query: query,
      })
    },
    handleSkipToData(model) {
      const query = {
        modelCategorylId: model.modelCategorylId,
        damModelId: model.damModelId,
      }
      this.$router.push({
        name: 'dataCatalog',
        query,
      })
    },
    redrawNetwork2() {
      this.drawNetworkMap2()
    },
    refreshDefLineageData() {
      const lineageDataUrl = this.$meta_url + '/service/lineage/overview'
      this.getLineageData = this.$http.get(lineageDataUrl)
    },
    // assetmap 相关
    getInitData() {
      let para = 'match(n:Catalog)-[r:SUBTYPE_OF*0..]-(m:Catalog) return n,r,m'
      para =
        'match(n:Catalog)-[r:SUBTYPE_OF]-(m:Catalog) return n,m,r,startNode(r) = n as n_src'
      // para = 'match(n:Catalog) optional match(n:Catalog)-[r:SUBTYPE_OF]-(m:Catalog)return n,m,r,startNode(r)=n as n_src';
      const dataPromise = this.$plainRequest.post(
        this.$url + '/service/graph/query',
        para
      )
      return dataPromise
    },
    drawNetworkMap2() {
      // get node edge data => nodeArr, nodeMap
      const dealData = ({
        allData,
        nodeMap,
        allNodeMap,
        nodeArr,
        formatNodeData,
        formatEdgeData,
        dupEdgeMap,
        edgeMap,
      }) => {
        allData.forEach(item => {
          let nodeS = null
          let nodeE = null
          if (item.n_src) {
            nodeS = item.m
            nodeE = item.n
          } else {
            nodeS = item.n
            nodeE = item.m
          }

          const nodeSData = formatNodeData(nodeS, allNodeMap)
          if (!nodeMap[nodeSData.id]) {
            nodeArr.push(nodeSData)
            nodeMap[nodeSData.id] = nodeSData
          }
          const nodeEData = formatNodeData(nodeE, allNodeMap)
          if (!nodeMap[nodeEData.id]) {
            nodeArr.push(nodeEData)
            nodeMap[nodeEData.id] = nodeEData
          }

          const dupKey = nodeSData.id + '/' + nodeEData.id
          if (!dupEdgeMap[dupKey]) {
            const edgeData = item.r
            const edge = formatEdgeData({
              id: edgeData.id,
              from: nodeSData.id,
              to: nodeEData.id,
            })
            edgeArr.push(edge)
            edgeMap[edge.id] = edge
            dupEdgeMap[dupKey] = edge
          }
        })
      }
      const rootNodeid = this.typeIdMap.rootNode + '001'
      const nodeArr = [] // node array
      const nodeMap = {} // id => node (show node)
      const allNodeMap = {} // include all nodes
      const nodeTree = [] // tree style data
      const edgeArr = [] // edge array
      const edgeMap = {} // id => edge
      const treeMap = {}
      const parentsMap = {}
      const dupEdgeMap = {}
      const maxValue = 30
      const minValue = 20
      let maxHot = 0
      let maxScal = 0
      let nodeSet = null
      let edgeSet = null

      let data = null
      let options = null
      let assetNetwrok = null

      const getColorByHot = (hotNum, maxHot) => {
        let percent = parseFloat(hotNum / maxHot) || 1
        percent = Math.random()
        const red = parseInt(86 + (255 - 86) * percent).toString(16)
        const green = parseInt(120 + (96 - 120) * percent).toString(16)
        const blue = parseInt(255 + (70 - 255) * percent).toString(16)
        const result = '#' + red + green + blue
        return result
      }
      const formatNodeData = (nodeData, map = allNodeMap) => {
        const type = nodeData.type
        let result = null
        if (type === 'ModelElement' && nodeData.typeId == '80000004') {
          result = {
            id: this.typeIdMap.table + nodeData.objectId,
            label: nodeData.alias || nodeData.name,
            belongTo: nodeData.belongTo,
            type: 'ModelElement',
            typeId: nodeData.typeId,
            objectId: nodeData.objectId,
            shape: 'icon',
            name: nodeData.name,
            icon: {
              face: 'FontAwesome',
              code: '\uf0ce',
              size: 35,
            },
          }
        } else if (type === 'Catalog') {
          result = {
            id: this.typeIdMap.catalog + nodeData.catalogId,
            label: nodeData.name,
            parentId: nodeData.parent
              ? this.typeIdMap.catalog + nodeData.parent.catalogId
              : null,
            type: 'Catalog',
            catalogId: nodeData.catalogId,
          }
        } else if (type === 'rootCatalog') {
          result = {
            id: nodeData.id,
            label: nodeData.name,
            type: 'rootCatalog',
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf015',
              size: 85,
              color: '#FCB100',
            },
          }
        } else if (type === 'clusteredCatalog') {
          result = _.cloneDeep(nodeData)
        }
        if (result.id) {
          map[result.id] = map[result.id] || result
          result = map[result.id]
        }
        return result
      }
      const formatEdgeData = edgeData => {
        let result = null
        result = {
          arrows: {
            to: { enabled: true, scaleFactor: 1, type: 'arrow' },
          },
          id: edgeData.id,
          from: edgeData.from,
          to: edgeData.to,
          // font: '12px arial #ff0000',
          // scaling:{
          //   label: true,
          // },
          // shadow: true,
          // smooth: true,
        }
        return result
      }
      // setLevel(nodeTree[0], 1);
      const setLevel = ({ node, level, nodeMap }) => {
        nodeMap[node.id].treeLevel = level
        const childLv = level + 1
        const children = node.children
        if (children && Array.isArray(children) && children.length > 0) {
          children.forEach(node2 => {
            setLevel({ node: node2, level: childLv, nodeMap })
          })
        }
      }
      const setHotScale = (attr, node, nodeMap) => {
        let resutlValue = 0
        const children = node.children
        if (children && Array.isArray(children) && children.length > 0) {
          children.forEach(node2 => {
            resutlValue += setHotScale(attr, node2, nodeMap)
          })
        } else {
          const ranNum = Math.random() * maxValue + minValue
          resutlValue = parseInt(ranNum)
        }
        if (nodeMap[node.id]) {
          nodeMap[node.id][attr] = resutlValue
        }
        return resutlValue
      }
      // 得到所有父级节点
      const getAllParents = (node, nodeMap) => {
        parentsMap[node.id] = parentsMap[node.id] || {}
        const addPar2arr = (tarnode, parnode) => {
          parentsMap[tarnode.id][parnode.id] = true
          if (nodeMap[parnode.parentId]) {
            const parnode2 = nodeMap[parnode.parentId]
            addPar2arr(tarnode, parnode2)
          }
        }
        if (node.parentId) {
          const parnode = nodeMap[node.parentId]
          addPar2arr(node, parnode)
        }
      }
      // 得到所有后代元素
      // let getAllChildren = (node, nodeMap, nodeTree) => {};
      // 将传入的node 的后代元素 按层级 cluster
      const clusterNode = ({
        node,
        nodeMap,
        treeMap,
        nodeTree,
        nodeSet,
        network,
        allNodeMap,
      }) => {
        // 将传入的node (id) 及它的子代 cluster, 如果它的子代有children, 子代分别聚类
        // node 有 id 属性的对象
        let resultId = null
        const nodeData = node && treeMap[node.id]
        const children = nodeData && treeMap[node.id].children
        const subTable = nodeData && treeMap[node.id].subTable
        if (
          nodeData &&
          ((children && children.length > 0) ||
            (subTable && subTable.length > 0))
        ) {
          const clusteredId = node.id + 'clustered'
          const childrenIdsArr = []
          children.forEach(child => {
            const path = network.findNode(child.id)
            let childClusteredId = null
            if (path.length > 1) {
              childClusteredId = path[0]
            } else {
              childClusteredId = clusterNode({
                node: child,
                nodeMap,
                treeMap,
                nodeTree,
                nodeSet,
                network,
                allNodeMap,
              })
            }
            childClusteredId && childrenIdsArr.push(childClusteredId)
          })

          const clusterNodeData = formatNodeData(
            {
              id: clusteredId,
              borderWidth: 1,
              label: node.label || node.name,
              size: node.size,
              color: node.color,
              title: node.label,
              type: 'clusteredCatalog',
              catalogId: node.catalogId,
            },
            allNodeMap
          )
          const clusterByIdOpt = {
            joinCondition: childOptions => {
              const result =
                childrenIdsArr.some(item => {
                  return item == childOptions.id
                }) || childOptions.id == node.id
              return result

              // let result = false;
              // if (childOptions.type === 'Catalog') {
              //   result = childrenIdsArr.some(item => {
              //     return item == childOptions.id;
              //   }) || childOptions.id == node.id;
              // } else if(childOptions.type === 'ModelElement' && childOptions.typeId == '80000004') {
              //   result = subTable.some(item => {
              //     return item == childOptions.id;
              //   });
              // }
              // return result;
            },
            processProperties: function (
              clusterOptions,
              childNodesOptions,
              childEdgesOptions
            ) {
              return clusterOptions
            },
            clusterNodeProperties: {
              id: clusteredId,
              borderWidth: 1,
              label: node.label || node.name,
              // shape: 'ellipse',
              size: node.size,
              color: node.color,
              title: node.label,
              type: 'clusteredCatalog',
              catalogId: node.catalogId,
            },
          }
          network.cluster(clusterByIdOpt)
          resultId = clusteredId
        } else if (node && node.id) {
          resultId = node.id
        }
        setTimeout(() => {
          network.stopSimulation()
          network.fit({
            animation: false,
          })
        }, 200)
        return resultId
      }
      // 打开所有 聚类的节点
      // node 为 id 的值
      const clusterOpenAll = ({
        node,
        nodeMap,
        treeMap,
        nodeTree,
        nodeSet,
        network,
      }) => {
        const path = network.findNode(node.id)
        if (path.length > 1 && network.isCluster(node.id + 'clustered')) {
          network.openCluster(node.id + 'clustered')
        }
        const nodeId = parseInt(node.id)
        const children = treeMap[nodeId].children
        if (children && Array.isArray(children) && children.length > 0) {
          children.forEach(child => {
            clusterOpenAll({
              node: child,
              nodeMap,
              treeMap,
              nodeTree,
              nodeSet,
              network,
            })
          })
        }
      }
      const toggleNodeCluster = (
        para,
        { nodeMap, treeMap, nodeTree, nodeSet, assetNetwrok }
      ) => {
        if (para.nodes.length === 1) {
          if (assetNetwrok.isCluster(para.nodes[0])) {
            assetNetwrok.openCluster(para.nodes[0])
          } else {
            return
            clusterNode({
              node: nodeMap[para.nodes[0]],
              nodeMap,
              treeMap,
              nodeTree,
              nodeSet,
              network: assetNetwrok,
              allNodeMap,
            })
          }
        }
        assetNetwrok.fit({
          animation: false,
        })
      }

      this.getInitData()
        .then(res => {
          const rootNode = formatNodeData(
            {
              id: rootNodeid,
              type: 'rootCatalog',
              name: '数据资产',
              treeLevel: 1,
              size: 50,
            },
            allNodeMap
          )
          nodeArr.push(rootNode)
          nodeMap[rootNode.id] = rootNode
          const allData = res.data
          // get node edge data => nodeArr, nodeMap
          dealData({
            allData,
            nodeMap,
            allNodeMap,
            nodeArr,
            formatNodeData,
            dupEdgeMap,
            formatEdgeData,
            edgeMap,
          })
          // get tree data => treeMap
          // console.log(Object.keys(treeMap).length, 'length1')
          nodeArr.forEach(node => {
            if (!treeMap[node.id]) {
              treeMap[node.id] = node
            }
          })
          // console.log(Object.keys(treeMap).length, 'length2')

          // get nodeTree
          nodeArr.forEach(node => {
            if (node.id === rootNode.id) return
            const obj = treeMap[node.id]
            if (
              node.parentId &&
              nodeMap[node.parentId] &&
              treeMap[node.parentId]
            ) {
              const parent = treeMap[node.parentId]
              if (!parent.children || !Array.isArray(parent.children)) {
                parent.children = []
              }
              parent.children.push(obj)
            } else {
              nodeTree.push(obj)
            }
          })

          nodeTree.forEach(node => {
            // set level, hot, scale
            setLevel({ node, level: 2, nodeMap })
            setHotScale('hot', node, nodeMap)
            setHotScale('scale', node, nodeMap)

            const edge = formatEdgeData({
              id: node.id + 'rootedge',
              from: rootNode.id,
              to: node.id,
            })
            edgeArr.push(edge)
            edgeMap[edge.id] = edge
          })

          nodeArr.forEach(node => {
            if (node.hot > maxHot) {
              maxHot = node.hot
            }
            if (node.scale > maxScal) {
              maxScal = node.scale
            }
            node.title = node.label
          })

          // set node options
          nodeArr.forEach(node => {
            node.size = 20 + parseInt((node.scale / maxScal) * 20) || 35
            // console.log(node, 'node')
            const color = getColorByHot(node.hot, maxHot)
            node.color = {
              background: color,
              highlight: {
                background: color,
                // border:
              },
              hover: {
                background: color,
              },
            }
            node.borderWidth = 0
            node.borderWidthSelected = 0
            // node.title = node.label;
          })
          nodeSet = new vis.DataSet(nodeArr)

          edgeSet = new vis.DataSet(edgeArr)

          data = {
            nodes: nodeSet,
            edges: edgeSet,
          }
          options = {
            edges: {
              arrows: 'to',
            },
            nodes: {
              shape: 'dot',
            },
            layout: {
              improvedLayout: false,
              // hierarchical: {
              //   direction: 'UD',
              //   assetNetwrok: true,
              //   edgeMinimization: true,
              //   sortMethod: 'directed',
              //   parentCentralization: true,
              // }
            },
            interaction: {
              hover: true,
              tooltipDelay: 100,
            },
            manipulation: {
              enabled: true,
            },
            physics: {
              enabled: true,
              // stabilization: {
              //   enabled: true,
              //   iterations: 30,
              //   updateInterval: 30,
              //   onlyDynamicEdges: false,
              //   fit: true
              // },
              timestep: 0.5,
              adaptiveTimestep: true,
            },
          }
          if (this.$refs.network2) {
            const containerDom = this.$refs.network2
            if (assetNetwrok) {
              assetNetwrok.destroy()
              assetNetwrok = null
            }
            assetNetwrok = new vis.Network(containerDom, data, options)
            // assetNetwrok.fit({
            //   animation: false
            // });

            // 绑定事件
            // 聚类
            const clusterByLevel = level => {
              const parentArr = []
              nodeArr.forEach(node => {
                if (node.treeLevel === level) {
                  parentArr.push(node)
                }
              })
              parentArr.forEach(parent => {
                clusterNode({
                  node: parent,
                  nodeMap,
                  treeMap,
                  nodeTree,
                  nodeSet,
                  network: assetNetwrok,
                  allNodeMap,
                })
              })
            }
            clusterByLevel(2)

            // click
            assetNetwrok.on('click', para => {
              if (this.clickTimer) {
                clearTimeout(this.clickTimer)
                this.clickTimer = null
              } else {
                this.clickTimer = setTimeout(() => {
                  // toggleNodeCluster(para, {nodeMap, treeMap, nodeTree, nodeSet, assetNetwrok});
                  if (para.nodes.length === 1) {
                    const nodeData = allNodeMap[para.nodes[0]]
                    let nodeType = null
                    let objId = null
                    // if ()
                    // let nodec = nodeSet.get(para.nodes[0])
                    // let nodeData = nodeMap[para.nodes[0]];
                    if (nodeData.type === 'clusteredCatalog') {
                      nodeType = 'Catalog'
                      objId = nodeData.catalogId
                    } else if (nodeData.type === 'catalog') {
                      nodeType = 'Catalog'
                      objId = nodeData.catalogId
                    } else if (
                      nodeData.type === 'ModelElement' &&
                      nodeData.typeId == '80000004'
                    ) {
                      nodeType = 'table'
                      objId = nodeData.objectId
                    }
                    this.showDetailData({
                      type: nodeType,
                      objId: objId,
                      label: nodeData.label,
                    })
                  } else {
                    this.hideDetailData()
                  }
                  this.clickTimer = null
                }, 300)
              }
            })

            // showPopup
            assetNetwrok.on('showPopup', para => {
              if (!this.showPop) {
                return
              }
              const nodeId = parseInt(para)
              const nodeData = nodeSet.get(nodeId)
              const children = nodeData.children
              const childrenLength = children ? children.length : 0
              const nodeTooltipData = {
                name: nodeData.label,
                scale: nodeData.scale,
                hot: nodeData.hot,
                id: nodeData.id,
                childrenLength: childrenLength,
              }
              this.nodeTooltipDataArr.push(nodeTooltipData)
              this.$nextTick(() => {
                const tooltipDom = $('#container .asset-network-tooltip')
                const tooltipContainer = $('#container .vis-tooltip')
                tooltipContainer.append(tooltipDom)
              })
            })
            assetNetwrok.on('hidePopup', para => {
              this.nodeTooltipDataArr = []
            })

            // 增加table 节点
            assetNetwrok.on('doubleClick', para => {
              if (para.nodes.length === 1) {
                toggleNodeCluster(para, {
                  nodeMap,
                  treeMap,
                  nodeTree,
                  nodeSet,
                  assetNetwrok,
                })

                const nodeId = para.nodes[0] ? parseInt(para.nodes[0]) : null
                const node = nodeId && nodeMap[nodeId]
                if (!node) return
                if (node.type === 'Catalog') {
                  this.getTableByCatalog(node.catalogId)
                    .then(res => {
                      const newData = res.data
                      if (Array.isArray(newData) && newData.length > 0) {
                        const nodeArr = []
                        const edgeArr = []
                        newData.forEach(item => {
                          const catalogData = formatNodeData(
                            item.catalog,
                            allNodeMap
                          )
                          const catalogNode = nodeSet.get(catalogData.id)
                          const table = item.table
                          const nodeData = formatNodeData(table, allNodeMap)
                          catalogNode.subTable = catalogNode.subTable || []
                          catalogNode.subTable.push(nodeData.id)
                          if (!nodeMap[nodeData.id]) {
                            nodeMap[nodeData.id] = nodeData
                            nodeArr.push(nodeData)
                            // nodeSet.add(nodeData);
                          }
                          const dupKey = catalogData.id + '/' + nodeData.id
                          if (!dupEdgeMap[dupKey]) {
                            const rel = item.relation
                            const edgeData = formatEdgeData({
                              id: rel.id,
                              from:
                                this.typeIdMap.catalog + item.catalog.catalogId,
                              to: this.typeIdMap.table + table.objectId,
                            })
                            dupEdgeMap[dupKey] = edgeData
                            edgeArr.push(edgeData)
                            // edgeSet.add(edgeData);
                          }
                        })
                        nodeSet.add(nodeArr)
                        edgeSet.add(edgeArr)
                      }
                      // stabilize
                      assetNetwrok.stabilize()
                    })
                    .catch(e => {
                      this.$showFailure(e)
                    })
                } else if (node && node.type === 'ModelElement') {
                  if (node.typeId == '80000004') {
                    const nodeData = allNodeMap[node.id]
                    // console.log(nodeData, 'nodeData')
                    this.showTableDetail({
                      objectId: nodeData.objectId,
                      alias: nodeData.label,
                      name: nodeData.name,
                      type: 'meta',
                    })
                  }
                }
              }
            })

            // network 回调函数
            this.assetNetwrokMethodMap = {
              // assetNetwrok,
              fit() {
                assetNetwrok.fit()
              },
              showAllCatalog() {
                nodeTree.forEach(node => {
                  clusterOpenAll({
                    node,
                    nodeMap,
                    treeMap,
                    nodeTree,
                    nodeSet,
                    network: assetNetwrok,
                  })
                })
              },
              destroy() {
                assetNetwrok && assetNetwrok.destroy && assetNetwrok.destroy()
                assetNetwrok = null
              },
            }

            // assetNetwrok.on("afterDrawing", function (ctx) {
            //   var nodeId = 10;
            //   var nodePosition = assetNetwrok.getPositions([nodeId]);
            //   ctx.strokeStyle = '#294475';
            //   ctx.lineWidth = 4;
            //   ctx.fillStyle = '#A6D5F7';
            //   ctx.circle(nodePosition[nodeId].x, nodePosition[nodeId].y,20);
            //   ctx.fill();
            //   ctx.stroke();
            // });
          }

          this.dataLoaded = true
        })
        .catch(e => {
          // this.$showFailure(e);
          console.log(e)
        })
    },
    getTableByCatalog(catalogId) {
      // match(m:Catalog)-[r:BELONG_TO]-(n:ModelElement) where m.catalog_id = 12 return m as catalog, r as relation, n as table

      const para = `match(m:Catalog)-[r:BELONG_TO]-(n:ModelElement) where m.catalog_id = ${catalogId} return m as catalog, r as relation, n as table`
      const dataPromise = this.$plainRequest.post(
        this.$url + '/service/graph/query',
        para
      )
      return catalogId && dataPromise
    },
    network2Fit() {
      this.assetNetwrokMethodMap.fit()
    },
    showAllCatalog() {
      this.assetNetwrokMethodMap.showAllCatalog()
    },
    showDetailData(data) {
      // console.log(data, 'data')
      this.showLink = false
      this.nodeDetail = data
    },
    hideDetailData() {
      this.showLink = true
    },
    showTableDetail(para) {
      this.showNodeCenterMap = true
      this.entiryMapData = para
      // console.log(this.entiryMapData, 'this.entiryMapData')
    },
    closeNodeCenterMap(para) {
      this.showNodeCenterMap = false
    },
    loadDashboardData() {
      this.$http
        .get(this.$url + '/service/dashboard/modelCompare?size=7')
        .then(res => {
          this.dashboardCompaire = res.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.$http
        .get(this.$url + '/service/dashboard/latestDdmVersions?size=7')
        .then(res => {
          this.dashboardDdmVersion = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.datacatalog-network {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  .grah.networkrow {
    height: 100%;
  }
  .networkrow {
    display: flex;
    align-content: space-around;
    align-content: stretch;
    .outnetwork {
      /*flex-grow: 20;*/
      margin-right: 12px;
      width: 100%;
    }
    .info {
      display: none;
      /*width: 100px;*/
      /*flex-grow: 20;*/
      flex-grow: 0;
    }
  }
  .network-card {
    height: 100%;
    // min-height: 680px;
    background-color: var(--default-bgc);
    color: var(--ddc-header-color);
    position: relative;
    .network {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      p {
        display: inline-block;
        color: #aaa;
        font-size: 25px;
        padding-top: 20%;
      }
    }
    .control {
      position: absolute;
      bottom: 0;
      right: 0;
      border: 1px solid #aaa;
    }
  }
  .outnetwork {
    position: relative;
    .visControl {
      position: absolute;
      top: 5px;
      right: 5px;
      li {
        display: inline-block;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid #aaa;
        i {
          display: block;
          text-align: center;
          line-height: 30px;
          font-size: 20px;
        }
      }
    }
    &.asset-map {
      .vis-tooltip {
        position: absolute;
        // width: 1px;
        font-size: 0;
        .asset-network-tooltip {
          padding: 20px;
          font-size: 15px;
          min-width: 250px;
          background-color: #fff;
          box-shadow: 0px 0px 8px #aaa;
        }
      }
    }
  }
}
</style>
