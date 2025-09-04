<template>
  <div class="model-graph-circulation">
    <div class="tree-area">
      <left-tree
        ref="leftTree"
        @chooseCategory="chooseCategory"
      ></left-tree>
    </div>
    <div class="graph-area model" v-if="modelId">
      <datablau-tabs
        v-if="diagramList && diagramList.length"
        @tab-click="handleTabClick"
        style="padding: 10px 16px 0;display: inline-block;"
        v-model="diagramNow"
        type="card"
      >
        <el-tab-pane
          v-for="item in diagramList"
          :key="item.properties.Id"
          :label="item.properties.Name"
          :name="item.properties.Id"
        ></el-tab-pane>
      </datablau-tabs>
      <div v-else style="padding: 10px 16px 0;display: inline-block;"></div>
      <datablau-button style="float: right;margin: 10px 10px 0 0;" @click="handelQuanPing" type="icon" :class="isFull?'icon-suoxiao':'icon-quanping1'" class="iconfont"></datablau-button>
      <div class="btn-wrapper">
        <datablau-select
          style="display: inline-block;width: 240px;height: 34px;"
          v-model="value9"
          filterable
          remote
          reserve-keyword
          clearable
          placeholder="搜索"
          :remote-method="remoteMethod"
          size="small"
          class="search-panel"
          @clear="clearSelect"
          @change="handleSelect"
          v-clickOutside="clickOutside"
          is-icon="iconfont icon-search"
        >
          <el-option
            v-for="item in options4"
            :key="item.label"
            :label="item.label"
            :value="item.value">
          </el-option>
        </datablau-select>
      </div>
      <model-component ref="modelComponent" class="model-wrapper" v-if="diagramNow && modelId" :diagramNow="diagramNow" :id="modelId" :key="modelGraphKey"></model-component>
    </div>
    <div class="graph-area" v-else>
      <datablau-null
        class="node-data-icon"
        :type="'data'"
        style="width: 160px"
        tip="请您打开数据视图查看"
      >
      </datablau-null>
    </div>
  </div>
</template>

<script>
import modelComponent from '@/views/list/modelComponent.vue'
import leftTree from './leftTree.vue'
import string from '@/resource/utils/string'
import $ from 'jquery'
export default {
  components: {
    leftTree,
    modelComponent
  },
  mounted () {
    document.addEventListener('fullscreenchange', this.toggleFullScreen)
    this.$bus.$on('loadSearchList', this.loadSearchList)
    window.addEventListener('keydown', this.escKeydown)
  },
  beforeDestroy () {
    this.$bus.$off('loadSearchList', this.loadSearchList)
    window.removeEventListener('keydown', this.escKeydown)
    document.removeEventListener('fullscreenchange', this.toggleFullScreen)
  },
  data () {
    return {
      isFull: false,
      options4: [],
      value9: [],
      list: [],
      // current: '50',
      modelId: '',
      diagramNow: '',
      modelGraphKey: 1,
      diagramList: []
    }
  },
  methods: {
    handleTabClick () {
      this.modelGraphKey++
    },
    escKeydown (e) {
      if (e.keyCode === 122) {
        e.returnValue = false
        if (!this.isFull) {
          this.handelQuanPing()
        }
      }
    },
    toggleFullScreen (e) {
      if (this.isFull) {
        this.handelQuanPing()
      }
      this.isFull = !this.isFull
    },
    handelQuanPing () {
      let isFull = !this.isFull
      this.$store.state.ddmPermission.hideTopMenu = isFull
      this.$store.state.ddmPermission.hideLeftMenu = isFull
      if (isFull) {
        $('.model-graph-circulation .graph-area.model').css('left', '0')
      } else {
        $('.model-graph-circulation .graph-area.model').css('left', '240px')
      }
      if (isFull) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    clickOutside () {
      this.value9 = []
      this.options4 = []
    },
    remoteMethod (query) {
      if (query !== '') {
        setTimeout(() => {
          this.options4 = this.list.filter(item => {
            return string.matchKeyword(item, query, 'label')
          })
        }, 10)
      } else {
        this.options4 = []
      }
    },
    handleSelect (value) {
      if (value) {
        this.$refs.modelComponent.$refs.modelGraphReference.graph.focusTable(value)
      } else {
        this.options4 = []
      }
    },
    clearSelect (value) {
      $('.highlight').removeClass('highlight')
    },
    loadSearchList (list) {
      this.list = list
      this.options4 = []
    },
    chooseCategory ({ data }) {
      if (data.modelId) {
        this.modelId = data.modelId
        this.$http.get(this.$url + `/models/${this.modelId}/direct/content/json?typeFilter=80000006`).then(res => {
          this.$store.commit('removeModelId', this.modelId)
          this.diagramList = res.data.children
          if (this.diagramList?.length) {
            this.diagramNow = this.diagramList[0].properties.Id
            this.modelGraphKey++
          } else {
            this.diagramNow = ''
            this.diagramList = []
            this.$datablauMessage.error('当前流转图没有可展示的主题域，请您添加主题域后再进行查看')
          }
        }).catch(err => {
          if (err?.response?.data?.errorMessage?.indexOf('已经被删除了') >= 0) {
            this.$store.commit('addModelId', this.modelId)
          }
          this.diagramNow = ''
          this.diagramList = []
          this.$showFailure(err)
        })
      } else {
        if (!localStorage.getItem(`modelGraphCirculationDiagram_${this.$store.state.user.userId}`)) {
          this.modelId = ''
          this.diagramNow = ''
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.btn-wrapper {
  margin-top: -15px;
  display: flex;
  height: 50px;
  padding: 0 16px;
  justify-content: space-between;
  align-items: center;
  background: #FBFBFB;
}
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

$leftWidth: 240px;
.model-graph-circulation {
  @include absPos();

  .tree-area {
    padding: 0px;
    width: $leftWidth;
    overflow: hidden;
  }

  .graph-area {
    @include absPos();
    left: $leftWidth;
    z-index: 1;
    overflow: hidden;
    background-color: #fff;
    & .model-wrapper {
      position: absolute;
      top: 90px;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .node-data-icon {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }

}

</style>
