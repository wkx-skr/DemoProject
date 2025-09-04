<template>
  <div class="column-detail-wrapper">
    <div class="top-info">
      <div class="left-info">
        <div
          class="icon-container"
        >
        </div>
        <div class="top-info-container">
          <p class="title">{{ columnData.name }}</p>
          <p class="define-text">中文名称：{{ columnData.cnName || '' }}</p>
        </div>
      </div>
      <div class="right-button">
        <!--<datablau-button-->
        <!--  type="normal"-->
        <!--  @click="handleEdit"-->
        <!--  :disabled="info.state === 'C' || info.state === 'X'"-->
        <!--  :tooltipContent="info.state === 'C' || info.state === 'X' ? '审核中或已废弃无法编辑': ''"-->
        <!--  v-if="showHistory"-->
        <!--&gt;-->
        <!--  编辑-->
        <!--</datablau-button>-->
        <!--<datablau-button-->
        <!--  type="important"-->
        <!--  :disabled="info.state !== 'D'"-->
        <!--  :tooltipContent="info.state !== 'D' ? '仅待审核可发布': ''"-->
        <!--  @click="handlePublish"-->
        <!--  v-if="showHistory"-->
        <!--&gt;-->
        <!--  发布-->
        <!--</datablau-button>-->
      </div>
    </div>

    <div class="tabs-header-container">
      <datablau-tabs
        class="detail-wrapper "
        v-model="currentTab"
      >
        <el-tab-pane
          label="摘要"
          name="info"
        >
        </el-tab-pane>
        <el-tab-pane
          label="知识图谱"
          name="graph"
          v-if="showKnowledgeGraph"
        >
        </el-tab-pane>
      </datablau-tabs>
    </div>
    <div class="tabs-content-container">
      <div class="content-panel-wrapper">
        <!--模型摘要-->
        <div v-if="currentTab==='info'" class="info-tab-inner">
          <!--定义-->
          <!--<div class="top-hint">描述信息</div>-->
          <datablau-detail-subtitle
            title="描述信息"
            mt="0"
            :mb="columnData.description ? '20px' : '0px'"
            style="margin-left: 20px;"
          ></datablau-detail-subtitle>
          <p class="description-info" v-if="columnData.description">
            {{ columnData.description }}
          </p>
          <p class="description-info" v-if="!columnData.description">
            <datablau-null :type="'nocontent'" :contentType="true">
              <template slot="slotContent">
                暂无数据
              </template>
            </datablau-null>
          </p>

          <div class="top-hint">技术属性</div>
          <datablau-form
            label-position="right"
            label-width="160px"
            class="detail-form"
          >
            <el-form-item label="数据标准：">
              {{ domainName }}
            </el-form-item>
            <el-form-item label="标准代码：">
              <!--{{ columnData.dataStandardCode }}-->
              {{
                $globalData.domainCodes && $globalData.domainCodes.map.get(columnData.dataStandardCode)
              }}
            </el-form-item>
            <el-form-item label="数据类型：">
              {{ columnData.dataType }}
            </el-form-item>
            <el-form-item label="非空：">
              {{ columnData.notNull ? '是' : '否' }}
            </el-form-item>
            <el-form-item label="能否自增：" v-if="couldAutoIncrement">
              {{ columnData.isAutoIncrement ? '是' : '否' }}
            </el-form-item>
            <el-form-item
              v-for="udp in columnsUdpDisplay.values()"
              :label="(udp.FriendlyName || udp.Name) + '：'"
              :key="udp.Id"
              class="col-udp-item"
            >
              <udp-setting
                :edit-mode="false"
                :hide-label="true"
                :tableMsg="requestBody.allUdps"
                :currentModel="currentModel"
                :type="80000005"
                :udp-map="new Map([[udp.Id, columnData.allUdps[udp.Id]]])"
                :data-by-type="dataByType"
                :request-body="columnData"
              >
              </udp-setting>
            </el-form-item>
          </datablau-form>
        </div>

        <!--知识图谱-->
        <div
          class="knowledge-graph"
          v-if="currentTab === 'graph'"
        >
          <knowledge-graph
            ref="knowledgeGraph"
            style="margin: 10px 20px;"
            :summary="{
          properties: { Id: columnData.originData.combinedId, TypeId: 'Attribute',App: 'archy' },
        }"
          ></knowledge-graph>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import HTTP from '@/resource/http'
import knowledgeGraph from '@/dataWarehouse/views/dataIndex/damComponents/knowledgeGraph.vue'
import autoIncrementMap from '@/views/list/graph/editComponents/autoIncrementMap'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'

