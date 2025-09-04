<template>
  <div>
    <datablau-table :data="listData" height="100%" :themeBlack="themeBlack">
      <el-table-column :width="40" align="right">
        <template slot-scope="scope">
          <img
          v-if="app === 'archy' && scope.row.startNode.typeId === '80010001'"
            :src="'static/kgimg/' + '80010001-1' + '.svg'"
            style="width: 24px"
            alt=""
          />
          <img
          v-else-if="app === 'archy' && scope.row.startNode.typeId === '80010076'"
            :src="'static/kgimg/' + '80010076-1' + '.svg'"
            style="width: 24px"
            alt=""
          />
          <img
          v-else
            :src="'static/kgimg/' + scope.row.startNode.typeId + '.svg'"
            style="width: 24px"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column label="源对象" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.startNode.Name }}
        </template>
      </el-table-column>
      <el-table-column label="来源" show-overflow-tooltip v-if="app!=='archy'">
        <template slot-scope="scope">
          {{
            scope.row.startNode.path ? scope.row.startNode.path.join('/') : '-'
          }}
        </template>
      </el-table-column>
      <el-table-column label="关系类型" show-overflow-tooltip  v-if="app!=='archy'">
        <template slot-scope="scope">
          {{ scope.row.relation.relationName }}
        </template>
      </el-table-column>
      <el-table-column label="说明" show-overflow-tooltip  v-if="app!=='archy'">
        <template slot-scope="scope">
          {{ scope.row.relation.description }}
        </template>
      </el-table-column>
      <el-table-column :width="45" align="right">
        <template slot-scope="scope">
          <img
          v-if="app === 'archy' && scope.row.endNode.typeId === '80010001'"
            :src="'static/kgimg/' + '80010001-1' + '.svg'"
            style="width: 24px"
            alt=""
          />
          <img
          v-else-if="app === 'archy' && scope.row.endNode.typeId === '80010076'"
            :src="'static/kgimg/' + '80010076-1' + '.svg'"
            style="width: 24px"
            alt=""
          />
          <img
          v-else
            :src="'static/kgimg/' + scope.row.endNode.typeId + '.svg'"
            style="width: 24px"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column label="目标对象" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.endNode.Name }}
        </template>
      </el-table-column>
      <el-table-column label="来源" show-overflow-tooltip  v-if="app!=='archy'">
        <template slot-scope="scope">
          {{ scope.row.endNode.path ? scope.row.endNode.path.join('/') : '-' }}
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>

<script>
export default {
  props: {
    listData: {},
    themeBlack: {},
    app: {}
  },
  mounted () {}
}
</script>

<style scoped></style>
