<template>
  <div v-if="value" class="text" v-html="nl2br(value)"></div>
  <div v-else class="no-text">{{ $t('common.noDescription') }}</div>
</template>
<script>
export default {
  props: {
    value: {},
  },
  methods: {
    nl2br: value => {
      if (value) {
        return value.replace(/\n/g, '<br>')
      } else {
        return ''
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.text,
.no-text {
}
.text {
  color: #434b5a;
}
.no-text {
  color: #9f9f9f;
}
</style>
