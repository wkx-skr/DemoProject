<template>
  <div>
    <datablau-button @click="getDomain">获取Domain</datablau-button>
    <datablau-button @click="loadModel">获取一个Domain的模型</datablau-button>
    <datablau-button @click="listDomains">列出所有的Domain</datablau-button>
    <datablau-button @click="findObjects">查询资产</datablau-button>
    <p>{{result}}</p>
  </div>
</template>
<script>
import Context from '@/next/service/metaModel/class/Context.ts';

export default {
  mounted() {
    console.log('mounted')
    this.getDomain()
  },
  components: {},
  data() {
    return {
      result: '',
    }
  },
  methods: {
    /**
     * 获取Domain
     */
    getDomain() {
      this.$http.post(`/metamodel/getDomain?namespace=${Context.namespace}&name=${Context.testDomain}`).then(res => {
        console.log(res.data)
        this.result = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    /**
     * 获取一个Domain的模型
     */
    loadModel() {
      this.$http.post(`/metamodel/loadModel?namespace=${Context.namespace}&domain=${Context.testDomain}`).then(res => {
        console.log(res.data)
        this.result = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    /**
     * 列出所有的Domain
     */
    listDomains() {
      this.$http.post(`/metamodel/listDomains?${Context.ns}=${Context.namespace}`).then(res => {
        console.log(res.data)
        this.result = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    /**
     * 查询资产
     */
    findObjects() {
      this.$http.post(`/metamodel/findObjects?${Context.ns}=${Context.namespace}`, {
        "domains": ["Database"],
        // "typeIds": ["com.datablau.PhysicalTable"],
        // "comparisons": [{
        //   "propertyId": "com.datablau.Alias",
        //   "propertyValue": "TableA",
        //   "exactMatch": false
        // }, {
        //   "propertyId": "com.datablau.Name",
        //   "propertyValue": "A",
        //   "exactMatch": false
        // }]
      }).then(res => {
        console.log(res.data)
        this.result = res.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
  },
}
</script>
<style lang="scss" scoped>

</style>
