<template>
  <div :style="style"></div>
</template>

<script>
export default {
  data() {
    return {
      style: {
        position: 'absolute',
      },
    }
  },
  props: {
    width: Number,
    height: Number,
    color: String,
  },
  beforeMount() {
    this.style.width = this.width + 'px'
    this.style.height = this.height + 'px'
    this.style.border = `${this.width / 2}px solid transparent`
    this.style.borderTopWidth = 0
    this.style.borderBottom = `${this.height}px solid ${this.color}`
  },
}
</script>
