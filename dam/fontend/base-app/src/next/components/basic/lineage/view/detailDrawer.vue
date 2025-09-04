<template>
  <div :style="style" class="detail-drawer" v-if="drawerVisible">
    <template>
      <span style="font-size: 16px">关系信息</span>
      <br />
      <br />
      <datablau-form label-width="6em" v-if="showTab === 'relation'">
        <el-form-item label="来源字段">
          {{ sourceColumnLabel }}
        </el-form-item>
        <el-form-item label="目标字段">
          {{ targetColumnLabel }}
        </el-form-item>
        <el-form-item label="来源文件">
          <datablau-button
            v-for="(file, idx) in sourceFiles"
            :key="idx"
            type="text"
            @click="openLineageFile(file)"
          >
            {{ file.fileName }}
          </datablau-button>
        </el-form-item>
        <el-form-item label="来源ETL">
          <datablau-button v-if="etlSource" type="text" @click="openETLMeta">
            {{ `${etlSource.etlName}` }}
          </datablau-button>
          <template v-else>未映射到ETL</template>
        </el-form-item>
      </datablau-form>
      <div v-else-if="showTab === 'tableRelation'">来源数据中台ETL</div>
      <div v-else-if="showTab === 'notPhysical'">
        通过【{{ targetSourceSchema }}】采集元数据获取的血缘
      </div>
    </template>
  </div>
</template>
<script>
import { StepShape } from '../types/Shape'

export default {
  data() {
    const style = {}
    return {
      direction: 'rtl',
      drawerVisible: false,
      style: style,
      sourceColumnLabel: '',
      targetColumnLabel: '',
      sourceFiles: [],
      showTab: '', // relation: 关系信息, notPhysical: 与非物理元数据之间的血缘链路
      targetSourceSchema: '',
      etlSource: null, // 来源ETL { "etlName": "销售收入", "etlObjectId": "1100103", "type": "META_MODEL" }
    }
  },
  methods: {
    handleClose() {},
    openDrawer() {
      this.drawerVisible = true
    },
    showDetails({ shapesMap, edgesMap, type, key, showColumn, rawData }) {
      if (type === 'line') {
        const edge = edgesMap.get(key)
        const { sourceId, targetId } = edge
        const source = shapesMap.get(sourceId)
        const target = shapesMap.get(targetId)
        console.log('target', target)
        console.log('source', source)

        if (source instanceof StepShape && target instanceof StepShape) {
          // 判断source和target的TypeID是否都是80000004
          const sourceTypeId =
            rawData?.steps[sourceId]?.properties?.typeId || ''
          const targetTypeId =
            rawData?.steps[targetId]?.properties?.typeId || ''
          this.showTab = 'notPhysical'
          console.log('source TypeId  ', sourceTypeId )
          console.log('target TypeId  ', targetTypeId )
          console.log('showColumn  ', showColumn)
          if (
            sourceTypeId === '' &&
            targetTypeId === '' &&
            showColumn === false
          ) {
            // 当不展示字段时，设置showTab为tableRelation
            this.showTab = 'tableRelation'
          }
          this.targetSourceSchema = target.schema
        } else {
          this.sourceColumnLabel =
            shapesMap.get(source.tId).label + '.' + source.label
          this.targetColumnLabel =
            shapesMap.get(target.tId).label + '.' + target.label
          this.sourceFiles = JSON.parse(edge.lineageFiles)
          if (edge.etlSource) {
            this.etlSource = JSON.parse(edge.etlSource)
          } else {
            this.etlSource = null
          }
          this.showTab = 'relation'
        }
        console.log('showTab ' + this.showTab)
        /*
        抵消事件冒泡带来的影响
         */
        setTimeout(() => {
          this.drawerVisible = true
        })
      }
    },
    removeDetail() {
      this.drawerVisible = false
    },
    openLineageFile(file) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          'lineageDemo?' +
          'id=' +
          file.id +
          '&filename=' +
          encodeURIComponent(file.fileName) +
          '&name=' +
          encodeURIComponent(file.name) +
          '&writable=false&blank=true',
        '_blank'
      )
    },
    // 点击ETL名称在新标签页打开该ETL元数据详情页
    openETLMeta() {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      let etl = this.etlSource
      window.open(
        baseUrl +
          'main/meta?' +
          'type=' +
          etl.type +
          '&objectId=' +
          etl.etlObjectId +
          '&blank=true',
        '_blank'
      )
    },
  },
  computed: {},
}
</script>
<style lang="scss" scoped>
.detail-drawer {
  position: absolute;
  top: 30px;
  bottom: 30px;
  right: 30px;
  width: 30%;
  min-width: 340px;
  max-width: 400px;
  height: auto;
  padding: 16px 14px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(46, 105, 240, 0.1);

  /deep/ .el-form.db-form .el-form-item__label {
    margin-top: 0;
  }
}
</style>
