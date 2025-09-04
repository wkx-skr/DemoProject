<template>
  <div
    style="
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      overflow: auto;
    "
  >
    <registered @got="registeredGot"></registered>
    <functions ref="functions"></functions>
    <edit-function
      v-if="registered"
      :registered="registered"
      @update="updateFunctions"
    ></edit-function>
  </div>
</template>

<script>
import registered from './registered.vue'
import functions from './functions.vue'
import editFunction from './editFunction.vue'
export default {
  components: {
    registered,
    functions,
    editFunction,
  },
  data() {
    return {
      registered: null,
    }
  },
  methods: {
    registeredGot(registered) {
      this.registered = registered
    },
    updateFunctions() {
      this.$refs.functions.getFunctions()
    },
  },
}
</script>

<style scoped></style>
