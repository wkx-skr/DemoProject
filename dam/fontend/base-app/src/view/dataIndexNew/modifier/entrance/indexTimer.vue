<template>
  <modifier-component
    :modifier-category="ModifierCategory.TIME_PERIOD"
  ></modifier-component>
</template>

<script>
import ModifierComponent from '../main.vue'
import { ModifierCategory } from './Constant'
export default {
  data () {
    return {
      ModifierCategory: ModifierCategory
    }
  },
  components: {
    ModifierComponent
  }
}
</script>
