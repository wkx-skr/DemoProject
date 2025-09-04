<template>
  <div class="process-design-container">
    <div class="fd-nav">
      <div class="fd-nav-left">
        <div class="fd-nav-back" @click="toReturn">
          <i class="el-icon-arrow-left"></i>
        </div>
        <div class="fd-nav-title">{{ processName || '编辑流程' }}</div>
      </div>
      <div class="fd-nav-right">
        <button type="button" class="ant-btn button-publish" @click="saveSet">
          <span>保 存</span>
        </button>
      </div>
    </div>
    <div class="fd-nav-content" v-if="showProcess">
      <section class="dingflow-design">
        <div class="zoom">
          <div
            :class="'zoom-out' + (nowVal == 50 ? ' disabled' : '')"
            @click="zoomSize(1)"
          ></div>
          <span>{{ nowVal }}%</span>
          <div
            :class="'zoom-in' + (nowVal == 300 ? ' disabled' : '')"
            @click="zoomSize(2)"
          ></div>
        </div>
        <div
          class="box-scale"
          id="box-scale"
          :style="
            'transform: scale(' +
            nowVal / 100 +
            '); transform-origin: 50% 0px 0px;'
          "
        >
          <node-wrap
            :nodeConfig.sync="nodeConfig"
            :flowPermission.sync="flowPermission"
            :isTried.sync="isTried"
            :directorMaxLevel="directorMaxLevel"
            :tableId="tableId"
            :formData="formData"
            :formatCondition="formatCondition"
          ></node-wrap>
          <div class="end-node">
            <div class="end-node-circle"></div>
            <div class="end-node-text">流程结束</div>
          </div>
        </div>
      </section>
    </div>
    <el-dialog title="提示" :visible.sync="tipVisible" append-to-body>
      <div class="ant-confirm-body">
        <i class="anticon anticon-close-circle" style="color: #f00"></i>
        <span class="ant-confirm-title">当前无法发布</span>
        <div class="ant-confirm-content">
          <div>
            <p class="error-modal-desc">以下内容不完善，需进行修改</p>
            <div class="error-modal-list">
              <div
                class="error-modal-item"
                v-for="(item, index) in tipList"
                :key="index"
              >
                <div class="error-modal-item-label">流程设计</div>
                <div class="error-modal-item-content">
                  {{ item.name }} 未选择{{ item.type }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="tipVisible = false">我知道了</el-button>
        <el-button type="primary" @click="tipVisible = false">
          前往修改
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
/**
  https://github.com/StavinLi/Workflow
  开源项目地址
 */
import nodeWrap from './nodeWrap'
import HTTP from '@/http/main.js'
export default {
  components: {
    nodeWrap,
  },
  data() {
    return {
      nodeDefaultProps: {
        pkId: '',
        nodeName: '',
        type: 0,
        priorityLevel: '',
        settype: '',
        selectMode: '',
        selectRange: '',
        examineRoleId: '',
        directorLevel: '',
        replaceByUp: '',
        examineMode: '',
        noHanderAction: '',
        examineEndType: '',
        examineEndRoleId: '',
        examineEndDirectorLevel: '',
        ccSelfSelectFlag: '',
        conditionList: [],
        nodeUserList: [],
        childNode: '',
        conditionNodes: [],
      },
      showProcess: false,
      sidCount: 1,
      processConfig: {},
      nodeMap: null,
      // old code
      isTried: false,
      tipList: [],
      tipVisible: false,
      nowVal: 100,
      nodeConfig: {},
      workFlowDef: {},
      flowPermission: [],
      directorMaxLevel: 0,
      dialogVisible: true,
      tableId: '',
    }
  },
  props: {
    processId: {
      type: [String, Number],
      required: true,
    },
    formData: {
      type: Array,
      default() {
        return []
      },
    },
    processName: {
      type: String,
      default: '编辑流程',
    },
  },
  created() {
    this.dataInit()
  },
  mounted() {
    $('html').addClass('show-design-process')
  },
  destroyed() {
    $('html').removeClass('show-design-process')
  },
  methods: {
    dataInit() {
      HTTP.getProcessDetail({ processId: this.processId })
        .then(res => {
          // this.processConfig = res.data;
          // this.nodeConfig = this.processConfig.nodeConfig;
          // this.flowPermission = this.processConfig.flowPermission;
          // this.directorMaxLevel = this.processConfig.directorMaxLevel;
          // this.workFlowDef = this.processConfig.workFlowDef
          // this.tableId = this.processConfig.tableId

          const data = res.data
          this.processConfig = this.processConfigTrans(data)

          this.showProcess = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formatCondition(condition) {
      if (condition.useElExp) {
        const el = condition.conditionList[0].el
        return {
          el: el,
          str: el,
        }
      }
      let arr = []
      const conditionList = condition.conditionList
      if (conditionList && Array.isArray(conditionList)) {
        arr = conditionList.map(item => {
          let el = ''
          let str = ''
          const showName = item.showName // 中文名
          const columnDbname = item.columnDbname // code
          const showType = item.showType // 类型
          // showType 1 发起人, 2 double 3 枚举值 4 字符串 5 Boolean 6 data
          if (showType === 1) {
            // TODO
            el = '发起人为'
            str = '发起人为'
          } else if (showType === 2) {
            let opt1 = []
            let opt2 = []
            switch (item.optType) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                const optArr = [
                  {},
                  { name: '小于', opt: '<' },
                  { name: '小于等于', opt: '<=' },
                  { name: '等于', opt: '==' },
                  { name: '大于等于', opt: '>=' },
                  { name: '大于', opt: '>' },
                ]
                el = `${columnDbname} ${optArr[item.optType].opt} ${item.zdy1}`
                str = `${showName}${optArr[item.optType].name}${item.zdy1}`
                break
              case 6:
                opt1 = []
                opt2 = []
                if (item.opt1 === 1) {
                  opt1 = ['>', '大于']
                } else {
                  opt1 = ['>=', '大于等于']
                }
                if (item.opt2 === 1) {
                  opt2 = ['<', '小于']
                } else {
                  opt2 = ['<=', '小于等于']
                }
                el = `${columnDbname} ${opt1[0]} ${item.zdy1} && ${columnDbname} ${opt2[0]} ${item.zdy2}`
                str = `${showName}${opt1[1]}${item.zdy1}并且${showName}${opt2[1]}${item.zdy2}`
                break
              case 7:
                opt1 = []
                opt2 = []
                if (item.opt1 === 1) {
                  opt1 = ['<', '小于']
                } else {
                  opt1 = ['<=', '小于等于']
                }
                if (item.opt2 === 1) {
                  opt2 = ['>', '大于']
                } else {
                  opt2 = ['>=', '大于等于']
                }
                el = `${columnDbname} ${opt1[0]} ${item.zdy1} || ${columnDbname} ${opt2[0]} ${item.zdy2}`
                str = `${showName}${opt1[1]}${item.zdy1}或者${showName}${opt2[1]}${item.zdy2}`
                break
            }
          } else if (showType === 3) {
            const choosedValue = item.choosedValue
            let elArr = []
            if (choosedValue && Array.isArray(choosedValue)) {
              elArr = choosedValue.map(item => `${columnDbname} eq '${item}'`)
              el = `${elArr.join(' || ')}`
              str = `${showName}属于${choosedValue.join('，')}`
            }
          } else if (showType === 4) {
            const optType = item.optType
            const optArr = []
            const choosedValue = item.choosedValue
            let elArr = []
            if (choosedValue && Array.isArray(choosedValue)) {
              if (item.optType === 1) {
                elArr = choosedValue.map(item => `${columnDbname} eq '${item}'`)
                el = `${elArr.join(' || ')}`
                str = `${showName}属于${choosedValue.join('，')}`
              } else {
                elArr = choosedValue.map(item => `${columnDbname} ne '${item}'`)
                el = `${elArr.join(' && ')}`
                str = `${showName}不属于${choosedValue.join('，')}`
              }
            }
          } else if (showType === 5) {
            if (item.zdy1 === 'true') {
              str = `${showName}为真`
              el = `${columnDbname} eq 'true'`
            } else {
              str = `${showName}为假`
              el = `${columnDbname} ne 'true'`
            }
          } else if (showType === 6) {
            const optType = item.optType
            let t1 = this.$timeFormatter(item.zdy1)
            let t2 = ''
            if (optType === 1) {
              el = `${columnDbname} < ${item.zdy1}`
              str = `${showName}早于${t1}`
            } else if (optType === 2) {
              el = `${columnDbname} > ${item.zdy1}`
              str = `${showName}晚于${t1}`
            } else if (optType === 6) {
              const choosedValue = item.choosedValue
              if (
                choosedValue &&
                Array.isArray(choosedValue) &&
                choosedValue.length > 1
              ) {
                t1 = this.$timeFormatter(choosedValue[0])
                t2 = this.$timeFormatter(choosedValue[1])
                el = `${columnDbname} > ${choosedValue[0]} && ${columnDbname} < ${choosedValue[1]}`
                str = `${showName}晚于${t1}早于${t2}`
              }
            } else if (optType === 7) {
              const choosedValue = item.choosedValue
              if (
                choosedValue &&
                Array.isArray(choosedValue) &&
                choosedValue.length > 1
              ) {
                t1 = this.$timeFormatter(choosedValue[0])
                t2 = this.$timeFormatter(choosedValue[1])
                el = `${columnDbname} < ${choosedValue[0]} || ${columnDbname} > ${choosedValue[1]}`
                str = `${showName}早于${t1}或者晚于${t2}`
              }
            }
          }
          return {
            el: el,
            str: str,
          }
        })
      }
      const result = {
        el: arr.map(item => `(${item.el})`).join(' && ') || '',
        str: arr.map(item => item.str).join('，并且') || '',
      }
      return result
    },
    toReturn() {
      // window.location.href = ""
      this.$emit('toReturn')
    },
    processConfigTrans(data) {
      let processConfig = null
      // let processData = sessionStorage.getItem('processData')
      let processData = ''
      if (processData) {
        processData = JSON.parse(processData) || {}
        processConfig = processData.processConfig || '{}'
        processConfig = JSON.parse(processConfig)
      } else {
        const defnodeConfig = {}

        const nodeConfig = this.getNode({
          pkId: 'sid-start-node',
          nodeName: '发起人',
          type: 0,
        })
        processConfig = {
          tableId: 1,
          workFlowVersionId: 1,
          workFlowDef: {
            name: this.processName,
            publicFlag: 1,
            sortNo: 1,
            duplicateRemovelFlag: 1,
            optionTip: 1,
            optionNotNull: 0,
            status: 1,
          },
          directorMaxLevel: [],
          flowPermission: [],
          nodeConfig: nodeConfig,
        }
      }
      this.processConfig = processConfig
      this.nodeConfig = processConfig.nodeConfig || ''
      return processConfig
    },
    processConfigReTrans() {
      const processConfig = this.processConfig
      const nodeConfig = processConfig.nodeConfig
      const nodeJson = []
      this.nodeMap = new Map()
      this.sidCount = 1
      const parent = []
      const tree = this.getTreeNode(nodeConfig)
      return tree
    },
    getTreeNode(node) {
      if (!node) {
        return null
      }
      const type = node.type
      const sid = `_${this.sidCount}`
      this.sidCount++
      let conditionNodes = node.conditionNodes || []
      let childNode = node.childNode
      let nodeUserList = node.nodeUserList || []
      nodeUserList = nodeUserList.map(item => item.targetId)
      let assignee = ''
      if (nodeUserList.length === 1) {
        assignee = nodeUserList[0]
      }
      conditionNodes = conditionNodes.map(item => {
        return this.getTreeNode(item)
      })
      childNode = this.getTreeNode(childNode)
      const obj = {
        sid,
        assignee: assignee,
        candidateUsers: nodeUserList,
        department: '',
        name: node.nodeName,
        conditionNodes: conditionNodes,
        childNode: childNode,
        condition: '',
        type: '',
      }

      if (type === 0) {
        obj.type = 'START'
      } else if (type === 1) {
        // 审核人
        obj.type = 'GENERAL'
      } else if (type === 3) {
        // 条件
        obj.type = 'CONDITION_LINE'
        obj.condition = this.formatCondition(node).el || ''
      } else if (type === 4) {
        // 路由
        obj.type = 'EXCLUSIVE_GATEWAY'
      }
      // if (node.childNode === null && type !== 4) {
      //   // 最后一个元素, 后边就是结束
      //   if (conditionNodes.length > 0) {
      //     // 将结束节点添加到条件节点之后
      //   } else {
      //     // 直接添加结束节点
      //   }
      // }

      this.nodeMap.set(this.sidCount, obj)
      // arr.push(obj)
      return obj
    },
    getNode(para) {
      const node = _.clone(this.nodeDefaultProps)
      for (const key in para) {
        node[key] = para[key]
      }
      return node
    },
    reErr(data) {
      if (data.childNode) {
        if (data.childNode.type == 1) {
          // 审批人
          if (data.childNode.error) {
            this.tipList.push({
              name: data.childNode.nodeName,
              type: '审核人',
            })
          }
          this.reErr(data.childNode)
        } else if (data.childNode.type == 2) {
          if (data.childNode.error) {
            this.tipList.push({
              name: data.childNode.nodeName,
              type: '抄送人',
            })
          }
          this.reErr(data.childNode)
        } else if (data.childNode.type == 3) {
          this.reErr(data.childNode.childNode)
        } else if (data.childNode.type == 4) {
          this.reErr(data.childNode)
          for (var i = 0; i < data.childNode.conditionNodes.length; i++) {
            if (data.childNode.conditionNodes[i].error) {
              this.tipList.push({
                name: data.childNode.conditionNodes[i].nodeName,
                type: '条件',
              })
            }
            this.reErr(data.childNode.conditionNodes[i])
          }
        }
      } else {
        data.childNode = null
      }
    },
    saveSet() {
      const nodeTree = this.processConfigReTrans()
      const processConfig = JSON.stringify(this.processConfig)
      const requestBody = {
        id: this.processId,
        nodeTree,
        processConfig,
        // type: '',
      }
      // sessionStorage.setItem('processData', JSON.stringify(requestBody))
      HTTP.saveProcessDesign({ requestBody })
        .then(res => {
          this.$emit('forceReturn')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // this.isTried = true;
      // this.tipList = [];
      // this.reErr(this.nodeConfig);
      // if (this.tipList.length != 0) {
      //   this.tipVisible = true;
      //   return;
      // }
      // this.processConfig.flowPermission = this.flowPermission;
      // this.$emit("saveSet", this.processConfig);
    },
    zoomSize(type) {
      if (type == 1) {
        if (this.nowVal == 50) {
          return
        }
        this.nowVal -= 10
      } else {
        if (this.nowVal == 300) {
          return
        }
        this.nowVal += 10
      }
    },
  },
  watch: {
    processId(newVal) {
      this.dataInit()
    },
  },
}
</script>
<style lang="scss">
@import './workflow.scss';
.process-design-container {
  @import './override-element-ui.scss';

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333333;
  // margin-top: 60px;
  .clear:before,
  .clear:after {
    content: ' ';
    display: table;
  }
  .clear:after {
    clear: both;
  }
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .l {
    float: left;
  }
  input {
    text-indent: 10px;
  }
  select {
    text-indent: 8px;
  }
  .ml_10 {
    margin-left: 10px;
  }
  .mr_10 {
    margin-right: 10px;
  }
  .radio_box a,
  .check_box a {
    font-size: 12px;
    position: relative;
    padding-left: 20px;
    margin-right: 30px;
    cursor: pointer;
    color: #333;
    white-space: pre;
  }
  .check_box.not a:hover {
    color: #333;
  }
  .check_box.not a::before,
  .check_box.not a:hover::before {
    border: none;
  }
  .check_box.not.active {
    background: #f3f3f3;
  }
  .radio_box a:hover::before,
  .check_box a:hover::before {
    border: 1px solid #46a6fe;
  }
  .radio_box a::before,
  .check_box a::before {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1px solid #dcdfe6;
    border-radius: 2px;
    left: 0;
    top: 1px;
    content: '';
  }
  .radio_box a::before {
    border-radius: 50%;
  }
  .check-dot.active::after,
  .radio_box a.active::after,
  .check_box a.active::after {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    content: '';
  }
  .radio_box a.active::after {
    background: #46a6fe;
  }
  .check_box a.active::after {
    background: url(./images/check_box.png) no-repeat center;
  }
  .error-modal-list {
    width: 455px;
  }

  .fd-nav {
    .el-icon-arrow-left,
    .fd-nav-title {
      line-height: 60px;
    }
  }
  .el-button--primary {
    color: #fff;
  }
}
</style>
