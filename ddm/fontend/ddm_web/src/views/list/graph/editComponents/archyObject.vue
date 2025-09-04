<template>
  <div class="archy-object-wrapper">
    <archy-up-tree v-show="!currentCategory" @chooseCategory="chooseCategory"></archy-up-tree>
    <archy-list v-if="currentCategory" @clearCategory="clearCategory" :categoryData="currentCategory"></archy-list>
  </div>
</template>

<script>
import archyUpTree from '@/views/list/graph/editComponents/archyUpTree.vue'
import archyList from '@/views/list/graph/editComponents/archyList.vue'
export default {
  components: {
    archyUpTree,
    archyList
  },
  data () {
    return {
      currentCategory: null
    }
  },
  methods: {
    clearCategory () {
      this.currentCategory = null
    },
    chooseCategory ({ data, node }) {
      this.currentCategory = data
    }
  }
}
</script>

<style lang="scss" scoped>
.archy-object-wrapper {
  position:absolute;
  top:0px;
  bottom:0;
  left:30px;
  right:0;
  border-left: 1px solid #ddd;
}
</style>
