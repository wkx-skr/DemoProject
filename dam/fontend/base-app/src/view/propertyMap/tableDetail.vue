<template>
  <div>
    <!--<div style="position:absolute;bottom:100px;color:#FFF;">{{detail}}</div>-->
    <div class="category-detail" v-if="basicDetail">
      <!--<span v-html="JSON.stringify(basicDetail, null, 4)"></span>-->
      <h2 class="oneline-eclipse">
        {{
          basicDetail.logicalName
            ? basicDetail.logicalName
            : basicDetail.physicalName
        }}
        <el-button type="text" style="float: right" @click="goPreview">
          <i class="fa fa-plane"></i>
          查看
        </el-button>
      </h2>
      <h3 class="oneline-eclipse">{{ basicDetail.physicalName }}</h3>
      <div class="tag-box" style="margin-top: 1em">
        <el-tag
          style="margin-right: 0.5em"
          v-for="t in basicDetail.tags"
          :key="t.name"
          size="medium"
        >
          {{ t.name }}
        </el-tag>
      </div>
      <p>{{ basicDetail.definition }}</p>
      <div>
        <div class="item">
          <span class="label">所属模型:</span>
          <span class="detail">{{ basicDetail.modelName }}</span>
        </div>

        <div class="item">
          <span class="label">字段:</span>
          <span class="detail">
            <span v-for="c in columns" :key="c.physicalName">
              {{ c.physicalName }}
              <br />
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.getData()
  },
  data() {
    return {
      basicDetail: null,
      columns: [],
    }
  },
  props: ['detail'],
  methods: {
    getData() {
      const tableId = this.detail.tabId
      this.$http
        .get(this.$url + '/service/entities/' + tableId + '/summary')
        .then(res => {
          this.basicDetail = res.data
          this.getColumns()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getColumns() {
      this.$http
        .get(this.$url + '/service/entities/' + this.detail.tabId + '/columns')
        .then(res => {
          this.columns = res.data
        })
    },
    goPreview() {
      //        this.$router.push({name:'dataCatalog',query:{'table':this.detail.tabId}})
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + 'main/dataCatalog?table=' + this.detail.tabId)
    },
  },
}
</script>
<style scoped lang="scss">
@import './detail.scss';
.label {
  width: 5em !important;
}
</style>
