<template>
  <div class="rawBox">
    <div class="top-bar">
      {{ propertiesFileData.fileName }}的血缘
      <el-checkbox
        style="margin-left: 10px"
        v-model="optionslineage.showFullProcess"
        :label="$t('meta.lineageManage.graph.wholeProcess')"
      ></el-checkbox>
      <el-checkbox v-model="optionslineage.showColumn">
        {{ $t('meta.lineageManage.graph.showColumn') }}
      </el-checkbox>
      <i
        class="el-dialog__close el-icon el-icon-close"
        @click="handleClose"
      ></i>
    </div>
    <div class="con">
      <div
        class="button-left"
        v-if="hoverErrorMsg === ''"
        style="display: inline-block; padding-top: 6px"
      ></div>
      <div
        class="lineage-container model-lineage-outer"
        v-if="hoverErrorMsg === ''"
      >
        <div class="scroll-outer">
          <datablau-lineage
            :dataWarehouse="true"
            class="lineage"
            ref="lineage"
            v-if="JSON.stringify(rawData) !== '{}' && typeLineage === '1'"
            :rawData="rawData"
            :options="optionslineage"
            :consagraphTop="0"
            style="
              position: absolute;
              top: 10px;
              left: 0;
              right: 0;
              bottom: 0;
              overflow: auto;
            "
          ></datablau-lineage>
        </div>
      </div>
      <div class="no-data" v-if="!loadingGraph && !Object.keys(rawData).length">
        <div class="center-content">
          <datablau-icon
            :data-type="'no-result'"
            icon-type="svg"
            :size="80"
          ></datablau-icon>
        </div>
      </div>
      <div v-if="hoverErrorMsg !== ''" class="errorMessage">
        <div class="errorImg" style="position: absolute; top: 30px">
          <img src="./errorimg.png" />
        </div>
        <p
          style="
            position: absolute;
            top: 122px;
            left: 20px;
            right: 20px;
            bottom: 0px;
            overflow: auto;
          "
        >
          {{ hoverErrorMsg }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
// import HTTP from '@/dataWarehouse/resource/http'
import { Base64 } from 'js-base64'

export default {
  data() {
    return {
      loadingGraph: true,
      getDataPromise: null,
      rawData: {},
      typeLineage: '1',
      hoverErrorMsg: '',
      optionslineage: {
        showMiddleProcess: true, // 显示加工过程
        showFullProcess: false, // 显示全部过程
        showColumn: true, // 显示字段
        groupBySchema: false, // 分组 (依据Schema)
        groupByCategory: false, // 分组 (依据业务系统)
      },
    }
  },
  props: {
    propertiesFileData: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    propertiesFileData: {
      handler(val) {
        console.log(val, 'val')
        if (val.rawData) {
          this.rawData = val.rawData
          this.loadingGraph = false
          this.$refs.lineage.redraw()
          return
        }
        this.refreshLineage()
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    refreshLineage() {
      this.loadingGraph = true
      const self = this
      this.getDataPromise = new Promise((resolve, reject) => {
        let variable = this.propertiesFileData.properties || []
        // let url = `${self.$ddtUrl}/service/lineage`
        let url = `${this.$meta_url}lineage/${this.propertiesFileData.lineageId}`
        self.$http
          .get(url)
          .then(res => {
            this.loadingGraph = false
            resolve(res)
          })
          .catch(e => {
            this.loadingGraph = false
            if (
              e.response.data.errorMessage &&
              e.response.data.errorMessage.includes('line')
            ) {
              this.hoverErrorMsg = e.response.data.errorMessage.replaceAll(
                '\\n',
                ' '
              )
              // this.$bus.$emit('rowHighlight', e.response.data.errorMessage.match(/\d+/g)[0], e.response.data.errorMessage)
            } else {
              this.hoverErrorMsg = e.response.data.errorType
              reject(e)
              this.$showFailure(e)
            }
          })
      })
      this.getDataPromise.then(res => {
        this.rawData = res.data
        this.$refs.lineage.redraw()
      })
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.rawBox {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 469px;
  bottom: 10px;
  /*background-color: #f5f5f5;*/
  .top-bar {
    height: 50px;
    line-height: 49px;
    border-bottom: 1px solid #ddd;
    background: #fff;
    padding: 0 20px;
    font-size: 16px;
    i {
      float: right;
      height: 50px;
      line-height: 49px;
      font-size: 20px;
      cursor: pointer;
    }
  }
  .con {
    background-color: #fff;
    /*border: 1px solid #ddd;*/
    overflow: auto;
    padding: 20px 20px;
    position: absolute;
    bottom: 0;
    top: 50px;
    left: 0;
    right: 0;
  }
  .fa {
    margin-left: 5px;
  }
}
.no-data {
  position: absolute;
  bottom: 0;
  top: 50%;
  left: 0;
  right: 0;
  /*.center-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }*/
}
</style>
