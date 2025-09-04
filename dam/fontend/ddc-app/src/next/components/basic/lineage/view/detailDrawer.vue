<template>
  <div :style="style" class="detail-drawer" v-if="drawerVisible">
    <span style="font-size: 16px">关系信息</span>
    <br />
    <br />
    <datablau-form label-width="6em">
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
    </datablau-form>
  </div>
</template>
<script>
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
    }
  },
  methods: {
    handleClose() {},
    openDrawer() {
      this.drawerVisible = true
    },
    showDetails({ shapesMap, edgesMap, type, key }) {
      if (type === 'line') {
        const edge = edgesMap.get(key)
        const { sourceId, targetId } = edge
        const source = shapesMap.get(sourceId)
        const target = shapesMap.get(targetId)
        this.sourceColumnLabel =
          shapesMap.get(source.tId).label + '.' + source.label
        this.targetColumnLabel =
          shapesMap.get(target.tId).label + '.' + target.label
        this.sourceFiles = JSON.parse(edge.lineageFiles)
      }
      /*
      抵消事件冒泡带来的影响
       */
      setTimeout(() => {
        this.drawerVisible = true
      })
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
}
</style>
