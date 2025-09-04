<template>
  <div class="container" v-loading="loading">
    <!---->
    <h2 v-if="summary && summary.logicalName">{{ summary.logicalName }}</h2>
    <h2 v-if="summary && !summary.logicalName">
      {{ summary.properties.Name }}
    </h2>
    <p v-if="summary" v-html="nl2br(summary.definition)" class="definition"></p>
    <!--<p class="detail">统一社会信用代码</p>-->
    <div v-if="objectType === 'table'" style="margin-top: 1.2em">
      <i class="fa fa-database" style="font-size: 20px; color: #009683"></i>
      约有数据28k
    </div>
    <h3 v-if="columns">
      <!---->
      有业务属性{{ columns.length }}个
    </h3>
    <ul v-if="columns">
      <li v-for="(c, i) in columns">#{{ i + 1 }} {{ c.name }}</li>
    </ul>
    <h3 v-if="objectType === 'table'">分布在哪些IT系统</h3>
    <h3 v-if="objectType === 'column'">关联此属性的数据</h3>
    <ul>
      <li>#1 信贷系统BCBS</li>
      <li>#2 客户关系CRM系统</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TableDetail',
  mounted() {
    this.getSummary()
  },
  props: ['objectId'],
  data() {
    return {
      loading: true,
      typeId: undefined,
      summary: null,
      columns: null,
    }
  },
  watch: {
    objectId() {
      this.getSummary()
    },
  },
  methods: {
    getSummary() {
      this.loading = true
      this.$http
        .get(`${this.$url}/service/entities/${this.objectId}/summary`)
        .then(res => {
          this.typeId = res.data.properties.TypeId
          this.summary = res.data
          if (this.objectType === 'table') {
            this.getColumns()
          }
        })
        .catch(e => {})
        .then(() => {
          this.loading = false
        })
    },
    getColumns() {
      this.$http
        .get(`${this.$url}/service/entities/${this.objectId}/columns`)
        .then(res => {
          res.data.forEach(item => {
            if (item.logicalName) {
              item.name = item.logicalName
            } else {
              item.name = item.physicalName
            }
          })
          this.columns = res.data
        })
    },
  },
  computed: {
    objectType() {
      switch (this.typeId) {
        case '80000004':
          return 'table'
        case '80000005':
          return 'column'
        default:
          return 'unknown'
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import './main';
</style>
