<template>
  <div class="table-outer">
    <el-table
      :data="tableData"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column
        v-for="(item, index) in tableMeta.slice(0, tableMeta.length - 2)"
        :key="item"
        :label="tableMeta[index]"
        :prop="tableDataProps[index]"
        :width="colWidth[index]"
        :min-width="colMinWidth[index]"
      ></el-table-column>
      <el-table-column :label="tableMeta[2]">
        <template slot-scope="scope">
          <a
            class="blue"
            href="javascript:;"
            v-if="scope.row.type === 'table'"
            type="text"
            @click="go('table', scope.row.objectId)"
          >
            {{ scope.row.name }}
          </a>
          <a
            class="blue"
            href="javascript:;"
            v-else
            type="text"
            @click="go('column', scope.row.objectId)"
          >
            {{ scope.row.name }}
          </a>
        </template>
      </el-table-column>
      <el-table-column :label="tableMeta[3]">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'table'">{{ scope.row.parent }}</span>
          <a
            v-else
            class="blue"
            href="javascript:;"
            @click="go('table', scope.row.tableId)"
          >
            {{ scope.row.parent }}
          </a>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: [
    'tableData',
    'tableMeta',
    'tableDataProps',
    'colWidth',
    'colMinWidth',
    'name',
  ],
  data() {
    return {
      selectArr: [],
    }
  },
  mounted() {
    const self = this
    setTimeout(function () {
      Ps.initialize(self.$el)
    }, 300)
    self.$bus.$off('cancelQuoto')
    self.$bus.$on('cancelQuoto', function () {
      self.deleteTagQuoto(self.selectArr)
    })
  },
  updated() {},
  beforeDestroyed() {
    Ps.destory(this.$el)
    this.$bus.$off('cancelQuoto')
  },
  methods: {
    handleSelectionChange(val) {
      this.selectArr = val
    },
    go(type, id) {
      const grandpa = this.$parent.$parent
      grandpa.showContentById(id, type)
    },
    deleteTagQuoto(val) {
      const self = this
      val.forEach(function (item) {
        self.deleteTag(self.name, item.objectId)
      })
      self.$bus.$emit('refreshTagContent')
    },
    deleteTag(tag, objectId) {
      const that = this
      this.$http
        .put(this.$url + '/service/entities/' + objectId + '/tags/delete', [
          {
            name: tag,
            objectId: objectId,
            global: true,
          },
        ])
        .then(function (res) {
          that.success('删除标签 " ' + tag + ' " 成功')
        })
        .catch(function (err) {
          that.notify('删除标签 " ' + tag + ' " 未成功')
        })
    },
    notify(text) {
      this.$notify.error({
        title: '错误',
        message: text,
      })
    },
    success(text) {
      this.$notify.success({
        title: '',
        message: text,
      })
    },
  },
}
</script>

<style scoped lang="scss">
.table-outer {
  /*border:1px solid pink;*/
  position: absolute;
  bottom: 20px;
  top: 160px;
  left: 40px;
  right: 20px;
}
</style>
<style lang="scss">
.el-table {
  overflow: hidden !important;
  max-width: 9999px;
}
</style>
