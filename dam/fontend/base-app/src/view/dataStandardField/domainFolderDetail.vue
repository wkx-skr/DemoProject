<template>
  <div class="domain-folder-detail">
    <div class="top-line">
      <datablau-breadcrumb
        :node-data="pathData"
        :couldClick="false"
        @back="backClick"
      ></datablau-breadcrumb>
    </div>

    <div class="domain-list-outer">
      <data-standard
        :typeIds="categoryId"
        :hasEditAuth="hasEditAuth"
      ></data-standard>
    </div>
  </div>
</template>

<script>
import dataStandard from '@/view/newDataStandard/main.vue'

export default {
  name: 'domainFolderDetail',
  data() {
    return {
      // hasEditAuth: true,
    }
  },
  props: {
    categoryId: {
      type: [String, Number],
      required: true,
    },
    hasEditAuth: {
      type: Boolean,
      default: false,
    },
    pathData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  components: { dataStandard },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      console.log('dataInit')
    },
    backClick() {
      this.$emit('backClick')
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.domain-folder-detail {
  .top-line {
    padding: 8px 0 6px 20px;
    border-bottom: 1px solid var(--border-color-lighter);
  }

  .domain-list-outer {
    @include absPos();
    top: 40px;
  }
}
</style>
