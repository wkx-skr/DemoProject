<template>
    <div class="diagram-details">
      <div class="header-wrapper" style="padding-left: 6px;">
        <img width="14" :src="diagramImg" alt="" style="margin-right: 4px;">
        <h2>主题域</h2>
      </div>
      <div class="content-wrapper">
        <div class="item">
          <span class="title">主题域名称</span><el-input key="1" size="mini" style="width: 475px;" v-model="diagram.Name"></el-input>
        </div>
        <div class="item">
          <span class="title" style="top: -20px;">定义</span>
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            show-word-limit
            resize="none"
            size="mini"
            key="2"
            style="width: 475px;"
            v-model="diagram.Definition"></el-input>
        </div>
        <div class="item">
          <datablau-tabs v-model="udpTab">
            <el-tab-pane label="自定义属性" name="first">
            </el-tab-pane>
            <template  v-for="page of udpMessagePageDisplay.keys()">
              <el-tab-pane :label="page" :name="page" :key="page">
              </el-tab-pane>
            </template>
          </datablau-tabs>
          <div v-if="udpTab === 'first'" style="position: absolute;top: 220px;bottom: 20px;left: 20px;right: 20px;overflow-y: auto;overflow-x: hidden">
            <div :key="key" v-for="key in udpMessageDisplay.keys()">
              <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;margin-bottom: 5px;">{{key}}</h2>
              <udp-setting :currentModel="currentModel" :type="80000006" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="true" :request-body="diagram">
              </udp-setting>
            </div>
          </div>
          <div v-else :key="page" v-for="page of udpMessagePageDisplay.keys()">
            <div v-if="udpTab === page" style="position: absolute;top: 220px;bottom: 20px;left: 20px;right: 20px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessagePageDisplay.get(page).keys()">
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;margin-bottom: 5px;">{{key}}</h2>
                <udp-setting :currentModel="currentModel" :type="80000006" :udp-map="udpMessagePageDisplay.get(page).get(key)" :data-by-type="dataByType" :edit-mode="true" :request-body="diagram">
                </udp-setting>
              </div>
            </div>
          </div>
          <!--<div style="margin-top: 10px;margin-bottom: 10px;">自定义属性</div>
          <div style="position: absolute;top: 200px;bottom: 20px;left: 20px;right: 20px;overflow: auto;">
            <div
              v-for="(u,k) in udpMessageDisplay"
              :key="k"
              class="property udp">
              <span class="title label">{{dataByType.udp.get(Number.parseInt(k)).FriendlyName}}</span>
              <span class="value">
                <el-select
                  :key="k"
                  v-model="diagram.allUdps[k]"
                  v-if="dataByType.udp.get(Number.parseInt(k)).Enum"
                  size="mini"
                >
                  <el-option
                    v-for="o in dataByType.udp.get(Number.parseInt(k)).Enum.split(';').filter(i => i !== '')"
                    :key="o"
                    :value="o"
                    :label="o"
                  ></el-option>
                </el-select>
                <udp-validater-input
                  v-else
                  :key="k"
                  :value="diagram.allUdps[k]"
                  @update="updateUdpValue(diagram.allUdps, k, $event)"
                  :udp="dataByType.udp.get(Number.parseInt(k))"
                >
                </udp-validater-input>
              </span>
            </div>
          </div>-->
        </div>

      </div>

    </div>
</template>

<script>
import _ from 'lodash'
// import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import diagramImg from '@/assets/images/mxgraphEdit/diagram1.svg'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'

