<template>
  <div class="graph-outer">
    <!--<el-switch
        v-if="!map"
        active-text="全链路分析"
        inactive-text="影响分析"
        style="margin-right:15px;"
        inactive-color="#409EFF"
        v-model="allRelations"
        @change="getData"></el-switch>
  		<el-checkbox
        v-if="!map"
        v-model="param.showModel" @change="handleData" size="mini" label="显示模型"></el-checkbox>-->
    <el-checkbox
      style="margin: 0.8em"
      v-model="param.showColumn"
      @change="handleData"
      size="mini"
      label="显示字段"
    ></el-checkbox>
    <!--<el-button style="margin-left:0.5em;" type="text" @click="fixed = !fixed"><i class="fa" :class="{'fa-expand':!fixed,'fa-compress':fixed}"></i><span v-if="!fixed"> 全屏</span><span v-else>退出全屏</span></el-button>-->
    <div id="loading-box" v-if="loading"><i class="el-icon-loading"></i></div>
    <div
      id="consa-graph"
      class="graph-contain-model"
      v-show="!loading"
      :class="{ 'to-top': false }"
    ></div>
  </div>
</template>
<script>
import DrawGraph from './DrawGraph.js'
import HTTP from '@/http/main.js'
import { encodeHtml } from '@/next/utils/XssUtils'

export default {
  props: {
    data: Object,
    from: {
      type: String,
      default: 'default',
    },
  },
  data() {
    return {
      param: {
        showModel: false,
        showColumn: false,
        meta: true,
      },
      rawData: {},
      dialogVisible: false,
      loading: true,
      allRelations: true,
      graphPainter: null,
      map: false,
      fixed: false,
    }
  },
  mounted() {
    const self = this
    if (this.from === 'map') {
      this.map = true
      $('.graph-outer').css('background-color', '#494949')
    }
    if (this.data.objectId) {
      /* this.param = {
				columnName:this.data.physicalName,
				tableName:this.data.tableName,
				showColumn:true,
			} */
    } else {
      this.param = {
        isTable: true,
      }
    }
    this.getData()
  },
  beforeDestroy() {},
  watch: {
    fixed(newVal) {
      if (newVal) {
        $('.content-scrollbar-box').css({
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 9,
        })
        $('.el-tabs__header').css({
          zIndex: 0,
        })
      } else {
        $('.content-scrollbar-box').css({
          position: 'absolute',
          top: 105,
          left: 30,
          right: 20,
          bottom: 20,
        })
      }
    },
  },
  methods: {
    getData() {
      const self = this
      this.loading = true

      let type = 'TABLE'
      let requestUrl = ''
      let getData = null
      if (this.data && this.data.type) {
        type = this.data.type
      }
      if (type === 'REPORT') {
        getData = HTTP.getReportLineage({ objectId: this.data.objectId })
      } else {
        requestUrl = this.$url + '/service/lineage/object/' + self.data.objectId
        if (this.allRelations) {
          requestUrl += '?onlyImpact=false'
        } else {
          requestUrl += '?onlyImpact=true'
        }
        getData = self.$http.get(requestUrl)
      }

      getData
        .then(res => {
          this.handleXss(res.data)
          self.rawData = res.data
          // this.param.showModel = true;
          self.handleData()
        })
        .catch(e => {
          this.loading = false
          //				this.$message.error('血缘数据读取失败');
          this.$showFailure(e)
        })
    },
    handleXss(obj) {
      try {
        Object.values(obj.steps).forEach(step => {
          console.log(step)
          step.name = encodeHtml(step.name)
        })
      } catch (e) {}
    },
    handleData() {
      var data = this.rawData
      if (this.graphPainter) {
        this.graphPainter.destroy()
        this.graphPainter = null
      }
      $('#consa-graph').html('')
      this.loading = false
      this.param.tableSummary = this.$parent.summary
      this.graphPainter = new DrawGraph($('#consa-graph')[0], data, this.param)
      this.graphPainter.start()
    },
  },
}
</script>
<style lang="scss" scoped>
.graph-outer {
  padding: 10px 20px;
  /*min-height:350px;*/
  height: 500px;
  position: relative;
  //background:#FFF;
  background-color: var(--default-bgc);
  overflow: auto;
}
#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 40px;
  left: 20px;
  right: 20px;
  overflow: auto;
  &.to-top {
    top: 30px;
  }
}
#loading-box {
  width: 36px;
  height: 36px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  i {
    font-size: 36px;
  }
}
</style>
