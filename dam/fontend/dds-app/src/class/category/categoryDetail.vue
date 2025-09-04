<template>
  <div>category-detail</div>
</template>

<script>
export default {
  name: 'categoryDetail',
  props: {
    dataId: {
      type: Number,
      required: true,
    },
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      const data = this.$modelCategoriesDetailsMap[this.dataId]
      console.log(data)
    },
  },
}
</script>

<style scoped></style>
