<template>
  <div v-show="diffList.length > 0" style="margin-bottom: 5px;">
    <datablau-button type="text" :disabled="!hasPrev" @click="toPrev">上一个冲突</datablau-button>
    正在处理 <span v-if="currentDiffObj">{{currentDiffObj.start + 1}}</span> - <span v-if="currentDiffObj">{{currentDiffObj.end + 1}}</span>行的冲突
    <datablau-button type="text" :disabled="!hasNext" @click="toNext">下一个冲突</datablau-button>
    <datablau-button type="text" @click="useHead">使用线上的版本</datablau-button>
    <datablau-button type="text" @click="useLocal">使用本地的版本</datablau-button>
    <datablau-button type="text" @click="useConcat">合并版本</datablau-button>
  </div>
</template>

<script>
import ContentType from '@/dataWarehouse/views/sqlEditor/ContentType'

export default {
  data () {
    return {
      currentDiff: 0,
      editor: null
    }
  },
  methods: {
    toPrev () {
      this.currentDiff--
      this.revealLine()
    },
    toNext () {
      this.currentDiff++
      this.revealLine()
    },
    revealLine () {
      this.editor.revealLinesInCenter(this.currentDiffObj.start + 1, this.currentDiffObj.end + 1)
    },
    useHead () {
      const currentDiffObj = this.diffList[this.currentDiff]
      const list = this.resultList[this.currentCodeDetailId].slice(currentDiffObj.start, currentDiffObj.end)
      const result = this.resultList[this.currentCodeDetailId].slice(0, currentDiffObj.start)
      list.forEach(item => {
        if (item.type === ContentType.Minus) {
          item.type = ContentType.Normal
          result.push(item)
        }
      })
      this.resultList[this.currentCodeDetailId].slice(currentDiffObj.end + 1).forEach(item => {
        result.push(item)
      })
      this.editor.setValue(result.map(i => i.content).join('\n'))
      this.resultList[this.currentCodeDetailId] = result
      if (this.hasNext) {
      } else if (this.hasPrev) {
        this.currentDiff = 0
      }
      this.$bus.$emit('mo-highlight')
      this.revealLine()
    },
    useLocal () {
      const currentDiffObj = this.diffList[this.currentDiff]
      const list = this.resultList[this.currentCodeDetailId].slice(currentDiffObj.start, currentDiffObj.end)
      const result = this.resultList[this.currentCodeDetailId].slice(0, currentDiffObj.start)
      list.forEach(item => {
        if (item.type === ContentType.Plus) {
          item.type = ContentType.Normal
          result.push(item)
        }
      })
      this.resultList[this.currentCodeDetailId].slice(currentDiffObj.end + 1).forEach(item => {
        result.push(item)
      })
      this.editor.setValue(result.map(i => i.content).join('\n'))
      this.resultList[this.currentCodeDetailId] = result
      if (this.hasNext) {
      } else if (this.hasPrev) {
        this.currentDiff = 0
      }
      this.$bus.$emit('mo-highlight')
      this.revealLine()
    },
    useConcat () {
      const currentDiffObj = this.diffList[this.currentDiff]
      const list = this.resultList[this.currentCodeDetailId].slice(currentDiffObj.start, currentDiffObj.end)
      const result = this.resultList[this.currentCodeDetailId].slice(0, currentDiffObj.start)
      list.forEach(item => {
        if (item.type === ContentType.Minus || item.type === ContentType.Plus) {
          item.type = ContentType.Normal
          result.push(item)
        }
      })
      this.resultList[this.currentCodeDetailId].slice(currentDiffObj.end + 1).forEach(item => {
        result.push(item)
      })
      this.editor.setValue(result.map(i => i.content).join('\n'))
      this.resultList[this.currentCodeDetailId] = result
      if (this.hasNext) {
      } else if (this.hasPrev) {
        this.currentDiff = 0
      }
      this.$bus.$emit('mo-highlight')
      this.revealLine()
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.editor = this.$parent.$refs['editor'].monacoEditor
    })
  },
  props: {
    resultList: {},
    file: {}
  },
  computed: {
    currentCodeDetailId () {
      return this.file.codeDetailId
    },
    diffList () {
      const list = this.resultList[this.currentCodeDetailId]
      if (!list) {
        return []
      }
      const result = []
      let obj = {}
      list.forEach((item, index) => {
        if (item.type === ContentType.TopLine) {
          obj = {}
          obj.start = index
        } else if (item.type === ContentType.EndLine) {
          if (obj.hasOwnProperty('start')) {
            obj.end = index
            result.push(obj)
            obj = {}
          }
        }
      })
      if (result.length > 0) {
        // this.currentDiff = 0
        this.$nextTick(() => {
          this.revealLine()
        })
      }
      return result
    },
    currentDiffObj: {
      get () {
        try {
          return this.diffList[this.currentDiff]
        } catch (e) {
        }
        return null
      },
      set () {
        console.log('set')
      }
    },
    hasPrev () {
      return this.currentDiff > 0
    },
    hasNext () {
      return this.currentDiff < this.diffList.length - 1
    }
  }
}
</script>

<style scoped>

</style>
