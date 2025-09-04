<script>
import Vue from "vue";

export default {
  name: "DbHiThere",
  props: {
    name: {
      type: String,
      default: 'there',
      required: false
    },
    'a-b-c': {
      type: Boolean,
      required: true
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