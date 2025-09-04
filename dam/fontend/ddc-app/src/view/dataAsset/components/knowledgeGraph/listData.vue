<template>
  <div>
    <datablau-table :data="listData" height="100%">
      <el-table-column :width="40" align="right">
        <template slot-scope="scope">
          <img
            :src="
              '../../../../static/kgimg/' + scope.row.startNode.typeId + '.svg'
            "
            style="width: 24px"
            alt=""
            v-if="typeNameArr[scope.row.startNode.typeId]"
          />
          <img
            v-else
            style="width: 30px; height: 30px; margin-right: 0.5em"
            :src="metaModelIconMap[scope.row.startNode.typeId]"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column label="源对象" show-overflow-tooltip>
        <template slot-scope="scope">
          <datablau-button type="text" @click="goDetail(scope.row.startNode)">
            {{ scope.row.startNode.Name }}
          </datablau-button>
        </template>
      </el-table-column>
      <el-table-column label="来源" show-overflow-tooltip>
        <template slot-scope="scope">
          {{
            scope.row.startNode.path ? scope.row.startNode.path.join('/') : '-'
          }}
        </template>
      </el-table-column>
      <el-table-column label="关系类型" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.relation.relationName }}
        </template>
      </el-table-column>
      <el-table-column label="说明" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.relation.description }}
        </template>
      </el-table-column>
      <el-table-column :width="40" align="right">
        <template slot-scope="scope">
          <img
            :src="
              '../../../../static/kgimg/' + scope.row.endNode.typeId + '.svg'
            "
            style="width: 24px"
            alt=""
            v-if="typeNameArr[scope.row.endNode.typeId]"
          />
          <img
            v-else
            style="width: 30px; height: 30px; margin-right: 0.5em"
            :src="metaModelIconMap[scope.row.endNode.typeId]"
            alt=""
          />
        </template>
      </el-table-column>
      <el-table-column label="目标对象" show-overflow-tooltip>
        <template slot-scope="scope">
          <datablau-button type="text" @click="goDetail(scope.row.endNode)">
            {{ scope.row.endNode.Name }}
          </datablau-button>
        </template>
      </el-table-column>
      <el-table-column label="来源" show-overflow-tooltip>
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
    typeNameArr: {},
    metaModelIconMap: {},
  },
  mounted() {},
  methods: {
    goDetail(row) {
      this.$emit('goDetail', row)
    },
  },
}
</script>

<style scoped></style>
