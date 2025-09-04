<template>
  <el-table
    :data="data"
    :highlight-current-row="false"
    :height="tableHeight"
    tooltip-effect="light"
    :show-header="showHeader"
    @row-click="handleRowClick"
  >
    <el-table-column
      v-for="(p, index) in tableProp"
      :key="index"
      :width="p.width"
      :prop="p.prop"
      :label="p.label"
      :class-name="p.className"
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        <template v-if="p.icon || p.index">
          <span
            v-if="p.icon === 'call' && scope.row.dir === 'out'"
            class="fa fa-sign-out"
          ></span>
          <span
            v-else-if="p.icon === 'call' && scope.row.dir === 'in'"
            class="fa fa-sign-in"
          ></span>
          <span v-else-if="p.index">{{ scope.$index + 1 }}</span>
        </template>
        <span
          v-else
          @click="handleJump(scope.row)"
          :class="{ jump: supportJump }"
        >
          {{ scope.row[p.prop] }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  props: {
    data: Array,
    tableProp: Array,
    showHeader: Boolean,
    supportJump: Boolean,
    //      handleRowClick: {
    //        type: Function,
    //        default:(row,event,column)=>{/*console.log([row,event,column])*/}
    //      }
  },
  data() {
    return {
      tableHeight: undefined,
    }
  },
  updated() {
    $('.el-table__body-wrapper')[0].scrollTop = 0
    this.resizeTable()
  },
  mounted() {
    this.tableHeight = $('.list-content')[0].offsetHeight
    Ps.initialize($('.el-table__body-wrapper')[0])
    setTimeout(() => {
      this.resizeTable()
    }, 400)
    $(window).resize(this.resizeTable)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    handleRowClick(row) {
      this.$emit('row-click', row)
    },
    resizeTable() {
      this.tableHeight = $('.list-content')[0].offsetHeight
      setTimeout(() => {
        Ps.update($('.el-table__body-wrapper')[0])
      })
    },
    handleJump(row) {
      this.$emit('jumpToModel', row)
    },
  },
}
</script>

<style scoped>
.jump {
  cursor: pointer;
}
</style>
