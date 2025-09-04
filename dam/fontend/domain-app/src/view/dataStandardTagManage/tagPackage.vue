<template>
  <el-tag
    :disable-transitions="disableTransitions"
    :type="type"
    :closable="closable"
    :hit="hit"
    :color="colorResult"
    :size="size"
    @click="click"
    @close="close"
    v-if="tagData && tagData.tagId"
    ref="currentTag"
    class="current-tag"
    :class="'current-tag' + tagId"
  >
    {{ tagData.name }}
  </el-tag>
</template>

<script>
export default {
  data() {
    return {
      loadedTag: false,
      tagData: {},
      propertiesColor: '',
    }
  },
  props: {
    tagId: {
      type: [String, Number],
      // required: true
    },
    tagMap: {
      type: Object,
      default: () => [],
    },
    oldTagData: {
      type: Object,
    },
    showCustomColor: {
      type: Boolean,
      default: false,
    },

    // element-ui prop
    type: {
      type: String,
    },
    closable: {
      type: Boolean,
    },
    disableTransitions: {
      type: Boolean,
      default: false,
    },
    hit: {
      type: Boolean,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
  },
  components: {},
  computed: {
    colorResult() {
      let result = ''
      if (this.propertiesColor) {
        result = this.propertiesColor
      }
      if (this.color) {
        result = this.color
      }
      return result
    },
  },
  mounted() {
    if (!this.tagMap || (this.tagMap.length <= 0 && !loadedTag)) {
      this.getTags(() => {
        this.dataInit()
      })
    } else {
      this.dataInit()
    }
  },
  methods: {
    getTags(callback) {
      this.loadedTag = true
      this.$http
        .get(this.$url + '/service/tags/')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            const map = {}
            res.data.forEach(item => {
              map[item.tagId] = item
            })
            this.tagMap = map
          }
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback()
        })
    },
    dataInit() {
      if (this.oldTagData && this.oldTagData.tagId) {
        this.tagId = this.oldTagData.tagId
      }
      this.tagData = this.tagMap[this.tagId] || this.oldTagData || {}

      if (this.showCustomColor) {
        this.resetTagStyle()
      }
    },
    click() {
      this.$emit('click', ...arguments)
    },
    close() {
      this.$emit('close', ...arguments)
    },
    resetTagStyle() {
      const properties = this.tagData && this.tagData.properties
      if (
        properties &&
        /css/.test(properties) &&
        this.$utils.isJSON(properties)
      ) {
        const obj = JSON.parse(properties)
        const styleObj = {}

        for (const key in obj) {
          if (/css/.test(key)) {
            styleObj[key.replace('css:', '')] = obj[key]
          }
        }
        this.$nextTick(() => {
          $(this.$refs.currentTag && this.$refs.currentTag.$el).css(styleObj)
          if (styleObj['background-color']) {
            this.propertiesColor = styleObj['background-color']
          }
        })
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.current-tag {
  /*max-width:120px;*/
  transform: translateY(-2px);
  display: inline-block;
  vertical-align: middle;
  opacity: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowarp;
  line-height: 24px;
}
</style>
