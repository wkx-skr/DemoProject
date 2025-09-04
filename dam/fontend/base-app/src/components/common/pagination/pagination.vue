<template>
  <div class="pagination">
    <span
      class="dir fa fa-angle-double-left"
      @click="emitCurrentPage('start')"
    ></span>
    <span class="dir fa fa-angle-left" @click="emitCurrentPage('prev')"></span>
    <span class="num">{{ currentPage }}/{{ max }}</span>
    <span class="dir fa fa-angle-right" @click="emitCurrentPage('next')"></span>
    <span
      class="dir fa fa-angle-double-right"
      @click="emitCurrentPage('end')"
    ></span>
  </div>
</template>

<script>
export default {
  props: ['currentPage', 'size', 'total'],
  data() {
    return {
      data: {
        currentPage: this.currentPage,
      },
    }
  },
  computed: {
    max() {
      return Math.ceil(this.total / this.size)
    },
  },
  mounted() {},
  methods: {
    emitCurrentPage(to) {
      switch (to) {
        case 'start':
          this.data.currentPage = 1
          break
        case 'prev':
          if (this.data.currentPage > 1) {
            this.data.currentPage -= 1
          } else {
            return
          }
          break
        case 'next':
          if (this.data.currentPage < this.max) {
            this.data.currentPage += 1
          } else {
            return
          }

          break
        case 'end':
          this.data.currentPage = this.max
          break
      }
      this.$emit('currentPageChange', this.data.currentPage)
    },
  },
}
</script>

<style lang="scss" scoped>
$outline: 1px solid #c6c6cf;
.pagination {
  font-size: 18px;
  .dir {
    display: inline-block;
    width: 30px;
    height: 25px;
    line-height: 25px;
    background-color: #f3f3f3;
    color: #c6c6cf;
    border: $outline;
    text-align: center;
    margin: 0;
    &.fa-angle-left,
    &.fa-angle-double-right {
      border-left: none;
    }
    cursor: pointer;
    &:hover {
      background-color: #ddd;
    }
  }
  .num {
    cursor: default;
    display: inline-block;
    height: 25px;
    line-height: 25px;
    font-size: 14px;
    font-weight: bold;
    padding: 0 0.6em;
    border-top: $outline;
    border-bottom: $outline;
  }
}
</style>
