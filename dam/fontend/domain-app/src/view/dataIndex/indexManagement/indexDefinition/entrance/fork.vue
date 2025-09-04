<template>
  <index-component :index-page="IndexPage.Fork"></index-component>
</template>

<script>
import IndexComponent from '../main.vue'
import { IndexPage } from './Constant'
export default {
  data() {
    return {
      IndexPage: IndexPage,
    }
  },
  components: {
    IndexComponent,
  },
}
</script>
