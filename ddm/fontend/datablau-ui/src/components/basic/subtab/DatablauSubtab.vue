<template>
  <div class="datablau-subtab" v-if="tabs && tabs.length">
    <div
      v-for="(item, index) in tabs"
      @click="tabChange(item, index)"
      :class="{ 'subtab-item': true, active: curIndex == index }"
      :key="index"
      ref="tab"
    >
      {{ item[showName] }}
    </div>
    <div class="modal"></div>
  </div>
</template>
<script>
export default {
  name: 'DatablauSubtab',
  props: {
    tabs: {
      type: Array,
      default: () => {
        return []
      },
    },
    showName: {
      type: String,
      default: 'name',
    },
    current: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      curIndex: 0,
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.current) {
        this.tabChange(this.tabs[this.current], this.current)
      } else {
        this.tabChange(null, 0)
      }
    }, 200)
  },
  methods: {
    tabChange(item, index) {
      let tabArr = this.$refs.tab
      let left = tabArr.slice(0, index).reduce((result, cur) => {
        return result + cur.clientWidth
      }, 4)
      $('.modal').css({
        width: tabArr[index].clientWidth + 'px',
        left: left + 'px',
      })
      this.curIndex = index
      if (item === null) return
      this.$emit('change', item, index)
    },
  },
}
</script>
<style lang="scss">
@import '../../color.sass';
.datablau-subtab {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  padding: 4px;
  border-radius: 2px;
  background: #f5f5f5;
  box-sizing: border-box;
  position: relative;
  clear: both;
  .modal {
    height: 26px;
    background-color: #fff;
    position: absolute;
    top: 3px;
    //transition: left 0.3s;
    transition-property: left, width;
    transition-duration: 0.3s, 0.2s;
  }
  .subtab-item {
    height: 26px;
    line-height: 26px;
    padding: 0 16px;
    float: left;
    cursor: pointer;
    position: relative;
    z-index: 1;
    transition: background 0.4s;
    color: $grey-1;
    &.active {
      color: #409eff;
    }
  }
}
</style>
