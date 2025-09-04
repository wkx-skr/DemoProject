<template>
  <div
    class="list-icon"
    :style="{fontSize: size + 'px', lineHeight: size + 'px'}"
  >
    <span
      v-if="iconType === 'icon'"
      class="table-icon"
      :style="{width: size, height: size,fontSize: size + 'px', lineHeight: size + 'px'}"
    >
      <i
        class="icon iconfont"
        :class="dataType"
        :style="{fontSize: size + 'px', lineHeight: size + 'px'}"
      ></i>
    </span>
    <datablau-icon
      v-else
      :dataType="dataType"
      :iconType="iconType"
      :size="size"
      class="list-icon-com"
    ></datablau-icon>
  </div>
</template>

<script>
export default {
  name: 'ListIcon',
  data() {
    return {}
  },
  props: {
    dataType: {
      type: String,
      default: '',
    },
    iconType: {
      default: 'icon', // icon, svg, png
      type: String,
    },
    url: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 18,
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit();
  },
  methods: {
    dataInit() {
    }
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.list-icon {
  display: inline-block;
  margin: 0;
  margin-right: 4px;
  padding: 0;
  overflow: hidden;
  vertical-align: middle;

  .list-icon-com {
    display: inline-block;

    .iconfont {
      vertical-align: bottom;
    }
  }
}

.table-icon {
  line-height: 0px;
  color: #999;
  font-size: 0;
}

</style>
