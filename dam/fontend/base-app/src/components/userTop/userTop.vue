<template>
  <div id="user-top">
    <div class="noresult" v-show="tableData.length === 0">
      <div class="noresult-img">
        <img src="static/kgimg/noresult.svg" alt="" />
        <p>
          {{ $t('meta.DS.tableDetail.noData') }}
        </p>
      </div>
    </div>
    <el-table
      v-show="tableData.length > 0"
      class="datablau-table"
      :data="tableData"
      style="width: 1000px"
    >
      <el-table-column :width="100" label="#">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column
        prop="username"
        :label="$t('meta.DS.tableDetail.username')"
      ></el-table-column>
      <el-table-column
        prop="firstName"
        :label="$t('meta.DS.tableDetail.firstName')"
      ></el-table-column>
      <el-table-column
        prop="visitCount"
        :label="$t('meta.DS.tableDetail.visitCount')"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'userTop',
  props: {
    dataId: {
      required: true,
      type: String,
    },
    dataType: {
      required: true,
      type: String,
    },
    dataAmount: {
      required: false,
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      tableData: [],
    }
  },
  mounted() {
    // console.debug(this.dataId, this.dataType, this.dataAmount)
    if (this.dataId) {
      this.getData()
    }
  },
  methods: {
    getData() {
      this.$http
        .get(
          this.$url +
            `/service/browse/query/topuser/${this.dataAmount}/${this.dataId}/${this.dataType}`
        )
        .then(res => {
          this.tableData = res.data.sort((a, b) => b.visitCount - a.visitCount)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
#user-top {
  .noresult {
    height: 56px;
    .noresult-img {
      img {
        width: auto;
        height: 56px;
      }
    }
  }
}
</style>
