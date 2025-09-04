<template>
  <div>
    <div v-for="p in Object.keys(extendProps)" :key="p">
      <p class="group-key">{{ p }}</p>
      <template>
        <attr-item
          v-for="(e, idx) in extendProps[p]"
          :key="e.key"
          :isOpen="isOpen"
          :editable="editable"
          :imgSrc="'/static/images/metadataIcon/udp.svg'"
          :attrKey="e.key"
          :attrValue="e.value ? e.value.value : ''"
          @save="data => savePropValue(p, idx, data, e)"
          @edit="edit"
          :editConfig="{
            editing: e.key === editingKey,
            type: e.value.type,
            typeData:
              e.value.type === 'ENUM'
                ? e.value.typeData.split(';').map(i => {
                    return { label: i, value: i }
                  })
                : null,
          }"
        ></attr-item>
      </template>
    </div>
  </div>
</template>

<script>
import AttrItem from './attrItem.vue'
// import udpImg from '/static/images/metadataIcon/udp.svg'
export default {
  name: 'extendProps',
  props: {
    extendProps: {
      type: Object,
      default: () => {
        return {}
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
    editingKey: {
      type: String,
      default: '',
    },
  },
  components: { AttrItem },
  data() {
    return {
      editing: false,
      editingProp: '',
      editingValue: '',
      // udpImg,
    }
  },
  methods: {
    edit(key) {
      this.$emit('edit', key)
    },
    savePropValue(p, idx, data, e) {
      this.$emit('saveExtendValue', { p, idx, v: data, target: e })
    },
  },
}
</script>

<style lang="scss" scoped>
.group-key {
  height: 34px;
  line-height: 32px;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
