<template>
  <div
    class="datablau-meta-data-attr"
    :class="{
      'min-datablau-meta-data-attr': !isOpen,
      'min-screen-meta-data-attr': minScreen || isMin,
    }"
  >
    <div class="middle-line"></div>
    <div class="data-attr-box">
      <div class="icon-operation" @click="openBtn" v-if="minScreen || isMin">
        <img v-if="!isOpen" src="@/assets/images/search/open.svg" alt="" />
        <img v-else src="@/assets/images/search/packUp.svg" alt="" />
        {{ isOpen ? '收起' : '展开' }}
      </div>
      <div class="attr-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatablauMetaDataAttr',
  props: {
    operationOpen: {
      type: Function
    },
    width: {
      type: [Number, String],
      default: 1440
    },
    isMin: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isOpen: true,
      minScreen: false,
      screenWidth: 0
    }
  },
  watch: {
    // screenWidth (width) {
    //   if (width <= parseInt(this.width)) {
    //     this.minScreen = true
    //     this.isOpen = false
    //   } else {
    //     this.minScreen = false
    //     this.isOpen = true
    //   }
    //   this.sentParent()
    // }
  },
  mounted () {
    if (!this.isMin) {
      this.screenWidth = document.body.clientWidth
      window.addEventListener('resize', this.listenResize)
    } else {
      // this.isOpen = false
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.listenResize)
  },
  methods: {
    listenResize () {
      if (!this.isMin) {
        this.screenWidth = document.body.clientWidth
      }
    },
    openBtn () {
      this.isOpen = !this.isOpen
      this.sentParent()
    },
    sentParent () {
      const params = {
        minScreen: this.minScreen,
        isOpen: this.isOpen
      }
      this.operationOpen(params)
    }
  }
}
</script>

<style scoped lang="scss">
.datablau-meta-data-attr {
  width: 290px;
  position: absolute;
  top: 1px;
  bottom: 0px;
  right: 0px;
  background: #fff;
  transition: all 0.3s;
  z-index: 9999;
  &.min-datablau-meta-data-attr {
    width: 80px;
    transition: all 0.3s;
    .middle-line {
      right: 70px;
      transition: all 0.3s;
      display: none;
    }
    .data-attr-box {
      transition: all 0.3s;
      width: 80px;
      box-shadow: -5px 0px 14px -8px rgba(0, 0, 0, 0.2);
      .icon-operation {
        padding: 0 8px;
        padding-right: 0;
        transition: all 0.3s;
      }
      .attr-content {
        transition: all 0.3s;
        top: 30px;
        padding: 0 8px;
        .attr-items {
          width: 54px;
          text-align: center;
          /deep/ .attr-item {
            .item-key {
              width: 100%;
              margin-right: 0;
            }
          }
        }
        /deep/ .attr-item {
          width: 54px;
          text-align: center;
          .item-key {
            width: 100%;
            margin-right: 0;
            img {
              margin-right: 0;
            }
          }
        }
      }
    }
  }
  &.min-screen-meta-data-attr {
    .middle-line {
      display: none;
    }
    .data-attr-box {
      box-shadow: -5px 0px 14px -8px rgba(0, 0, 0, 0.2);
      .attr-content {
        transition: all 0.3s;
        top: 30px;
      }
    }
  }
  .middle-line {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 290px;
    width: 1px;
    background: #d8d8d8;
    transition: all 0.3s;
  }
  .data-attr-box {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0;
    left: 0;
    overflow: auto;
    // padding: 10px 20px;
    // transition: all 0.3s;
    .icon-operation {
      padding-top: 8px;
      padding-bottom: 8px;
      color: #409eff;
      line-height: 24px;
      padding-left: 16px;
      cursor: pointer;
      background: #fff;
      position: relative;
      z-index: 9;
      vertical-align: middle;
      img {
        display: inline-block;
      }
    }
    .attr-content {
      position: absolute;
      top: 0px;
      bottom: 0px;
      right: 0;
      left: 0;
      overflow: auto;
      padding: 10px 0 10px 20px;
      transition: all 0.3s;
      .el-tag {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
