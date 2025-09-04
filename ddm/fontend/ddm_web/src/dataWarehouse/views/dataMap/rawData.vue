<template>
  <div class="rawBox">
    <div class="top-bar">
      <span>
        {{ object.physicalName }}
        <span v-if="object.name">({{ object.name }})</span>
        的全链路血缘
      </span>
      <i class="el-dialog__close el-icon el-icon-close" @click="handleClose"></i>
    </div>
    <div class="con">
      <el-checkbox
        style="margin: 0.8em"
        v-model="param.showColumn"
        @change="handleData"
        size="mini"
        label="显示字段"
      ></el-checkbox>
      <div
        id="consa-graph"
        class="graph-contain-model"
        v-loading="loading"
        :class="{ 'to-top': false }"
      ></div>
    </div>
  </div>
</template>

<script>
import DrawGraph from '@/dataWarehouse/views/dataMap/DrawGraph'
import HTTP from '@/resource/http'
export default {
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      loading: false,
      param: {
        showModel: true,
        showColumn: false,
        meta: true,
        originType: 'TABLE'
      },
      graphPainter: null,
      rawData: {}
    }
  },
  watch: {
    object: {
      handler () {
        this.getRawData()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleData () {
      let data = this.rawData
      if (this.graphPainter) {
        this.graphPainter.destroy()
        this.graphPainter = null
      }
      $('#consa-graph').html('')
      this.loading = false
      this.graphPainter = new DrawGraph($('#consa-graph')[0], data, this.param)
      this.graphPainter.start()
    },
    handleClose () {
      this.$emit('close')
    },
    getRawData () {
      this.loading = true
      let url = ''
      if (this.object.type === 'REPORT') {
        url = `${HTTP.$damServerUrl}lineage/report/${this.object.objectId}/type`
      } else {
        url = `${HTTP.$damServerUrl}lineage/object/${this.object.objectId}/?onlyImpact=false`
      }
      this.$http.get(url)
        .then(res => {
          let data = res.data
          Object.values(data.steps).forEach(step => {
            step.name = this.encodeHtml(step.name)
          })
          this.rawData = data
          this.handleData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    encodeHtml (html) {
      let str = ''
      if (html) {
        str = html.replace(/<img/g, '&lt;img').replace(/<script/g, '&lt;script')
      } else {
        str = ''
      }
      return str
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
.rawBox{
  position: absolute;
  top: 16px;
  left: 16px;
  right: 469px;
  bottom: 10px;
  background-color: #f5f5f5;
  .top-bar{
    height: 50px;
    line-height: 49px;
    border-bottom: 1px solid #ddd;
    background: #fff;
    padding: 0 20px;
    font-size: 16px;
    i{
      float: right;
      height: 50px;
      line-height: 49px;
      font-size: 20px;
      cursor: pointer;
    }
  }
  .con{
    background-color: #f5f5f5;
    /*border: 1px solid #ddd;*/
    overflow: auto;
    padding: 0 20px;
    position: absolute;
    bottom: 0;
    top: 50px;
    left: 0;
    right: 0;
  }
  .fa{
    margin-left: 5px;
  }
}
</style>
