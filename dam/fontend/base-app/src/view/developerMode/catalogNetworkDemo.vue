<template>
  <div class="catalog-network">
    <catalog-network></catalog-network>
  </div>
</template>

<script>
import catalogNetwork from '@/view/dataCatalogNetwork/network.vue'
export default {
  data() {
    return {}
  },
  components: {
    catalogNetwork,
  },
  computed: {},
  mounted() {},
  methods: {},
  watch: {},
}
</script>

<style lang="scss">
.catalog-network {
  border: 1px solid red;
  position: relative;
  width: 100%;
  height: 500px;
}
</style>
