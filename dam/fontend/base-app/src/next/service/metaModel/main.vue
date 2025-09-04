<template>
  <div class="container">
    <div class="left-part">
      <com-nav @open-page="openPage"></com-nav>
    </div>
    <div class="right-part">
      <com-overview v-if="pageName === 'overview'"></com-overview>
      <com-object-overview v-if="pageName === 'object-overview'"></com-object-overview>
      <com-namespace v-else-if="pageName==='namespace'"></com-namespace>
      <com-domain v-else-if="pageName==='domain'"></com-domain>
      <com-properties v-else-if="pageName==='properties'"></com-properties>
      <com-assets v-else-if="pageName==='assets'"></com-assets>
      <com-relationships v-else-if="pageName==='relationships'"></com-relationships>
      <com-object v-else-if="pageName==='object'"></com-object>
      <com-developer v-else-if="pageName === 'developer'"></com-developer>
      <div v-else-if="pageName === 'domain'">domain</div>
      <div v-else>{{pageName}}</div>
    </div>
  </div>
</template>
<script>
import ComNav from './pages/nav/nav.vue'
import ComOverview from './pages/overview/main.vue'
import ComObjectOverview from './pages/overview/objectOverview.vue'
import ComDeveloper from './pages/developer/main.vue'
import ComNamespace from './pages/namespace/main.vue'
import ComDomain from './pages/domain/main.vue'
import ComProperties from './pages/properties/main.vue'
import ComAssets from './pages/assets/main.vue'
import ComRelationships from './pages/relationships/main.vue'
import ComObject from './pages/object/main.vue';
import Context from "@/next/service/metaModel/class/Context";
export default {
  components: {
    ComNav,
    ComOverview,
    ComObjectOverview,
    ComDeveloper,
    ComNamespace,
    ComDomain,
    ComProperties,
    ComAssets,
    ComRelationships,
    ComObject,
  },
  data() {
    return {
      pageName: 'overview',
      modelByDomain: {},
      domains: null,
    }
  },
  mounted() {
    $('.db-heading').hide()
  },
  methods: {
    openPage(pageName) {
      this.pageName = pageName;
    },
    async listDomains(forceUpdate) {
      if (!this.domains || forceUpdate) {
        await this.$http.post(`/metamodel/listDomains?${Context.ns}=${Context.namespace}`).then(res => {
          this.domains = res.data
        }).catch(e => {
          this.$showFailure(e)
        })
      } else {
        await new Promise((resolve) => {
          resolve(this.domains)
        })
      }
    },
    async loadModel(domain, forceUpdate) {
      if (!this.modelByDomain[domain] || forceUpdate) {
        await this.$http.post(`/metamodel/loadModel?namespace=${Context.namespace}&domain=${domain}`).then(res => {
          this.modelByDomain[domain] = res.data
        }).catch(e => {
          this.$showFailure(e)
        })
      } else {
        await new Promise((resolve) => {
          resolve(this.modelByDomain[domain])
        })
      }

    },
  },
}
</script>
<style scoped lang="scss">
.container {
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding: 20px;
}
.left-part {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 160px;
  overflow: auto;
  background-color: #545c64;
}
.right-part {
  background-color: #fff;
  //background-color: #795da3;
  position: absolute;
  overflow: auto;
  left: 160px;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 20px;
}
</style>
