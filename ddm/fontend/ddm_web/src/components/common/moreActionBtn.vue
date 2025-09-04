<template>
  <div class="more-act-con-2" :class="{'more-btn-active': btnActive}" @click="showFeatures" ref="btnOuter">
    <datablau-button
      class="more-act-btn"
      style="font-size: 12px;"
      type="secondary"
      size="small"
    >
      {{ $v.udp.MoreOperations }}
      <i class="iconfont icon-downarrow" style="margin-left: 6px;"></i>
    </datablau-button>
    <!-- @click="showFeatures" -->
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'moreAction',
  data () {
    return {
      btnActive: false
    }
  },
  props: {
    features: {
      type: Array,
      required: true
    }
  },
  components: {

  },
  computed: {
  },
  mounted () {

  },
  methods: {
    showFeatures (evt) {
      this.btnActive = true

      let $target = $(this.$refs.btnOuter)
      let position = $target.offset()
      let height = $target.outerHeight()
      let y = parseInt(position.top + height + 7)
      let x = parseInt(position.left)
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: this.features
      })

      $(window).one('mouseup', () => {
        this.btnActive = false
      })
    }
  },
  watch: {

  }
}
</script>

<style lang="scss" scoped>
.more-act-con-2 {
  display: inline-block;
  margin: 0;
  padding: 0;
}

.more-act-con {
  display: inline-block;
  vertical-align: top;
  padding: 6px 10px;
  line-height: 0;
  transition: all .4s;
  cursor: pointer;

  &:hover {
    background-color: #F5F7FA;
  }
  .more-act-btn {
    color: #888F9E;
    background-color: transparent;
    padding: 0;
    border: none;
    height: auto;
    .el-icon-arrow-down {
      transition: all .4s;
    }
  }
  &.more-btn-active {
    .more-act-btn {
      .el-icon-arrow-down {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
