<template>
  <div>
    <datablau-table
      v-loading="loading"
      class="datablau-table thin"
      :data="diagramContent"
      ref="tableDetailList"
    >
      <el-table-column fixed label="" width="50">
        <template slot-scope="scope">{{scope.$index+1}}</template>
      </el-table-column>
      <el-table-column
        fixed
        label="中文名"
        prop="cnName"
        :min-width="150"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        fixed
        label="字段名"
        prop="name"
        :min-width="150"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column

        label="数据类型"
        prop="dataType"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column

        label="数据标准"
        prop="Name"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{scope.row.domainName !== '' ? scope.row.domainName : domainIdToName[scope.row.domainId]}}
        </template>
      </el-table-column>
      <el-table-column

        label="标准代码"
        prop="domainName"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{$globalData.domainCodes && $globalData.domainCodes.map.get(scope.row.DataStandardCode)}}</span>
        </template>
      </el-table-column>
      <el-table-column

        label="主键"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <i class="el-icon-check" v-if="pk.indexOf(scope.row.elementId) > -1" style="font-weight:bold;font-size:16px;color:#6acf72;"></i>
        </template>
      </el-table-column>
      <el-table-column

        label="外键"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <i class="el-icon-check" v-if="fk.indexOf(scope.row.elementId) > -1" style="font-weight:bold;font-size:16px;color:#6acf72;"></i>
        </template>
      </el-table-column>
      <el-table-column

        label="非空"
        prop="Name"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <i class="el-icon-check" v-if="scope.row.notNull" style="font-weight:bold;font-size:16px;color:#6acf72;"></i>
        </template>
      </el-table-column>
      <el-table-column

        label="仅业务"
        prop="IsLogicalOnly"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <i class="el-icon-check" v-if="scope.row.logicalOnly" style="font-weight:bold;font-size:16px;color:#6acf72;"></i>
        </template>
      </el-table-column>

      <el-table-column
        v-if="activeName === 'BusinessP'"
        label="仅物理"
        prop="IsPhysicalOnly"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <i class="el-icon-check" v-if="scope.row.physicalOnly" style="font-weight:bold;font-size:16px;color:#6acf72;"></i>
        </template>
      </el-table-column>
      <el-table-column
        v-if="activeName === 'BusinessP'"
        label="默认值"
        prop="defaultVal"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column
        v-if="activeName === 'BusinessP'"
        label="定义"
        prop="description"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column
        v-show="activeName === 'BusinessP'"
        width="130px"
        :label="dataByType.udp.get(Number.parseInt(udpKey)).FriendlyName"
        v-for="udpKey in columnsUdpKeysDisplay"
        :key="udpKey"
        :prop="String(udpKey)"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span>{{scope.row.allUdps[udpKey]}}</span>
        </template>
      </el-table-column>

    </datablau-table>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
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
  data () {
    return {
      diagramContent: [],
      rawData: {},
      pk: [],
      fk: [],
      bindId: '',
      loading: true,
      udpMessage: [],
      dataByType: {
        model: {},
        udp: null
      }
    }
  },
  computed: {
    changeData () {
      const { parentData, activeName } = this
      return { parentData, activeName }
    },
    columnsUdpKeysDisplay () {
      const columnsUdpKeys = this.udpMessage
      const columnsUdpKeysDisplay = new Set()
      columnsUdpKeys.forEach(item => {
        if (this.dataByType.udp.get(Number.parseInt(item))) {
          columnsUdpKeysDisplay.add(item)
        }
      })
      return columnsUdpKeysDisplay
    }
  },
  watch: {
    changeData: {
      handler (val) {
        this.bindId = val.parentData.bindId || val.parentData.combinedId
        if (this.activeName === 'Business' || this.activeName === 'BusinessP' || this.activeName === 'information') {
          // this.bindId && this.getDiagramContent()
          this.bindId && this.getDiagrams()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    getDiagramContent () {
      this.rawData = []
      this.diagramContent = []
      this.loading = true
      HTTP.getElementContent({
        modelId: this.bindId.split('/')[0],
        elementId: this.bindId.split('/')[1],
        successCallback: data => {
          this.loading = false
          let dialog = {}
          dialog.columnsMsg = []
          dialog.pk = []
          dialog.fk = []
          dialog.uk = []
          dialog.nk = []
          dialog.tableMsg = data.properties
          data.children.forEach(item => {
            if (item.properties['RawType'] === 'Attribute') {
              dialog.columnsMsg.push(item)
            } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'PrimaryKey') {
              dialog.pk.push(item)
            } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'ForeignKey') {
              dialog.fk.push(item)
            } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'UniqueKey') {
              dialog.uk.push(item)
            } else if (item.properties['RawType'] === 'KeyGroup' && item.properties['KeyGroupType'] === 'NonUniqueKey') {
              dialog.nk.push(item)
            }
          })
          this.rawData = dialog
          // 处理ck fk
          this.dataSplit()
          // 处理表格数据
          this.tableData()
        },
        finallyCallback: e => { this.$showFailure(e) }
      })
    },
    dataSplit () {
      this.pk = []
      this.fk = []
      Array.isArray(this.rawData.pk) && this.rawData.pk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.pk.push(k.properties['AttributeRef'])
        })
      })
      Array.isArray(this.rawData.fk) && this.rawData.fk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.fk.push(k.properties['AttributeRef'])
        })
      })
    },
    tableData () {
      this.rawData.columnsMsg.forEach(item => {
        let body = {
          elementId: item.properties.Id,
          name: item.properties.Name,
          cnName: item.properties.LogicalName,
          dataType: item.properties.DataType,
          notNull: item.properties.IsNotNull,
          domainId: item.properties.DataStandardRef,
          dataStandardCode: item.properties.DataStandardCode,
          defaultVal: item.properties.DefaultValue,
          description: item.properties.Definition,
          logicalOnly: item.properties.IsLogicalOnly,
          physicalOnly: item.properties.IsPhysicalOnly
        }
        if (this.pk.indexOf(body.elementId) > -1) {
          body.notNull = true
        }
        body.allUdps = {}
        this.udpMessage && this.udpMessage.forEach(i => {
          body.allUdps[String(i)] = item.properties[i]
        })
        this.diagramContent.push(body)
      })
      try {
        let res = this.$http({
          url: this.$url + '/service/domains/namemap',
          method: 'post',
          data: this.rawData.columnsMsg.map(item => item.properties.DataStandardRef).filter(domainId => domainId)
        })
        let domainIdToName = res.data
        this.rawData.columnsMsg.forEach((item, index) => {
          this.$set(this.allCols[index], 'domainName', item.properties.DataStandardRef ? domainIdToName[item.properties.DataStandardRef] : '')
        })
      } catch (e) {
        // this.$showFailure(e)
      }
    },
    getDiagrams () {
      HTTP.getDiagrams({
        modelId: this.bindId.split('/')[0],
        successCallback: (data) => {
          this.data = data.children
          this.prepareUdpData(data.udp)
          this.dataByType.model = data.properties
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
      this.prepareColumnUdps()
    },
    prepareColumnUdps () {
      let columnsUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000005) {
          columnsUdps.add(item.Id)
        }
      })
      this.udpMessage = columnsUdps
      this.getDiagramContent()
    }

  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
  /deep/.el-table__fixed::before{
    background: none;
  }
</style>
