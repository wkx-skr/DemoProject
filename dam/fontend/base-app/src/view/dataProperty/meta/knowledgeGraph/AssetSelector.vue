<template>
  <div>
    <meta-selector
      v-if="objectType === LDMTypes.Entity"
      ref="tableSelector"
      type="table"
      @select="handleMetaSelect"
    ></meta-selector>
    <meta-selector
      :key="comKey"
      v-else-if="objectType === LDMTypes.Attribute"
      ref="columnSelector"
      type="column"
      @select="handleMetaSelect"
    ></meta-selector>
    <standard-selector
      v-else-if="objectType === LDMTypes.Domain"
      :categoryTypeId="1"
      :hideFilter="true"
      :single="true"
    ></standard-selector>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
import MetaSelector from '@/components/common/metaSelector.vue'
import standardSelector from '@/view/dataProperty/meta/standardSelector'
export default {
  components: {
    MetaSelector,
    standardSelector,
  },
  data() {
    return {
      LDMTypes: LDMTypes,
      visible: false,
      objectType: null,
      comKey: 0,
    }
  },
  beforeDestroy() {
    this.$bus.$off('domainSelected')
  },
  methods: {
    init(objectType) {
      if (objectType) {
        this.objectType = objectType
      } else {
        throw new Error('未选择对象类型')
      }
      if (this.objectType === LDMTypes.Entity) {
        setTimeout(() => {
          this.comKey++
          this.$refs.tableSelector.init()
        })
      } else if (this.objectType === LDMTypes.Attribute) {
        setTimeout(() => {
          this.$refs.columnSelector.init()
        })
      } else if (this.objectType === LDMTypes.Domain) {
        this.$bus.$emit('callDomainSelector')
        this.$bus.$once('domainSelected', domain => {
          this.$emit('finish', {
            id: domain.domainId,
            name: domain.chineseName,
          })
        })
      }
    },
    handleMetaSelect({ model, table, column }) {
      if (this.objectType === LDMTypes.Entity) {
        this.$emit('finish', {
          id: table.objectId,
          name: table.physicalName,
        })
      } else if (this.objectType === LDMTypes.Attribute) {
        this.$emit('finish', {
          id: column.objectId,
          name: column.physicalName,
        })
      }
      /* console.log(model, table, column)
      this.tableId = table.objectId
      this.tableName = table.physicalName
      if (model.schema) {
        this.modelName = model.name + ' / ' + model.schema
      } else {
        this.modelName = model.name
      }
      this.tableLabelArray = [this.modelName, this.tableName] */
    },
  },
}
</script>

<style scoped></style>
