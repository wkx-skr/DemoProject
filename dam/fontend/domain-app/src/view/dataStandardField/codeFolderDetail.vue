<template>
  <div class="code-folder-detail">
    <div class="top-line">
      <datablau-breadcrumb
        :node-data="pathData"
        :couldClick="false"
        @back="backClick"
      ></datablau-breadcrumb>
    </div>

    <div class="domain-list-outer">
      <standard-code
        :typeIds="categoryId"
        :hasEditAuth="hasEditAuth"
      ></standard-code>
    </div>
  </div>
</template>

<script>
import standardCode from '@/view/dataStandardCode/code.vue'

export default {
  name: 'codeFolderDetail',
  data() {
    return {}
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
  components: { standardCode },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      console.log('dataInit1')
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

.code-folder-detail {
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
