<template>
  <div class="flex">
    <div
      v-for="(u,k) in udpMessageDisplay"
      :key="k"
      class="property">
      <span class="label">{{dataByType.udp.get(Number.parseInt(k)).FriendlyName}}</span>
      <span class="value">{{u}}</span>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import _ from 'lodash'

export default {
  props: {
    parentData: {
      type: Object,
      default: () => {}
    },
    activeName: {
      type: String,
      default: () => ''
    }
  },
  watch: {
    activeId: {
      handler (val) {
        if (val.parentData.combinedId) {
          this.bindId = this.parentData.combinedId
          this.bindId && this.getDiagrams()
          this.$bus.$on('tableMsg', data => {
            this.tableMsg = data
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      dataByType: {
        udp: null
      },
      bindId: '',
      data: {},
      udpMessage: {},
      tableMsg: {},
      requestBody: {
        // elementId: null,
        name: null,
        cnName: null,
        description: null,
        newCols: [],
        modCols: [],
        newKeyGroups: [],
        delKeyGroups: [],
        allUdps: {},
        currentQueryDomainExists: false,
        currentQueryDomain: []
      }
    }
  },
  computed: {
    udpMessageDisplay () {
      const udpMessage = this.udpMessage
      const udpMessageDisplay = {}
      Object.keys(udpMessage).forEach(k => {
        if (this.dataByType.udp.get(Number.parseInt(k))) {
          udpMessageDisplay[k] = udpMessage[k]
        }
      })
      return udpMessageDisplay
    },
    activeId () {
      const { parentData, activeName } = this
      return { parentData, activeName }
    }
  },
  methods: {
    getDiagrams () {
      HTTP.getDiagrams({
        modelId: this.bindId.split('/')[0],
        successCallback: (data) => {
          this.data = data.children
          this.prepareUdpData(data.udp)
        }
      })
    },
    prepareUdpData (rawData) {
      if (rawData && Array.isArray(rawData.children)) {
        let udpMap = new Map()
        rawData.children.forEach(item => {
          if (item.hasOwnProperty('properties') && item.properties.hasOwnProperty('Id')) {
            udpMap.set(item.properties['Id'], item.properties)
          }
        })
        let udp = new Map()
        udpMap.forEach(item => {
          if (item.OwnerRef) {
            let udpId = udpMap.get(item.OwneeRef)?.Id
            if (![80000000, 80000004, 80000005, 80000006, 80000007].includes(udpId)) {
              udpMap.get(udpId).entityType = item.OwnerRef
              udp.set(udpId, udpMap.get(udpId))
            }
          }
        })
        this.dataByType.udp = udp
      } else {
        this.dataByType.udp = new Map()
      }
      this.prepareTableUdps(this.requestBody)
    },
    prepareTableUdps (requestBody) {
      let model = this.tableMsg
      let tableUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000004) {
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
      for (let index in model) {
        // requestBody.allUdps[index] = model[index]
        this.$set(requestBody.allUdps, index, model[index])
      }
      this.udpMessage = model
      this.$set(this, 'udpMessage', model)
      this.udpMessage = model
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
  .flex{
    display: flex;
    /*justify-content: space-between;*/
  }
  .property{
    width: 50%;
    margin-bottom: 10px;
  }
  .value{
    margin-left: 20px;
  }
  .label{
    color: #9a9a9a;;
  }
</style>
