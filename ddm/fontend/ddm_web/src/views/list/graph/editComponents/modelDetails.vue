<template>
    <div>
      <div class="header-wrapper">
        <span class="tree-icon model"></span>
        <h2>模型</h2>
      </div>
      <div class="content-wrapper">
        <div class="item">
          <span class="title">{{model.branch ?  '分支名称' : '模型名称'}}</span><span :title="model.Name"><datablau-input disabled key="1" size="mini" style="width: 479px;" v-model="model.Name"></datablau-input></span>
        </div>
        <div class="item">
          <span class="title" style="vertical-align: top;top: 10px;">定义</span>
          <el-input  type="textarea"
             :autosize="{ minRows: 2, maxRows: 4 }"
             show-word-limit
             resize="none"
             size="mini"
             key="2"
             style="width: 479px;"
             v-model="model.Definition"></el-input>
        </div>
        <div class="item">
          <datablau-tabs v-model="udpTab">
            <el-tab-pane label="自定义属性" name="first">
            </el-tab-pane>
            <template v-for="page of udpMessagePageDisplay.keys()">
              <el-tab-pane :label="page" :name="page" :key="page">
              </el-tab-pane>
            </template>
          </datablau-tabs>
          <div v-if="udpTab === 'first'" style="position: absolute;top: 220px;bottom: 20px;left: 20px;right: 20px;overflow-y: auto;overflow-x: hidden">
            <div :key="key" v-for="key in udpMessageDisplay.keys()">
              <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;margin-bottom: 5px;">{{key}}</h2>
              <udp-setting :type="80000000" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="true" :request-body="model">
              </udp-setting>
            </div>
          </div>
          <div v-else :key="page" v-for="page of udpMessagePageDisplay.keys()">
            <div v-if="udpTab === page" style="position: absolute;top: 220px;bottom: 20px;left: 20px;right: 20px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessagePageDisplay.get(page).keys()">
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;margin-bottom: 5px;">{{key}}</h2>
                <udp-setting :type="80000000" :udp-map="udpMessagePageDisplay.get(page).get(key)" :data-by-type="dataByType" :edit-mode="true" :request-body="model">
                </udp-setting>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
</template>

<script>
import _ from 'lodash'
// import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'

export default {
  name: 'diagram',
  props: ['modelData', 'Changes', 'dataByType'],
  components: {
    // udpValidaterInput,
    udpSetting
  },
  data () {
    return {
      udpMessage: {},
      model: _.cloneDeep(this.modelData),
      udpTab: 'first'
    }
  },
  computed: {
    udpMessageDisplay () {
      const udpMessage = this.udpMessage
      const udpMessageDisplay = new Map()
      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000000)
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
              // obj[k] = udpMessage[k]
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

      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000000)
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
    this.prepareTableUdps(this.model)
    this.preName = this.model.Name
    this.preDefinition = this.model.Definition
  },
  methods: {
    save () {
      if (!this.model.Name) {
        this.$datablauMessage.error('模型名称必填')
        return null
      }
      let changes = []
      if (this.preName !== this.model.Name || this.preDefinition !== this.model.Definition || JSON.stringify(this.allUpdsInital) !== JSON.stringify(this.model.allUdps)) {
        let change = new (this.Changes)('modifyModel', {
          id: this.modelData.id,
          name: this.modelData.Name,
          pre: _.cloneDeep(this.modelData),
          now: null
        })
        Object.assign(this.modelData, this.model.allUdps)
        this.modelData.Name = this.model.Name
        this.modelData.Definition = this.model.Definition
        this.modelData.allUdps = this.model.allUdps
        this.$set(this.modelData, 'changed', true)
        change.obj.now = _.cloneDeep(this.modelData)
        changes.push(change)
        this.$bus.$emit('refreshERHeader', this.modelData)
      }
      return changes
    },
    updateUdpValue (obj, index, value) {
      this.$set(obj, index, value)
    },
    prepareTableUdps (modelData) {
      let model = _.clone(modelData)
      let tableUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000000) {
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
        if (!this.modelData[item]) {
          this.modelData[item] = ''
        }
      })
      this.$set(modelData, 'allUdps', {})
      for (let index in model) {
        this.$set(modelData.allUdps, index, model[index])
        // modelData.allUdps[index] = model[index]
      }
      this.allUpdsInital = _.cloneDeep(modelData.allUdps)
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
  .header-wrapper {
    padding: 0 0 10px!important;
    h2 {
      display: inline-block;
      font-size: 14px;
      line-height: 1;
      color: #555;
      padding-left: 0!important;
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
        width: 72px;
        margin-right: 6px;
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