export default {
  name: 'columnDetail',
  data () {
    return {
      currentTab: 'info',
      loading: false,
      domainName: '',
      themeList: [],
      info: {}
    }
  },
  props: {
    currentModelData: {
      type: Object,
      required: true
    },
    currentModel: {
      type: Object,
      required: true
    },
    requestBody: {
      type: Object,
      required: true
    },
    dataByType: {
      type: Object,
      required: true
    },
    entityData: {
      type: Object,
      required: true
    },
    showKnowledgeGraph: {
      type: Boolean,
      default: false
    },
    columnData: {
      type: Object,
      required: true
    }
  },
  components: {
    knowledgeGraph,
    udpSetting
  },
  mounted () {
    // console.log(this.columnData, 'columnData')
    this.dataInit()
  },
  watch: {},
  computed: {
    // 根据模型类型和字段数据类型判断是否显示 自增 属性
    couldAutoIncrement () {
      let modelType = this.currentModelData.modelType
      let modelInfoData = null
      for (let key in autoIncrementMap) {
        if (autoIncrementMap[key].type.toUpperCase() === modelType.toUpperCase()) {
          modelInfoData = autoIncrementMap[key]
        }
      }
      if (!modelInfoData) {
        return false
      }
      let colDataType = this.columnData?.dataType?.toUpperCase()
      let res = (modelInfoData.hasAutoIncrement && (
        colDataType.indexOf('INT') === 0 ||
        colDataType.indexOf('BIGINT') === 0 ||
        colDataType.indexOf('TINYINT') === 0 ||
        colDataType.indexOf('SMALLINT') === 0 ||
        colDataType.indexOf('MEDIUMINT') === 0
      ))
      return res
    },
    columnsUdpDisplay () {
      const columnsUdpDisplay = new Map()

      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000005)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        columnsUdpDisplay.set(k, udpDetail)
      })
      // console.log(columnsUdpDisplay, 'columnsUdpDisplay')
      return columnsUdpDisplay
    }
  },
  methods: {
    dataInit () {
      this.getRelationDomain()
    },
    getRelationDomain () {
      if (!this.columnData.domainId) {
        return
      }
      this.$http({
        url: this.$url + '/service/domains/namemap',
        method: 'post',
        data: [this.columnData.domainId]
      })
        .then(res => {
          if (res.data) {
            this.domainName = res.data[this.columnData.domainId]
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
$blue: #409EFF;

@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.tool-panel {
  & > div {
    display: inline-block;
  }

  .label {
    display: inline-block;
    margin-right: 8px;
    line-height: 32px;
    font-size: 12px;
    font-weight: 400;
    color: #555555;
  }

  /deep/ .datablau-select .el-select .el-input input {
    height: 32px;
  }

  .datablau-select {
    margin-right: 16px;
  }
}

.top-hint {
  margin: 20px 20px 30px;
  line-height: 18px;
  border-left: 4px solid #409EFF;
  padding-left: 6px;
  font-size: 16px;
  color: #555;
}

/deep/ .el-form.db-form .el-form-item__label {
  font-weight: bold;
}

.breadcrumb-wrapper {
  position: relative;
  z-index: 1;
  padding: 0 20px;
  height: 34px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #DDD;
}

.content-panel-wrapper {
  position: absolute;
  left: 0px;
  top: 34px;
  right: 0;
  bottom: 0;
  overflow: auto;
  padding-right: 20px;

  .info-tab-inner {
    padding-top: 20px;
  }

  .description-info {
    margin-left: 40px;
  }

  .knowledge-graph {
    //border: 1px solid red;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0;
    right: 0;
  }
}

.theme-title {
  display: inline-block;
  margin-left: 20px;
  border-left: 1px solid $blue;
  padding-left: 20px;
}

.ERD {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 0;

  /deep/ .drap-box {
    left: 20px;
  }
}

.back-btn {
  margin-right: 10px;
  display: inline-block;
  font-size: 12px;
  line-height: 1;
  color: #888f9d;
  padding: 7px 12px;
  background: #f7f7f7;
  cursor: pointer;

  i {
    margin-right: 5px;
  }
}

.column-detail-wrapper {
  font-size: 12px;
  line-height: 1;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .update-time {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 5px;
    color: #999;
    border-top: 1px solid #ddd;
    padding: 9px 0;
    background: #fff;
  }

  /deep/ .el-timeline-item__node {
    background-color: #409EFF;
    width: 10px;
    height: 10px;
    left: 0;
  }

  .history-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding-top: 20px;
  }

  .info-detail {
    position: relative;

    .time-title {
      position: absolute;
      left: -115px;
      top: 4px
    }

    .content-wrapper {
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.15);
    }

    .content-head {
      border: 1px solid #F5F5F5;
      border-bottom: none;
      padding: 0 10px;
      background: #F5F5F5;
      line-height: 34px;
      border-radius: 2px;

      span + span {
        margin-left: 20px;
      }

      .el-icon-arrow-up {
        margin-left: 5px;
        transition: all .2s;

        &.down {
          transform: rotate(-180deg);
        }
      }

      .operate-wrapper {
        float: right;

        a {
          cursor: pointer;
          color: #409EFF;
          margin-right: 10px;
        }

        span {
          margin-left: 10px;
          cursor: pointer;
        }
      }
    }

    .content-detail {
      transition: all .8s;
      border: 1px solid #F5F5F5;
      border-top: none;
      border-radius: 2px;
      overflow: hidden;

      li {
        padding: 10px;
        color: #555;
        line-height: 1;
        font-size: 14px;

        h2 {
          margin-right: 5px;
        }

        h2, p {
          font-size: 14px;
          display: inline-block;
        }
      }
    }
  }

  .tabs-content-container {
    .col-udp-item {
      /deep/ .el-tooltip {
        line-height: 40px;
      }

    }
  }
}

.top-hint.table-title {
  margin-bottom: 8px;
}

.table-container {
  position: relative;
  //border: 1px solid red;
  margin: 0 20px 0;
  //top: 46px;
  //left: 20px;
  //right: 20px;
  //bottom: 50px;
}

.page-pagination {
  //border-top: 1px solid #ddd;
  //position: absolute;
  //bottom: 0;
  //left: 0;
  //right: 0;
  height: 50px;
  display: flex;
  padding-right: 20px;
  justify-content: flex-end;
  align-items: center;
}

.theme-box {
  position: relative;
  left: 16px;
  top: -10px;
}

.inner-business-object-detail {
  //border: 1px solid red;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  background-color: #fff;
}

.top-info {
  height: 70px;
  //background: #F6F8FF;
  padding: 0 20px;
  position: relative;

  .left-info {
    display: flex;
    //border: 1px solid red;
    @include absPos();
    right: 130px;
    left: 20px;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;

    .icon-container {
      //border: 1px solid red;
      display: inline-block;
      width: 40px;
      height: 40px;
      margin-right: 8px;
      background: transparent url("../../../../assets/images/search/column.svg") no-repeat center/contain;
    }

    .top-info-container {
      //border: 1px solid red;
      height: 40px;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: space-between;

      .title {
        line-height: 20px;
        font-size: 20px;
        color: #555555;
        vertical-align: top;
      }

      .define-text {
        line-height: 14px;
        font-size: 14px;
        vertical-align: bottom;
      }

    }

  }

  .right-button {
    float: right;
    height: 100%;
    line-height: 70px;
  }
}

.tabs-header-container {
  height: 30px;
  padding: 0 20px;
}

.tabs-content-container {
  //border: 1px solid red;
  position: absolute;
  top: 70px;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 1;

}

.entity-detail-wrapper {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 2;
  background-color: #fff;
}

</style>

<style lang="scss">
.el-dialog__wrapper .theme-create-form2.el-dialog {
  max-height: unset !important;

  .el-form.db-form .datablau-input {
    width: 100%;
  }

  textarea {
    font-family: Arial;
  }

  .el-textarea__inner {
    min-height: unset !important;
    height: 96px !important;
  }

  .el-dialog__body {
    bottom: 60px;

    .datablau-dialog-content {
      .content-inner {
        margin-top: 16px;
      }
    }
  }

  .el-dialog__footer {
    padding-top: 22px;
  }

  .el-dialog__headerbtn {
    top: 14px;
  }
}

.ERD .citic-card-tabs.new-style > .el-tabs > .el-tabs__header {
  display: none;
}

.ERD .citic-card-tabs.new-style > .el-tabs > .el-tabs__content {
  top: 3px;
}

.ERD {
  .edit-model-btn {
    display: none;
  }

  .drap-box {
    & > div:nth-child(1) {
      margin-left: 0 !important;
    }

    & > i:nth-child(2) {
      left: 60px !important;
    }
  }
}

.theme-box .el-tree {
  font-size: 12px;
}
</style>
