<template>
  <div class="graph-outer">
    <el-switch
      v-if="!map"
      :active-text="$t('meta.map.fullLinkAna')"
      :inactive-text="$t('meta.map.impactAna')"
      style="margin-right: 15px"
      inactive-color="#409EFF"
      v-model="allRelations"
      @change="getData"
    ></el-switch>
    <el-checkbox
      v-if="!map"
      v-model="param.showModel"
      @change="handleData"
      size="mini"
      :label="$t('meta.map.showModel')"
    ></el-checkbox>
    <el-checkbox
      style="margin: 0.8em"
      v-model="param.showColumn"
      @change="handleData"
      size="mini"
      :label="$t('meta.map.showColumn')"
    ></el-checkbox>
    <el-button style="margin-left: 0.5em" type="text" @click="resetFixed">
      <i class="fa" :class="{ 'fa-expand': !fixed, 'fa-compress': fixed }"></i>
      <span v-if="!fixed">{{ $t('meta.map.fullScreen') }}</span>
      <span v-else>{{ $t('meta.map.Esc') }}</span>
    </el-button>
    <div id="loading-box" v-if="loading"><i class="el-icon-loading"></i></div>
    <div
      id="consa-graph"
      class="graph-contain-model to-top"
      v-show="!loading"
    ></div>
  </div>
</template>
<script>
import DrawGraph from './DrawGraph.js'

export default {
  props: {
    data: Object,
    from: {
      type: String,
      default: 'default',
    },
    canRealFullscreen: Boolean,
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
      $('.graph-outer').css('background-color', 'var(--map-popover-bgc)')
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
      this.$emit('resetFullScreen', newVal)
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

      var requestUrl = self.$meta_url + '/lineage/object/' + self.data.objectId
      if (this.allRelations) {
        requestUrl += '?onlyImpact=false'
      } else {
        requestUrl += '?onlyImpact=true'
      }
      self.$http
        .get(requestUrl)
        .then(res => {
          self.rawData = res.data
          this.param.showModel = true
          self.handleData()
        })
        .catch(e => {
          this.loading = false
          //				this.$message.error('血缘数据读取失败');
          this.$showFailure(e)
        })
    },
    handleData() {
      var data = this.rawData
      if (this.graphPainter) {
        this.graphPainter.destroy()
        this.graphPainter = null
      }
      $('#consa-graph').html('')
      this.loading = false
      this.graphPainter = new DrawGraph($('#consa-graph')[0], data, this.param)
      this.graphPainter.start()
    },
    resetFixed() {
      this.fixed = !this.fixed
      if (this.canRealFullscreen) {
        if (this.fixed) {
          this.$fullScreen()
        } else {
          this.$exitFullScreen()
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.graph-outer {
  padding: 10px 20px;
  height: 100%;
  //background:#FFF;
  background-color: var(--default-bgc);
  position: relative;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}
#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 60px;
  left: 20px;
  right: 20px;
  overflow: auto;
  &.to-top {
    top: 40px;
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
