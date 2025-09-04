<template>
  <div class="box">
    <datablau-button type="icon" class="iconfont icon-prevdifference" @click="prevConflict" :disabled="!options.hasPrevConflict" title="上个差异(Shift+Up)"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-nextdifference" @click="nextConflict" :disabled="!options.hasNextConflict" title="下个差异(Shift+Down)"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-topdifference" @click="firstConflict" title="首位差异(Shift+Home)"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-enddifference" @click="lastConflict" title="末位差异(Shift+End)"></datablau-button>
    <span class="gun">|</span>
    <datablau-button type="icon" class="iconfont icon-copyleft" @click="valueToLeft" title="复制到左侧(Shift+Left)"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-copyright" @click="valueToRight" title="复制到右侧(Shift+Right)"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-alluseleft" @click="allValueToLeft" title="全部复制到左侧"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-alluseright" @click="allValueToRight" title="全部复制到右侧"></datablau-button>
    <span class="gun">|</span>
    <datablau-button type="icon" class="iconfont icon-useleft" @click="useLeft" title="使用左侧并关闭窗口"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-useright" @click="useRight" title="使用右侧并关闭窗口"></datablau-button>
    <span class="gun">|</span>
    <datablau-button type="icon" class="iconfont icon-autorefresh" @click="toggleAutoRefresh" :title="autoRefreshLabel"></datablau-button>
    <datablau-button type="icon" class="iconfont icon-refresh" @click="refresh" title="刷新(F5)"></datablau-button>
  </div>
</template>
<script>
import { MoveValueMethod } from '@/dataWarehouse/components/winMerge/Constant'

export default {
  mounted () {
    this.initKeyboardEventListeners()
  },
  props: {
    options: {
      type: Object
    }
  },
  beforeDestroy () {
    $(document).off('keydown', this.handleKeyDown)
  },
  data () {
    return {
      autoRefresh: true,
      conflictOnly: false
    }
  },
  methods: {
    initKeyboardEventListeners () {
      $(document).on('keydown', this.handleKeydown)
    },
    handleKeydown (keyboardEvent) {
      if (['F5', 'Escape'].includes(keyboardEvent.key)) {
        keyboardEvent.preventDefault()
        keyboardEvent.stopPropagation()
      }
      // 很多热键都被占用了,使用Shift代替Alt
      if (keyboardEvent.key === 'F5') {
        this.refresh()
      }
      if (!keyboardEvent.altKey && !keyboardEvent.ctrlKey && keyboardEvent.shiftKey) {
        switch (keyboardEvent.key) {
          case 'ArrowDown':
            if (this.options.hasNextConflict) {
              this.nextConflict()
            } else {
              this.$message.warning('没有下一个差异了')
            }
            break
          case 'ArrowUp':
            if (this.options.hasPrevConflict) {
              this.prevConflict()
            } else {
              this.$message.warning('没有上一个差异了')
            }
            break
          case 'ArrowRight':
            this.valueToRight()
            break
          case 'ArrowLeft':
            this.valueToLeft()
            break
          case 'Home':
            this.firstConflict()
            break
          case 'End':
            this.lastConflict()
            break
          default:
            console.log(keyboardEvent.keyCode)
            break
        }
      }
    },
    prevConflict () {
      this.$emit('conflict-index', -1)
    },
    nextConflict () {
      this.$emit('conflict-index', 1)
    },
    firstConflict () {
      this.$emit('conflict-index', 0)
    },
    lastConflict () {
      this.$emit('conflict-index', Number.MAX_SAFE_INTEGER)
    },
    toggleAutoRefresh () {
      this.autoRefresh = !this.autoRefresh
      this.$emit('toggle-auto-refresh', this.autoRefresh)
    },
    refresh () {
      this.$emit('conflict-index')
    },
    valueToRight () {
      this.$emit('move-value', MoveValueMethod.LeftToRight)
    },
    valueToLeft () {
      this.$emit('move-value', MoveValueMethod.RightToLeft)
    },
    allValueToRight () {
      this.$emit('move-value', MoveValueMethod.LeftAllToRight)
    },
    allValueToLeft () {
      this.$emit('move-value', MoveValueMethod.RightAllToLeft)
    },
    useLeft () {
      this.$DatablauCofirm('确定要使用左侧脚本吗？该操作将要关闭对话框', '').then(() => {
        this.$emit('use-value', true)
      }).catch()
    },
    useRight () {
      this.$DatablauCofirm('确定要使用右侧脚本吗？该操作将要关闭对话框', '').then(() => {
        this.$emit('use-value', false)
      }).catch()
    },
    toggleConflictOnly () {
      this.$emit('toggle-conflict-only', this.conflictOnly)
      this.conflictOnly = !this.conflictOnly
    }
  },
  computed: {
    autoRefreshLabel () {
      return this.autoRefresh ? '自动刷新' : '手工刷新'
    },
    conflictOnlyLabel () {
      return this.conflictOnly ? '仅显示冲突内容' : '显示全部内容'
    }
  }
}
</script>
<style lang="scss" scoped>
.box {
  height: 50px;
  /*background-color: azure;*/
  margin-top: -5px;
}
.gun {
  margin: 0 10px;
}
</style>
