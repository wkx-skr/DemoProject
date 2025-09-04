<template>
  <div
    style="
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: #fff;
    "
  >
    <iframe
      :key="key"
      v-if="src"
      :src="src"
      style="width: 100%; height: 99%"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
export default {
  data() {
    return { src: '', key: 0 }
  },
  beforeMount() {
    this.load()
  },
  mounted() {
    setTimeout(() => {
      Ps.destroy(this.$el)
    })
  },
  methods: {
    load() {
      this.src = Object.keys(this.$route.query)[0]
    },
  },
  watch: {
    $route() {
      this.load()
      this.key++
    },
  },
}
</script>

<style scoped></style>
