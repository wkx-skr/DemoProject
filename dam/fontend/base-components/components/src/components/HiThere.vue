<script>
export default {
  name: "HiThere",
  props: {
    name: {
      type: String,
      default: 'there',
      required: false
    }
  },
  methods: {
    onClick() {
      this.$emit('on-click', this.name)
    }
  }
}
</script>

<template>
  <span @click="onClick">Hi, {{name}}!</span>
</template>

<style scoped>

</style>