export default {
  name: 'diagram',
  props: ['diagramCopy', 'diagrams', 'Changes', 'dataByType', 'currentModel', 'mapIdToDiagramData'],
  components: {
    // udpValidaterInput
    udpSetting
  },
  data () {
    return {
      diagramImg,
      udpMessage: {},
      diagram: { ...this.diagramCopy },
      udpTab: 'first'
    }
  },
  computed: {
    udpMessageDisplay () {
      const udpMessage = this.udpMessage
      const udpMessageDisplay = new Map()
      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000006)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        if (udpMessage[k] !== undefined) {
          if (!udpDetail.PageName) {
            let obj = udpMessageDisplay.get(udpDetail.ClassName || '')
            if (obj) {
              obj.set(k, udpMessage[k])
            } else {
              udpMessageDisplay.set(udpDetail.ClassName || '', new Map([[k, udpMessage[k]]]))
            }
          }
        }
      })
      return udpMessageDisplay
    },
    udpMessagePageDisplay () {
      const udpMessage = this.udpMessage
      const udpMessagePageDisplay = new Map()

      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000006)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        if (udpMessage[k] !== undefined) {
          if (udpDetail.PageName) {
            let pageMap = udpMessagePageDisplay.get(udpDetail.PageName)
            if (pageMap) {
              let obj = pageMap.get(udpDetail.ClassName || '')
              if (obj) {
                obj.set(k, udpMessage[k])
              } else {
                pageMap.set(udpDetail.ClassName || '', new Map([[k, udpMessage[k]]]))
              }
            } else {
              udpMessagePageDisplay.set(udpDetail.PageName, new Map([[udpDetail.ClassName || '', new Map([[k, udpMessage[k]]])]]))
            }
          }
        }
      })
      return udpMessagePageDisplay
    }
  },
  mounted () {
    this.prepareTableUdps(this.diagram)
    this.preName = this.diagram.Name
    this.preDefinition = this.diagram.Definition
  },
  methods: {
    findSameName (diagrams, name, id) {
      if (diagrams.some(item => item.Name === name && item.Id !== id)) {
        return true
      } else if (diagrams.some(item => item.children && this.findSameName(item.children, name, id))) {
        return true
      } else {
        return false
      }
    },
    save () {
      if (!this.diagram.Name) {
        this.$datablauMessage.error('主题域名称必填')
        return null
      }
      if (this.findSameName(this.diagrams, this.diagram.Name, this.diagram.Id)) {
        this.$datablauMessage.error('主题域名称重名，请修改')
        return null
      }
      let changes = []
      if (this.preName !== this.diagram.Name || this.preDefinition !== this.diagram.Definition || JSON.stringify(this.allUpdsInital) !== JSON.stringify(this.diagram.allUdps)) {
        let realDiagram = null
        if (this.mapIdToDiagramData[this.diagram.Id]) {
          realDiagram = this.mapIdToDiagramData[this.diagram.Id]
        } else {
          realDiagram = this.diagrams.find(diagram => diagram.Id === this.diagram.Id)
        }
        Object.assign(realDiagram, this.diagram.allUdps)
        realDiagram.Name = this.diagram.Name
        realDiagram.Definition = this.diagram.Definition
        this.$set(realDiagram, 'changed', true)
        let change = new (this.Changes)('modifyDiagram', {
          id: this.diagram.Id,
          name: this.diagram.Name,
          pre: _.cloneDeep(this.diagramCopy),
          now: _.cloneDeep(realDiagram)
        })
        changes.push(change)
      }
      return changes
    },
    updateUdpValue (obj, index, value) {
      this.$set(obj, index, value)
    },
    prepareTableUdps (diagram) {
      let model = _.clone(diagram)
      let tableUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000006) {
          tableUdps.add(item.Id)
        }
      })
      for (let k in model) {
        if (typeof Number.parseInt(k) === 'number' && !isNaN(Number.parseInt(k))) {
        } else {
          delete model[k]
        }
      }
      tableUdps.forEach(item => {
        if (!model[item]) {
          model[item] = ''
        }
      })
      this.$set(diagram, 'allUdps', {})
      for (let index in model) {
        // diagram.allUdps[index] = model[index]
        this.$set(diagram.allUdps, index, model[index])
      }
      this.allUpdsInital = _.cloneDeep(diagram.allUdps)
      this.udpMessage = model
      this.$set(this, 'udpMessage', model)
      return {
        udpMessage: model
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-input__count {
    bottom: 9px;
  }
  /deep/ .el-dialog .el-textarea__inner {
    height: auto!important;
  }
  .header-wrapper {
    padding: 0 0 10px!important;
    h2 {
      font-size: 14px;
      line-height: 1;
      color: #555;
      padding-left: 6px;
    }
  }
  .content-wrapper {
    padding: 10px 0 10px 0;
    line-height: 1;
    font-size: 12px;
    color: #555;
    .item {
      padding-bottom: 20px;
      .title {
        position: relative;
        top: 2px;
        display: inline-block;
        width: 82px;
        text-align: right;
        padding-right: 12px;
        box-sizing: border-box;
      }
    }
    .line {
      border-bottom: 1px solid #D8D8D8;
    }
  }
  .property {
    width: 30%;
    .label {
      font-size: 12px;
      font-weight: 400;
      color: #555555;
      line-height: 30px;
    }
    &.thin {
      width: 180px;
    }
    &.udp {
      display: block;
      width: auto;
      max-width: unset;
      margin-right: unset;
      min-height: unset;
      height: 34px;
      &:last-of-type {
        .label {
          border-bottom:1px solid #DDDDDD;
        }
      }
      .label {
        vertical-align: top;
        padding-left: 10px;
        width: 200px;
        height: 34px;
        background: #F5F5F5;
        border-radius: 2px 0px 0px 0px;
        border: 1px solid #DDDDDD;
        border-bottom: unset;
      }
      .value {
        vertical-align: top;
        width: 250px;
        height: 34px;
        position: relative;
        top: 2px;
        .el-input {
          display: inline-block;
          width: 250px;
          height: 34px;
        }
        .el-input-number {
          width: 250px;
        }
        /deep/ .el-input__inner {
          width: 250px;
          height: 34px;
          line-height: 34px;
        }
        /deep/ .el-input-number__decrease {
          height: 34px;
        }
        /deep/ .el-input-number__increase {
          height: 34px;
        }
      }
    }
  }
</style>
