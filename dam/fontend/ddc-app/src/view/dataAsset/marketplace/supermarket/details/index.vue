<template>
  <router-view />
</template>

<script>
import api from '../../../utils/api'
export default {
  name: 'AssetDetails',
  mounted() {
    console.log('进入详情页')
    let catalogId, assetType, itemId, assetId
    console.log(this.$route.name)
    switch (this.$route.name) {
      case 'viewDetails':
        catalogId = this.$route.query.catalogId
        itemId = this.$route.query.objectId
        assetId = this.$route.query.id
        assetType = 'VIEW'
        break
      case 'columnDetails':
        catalogId = this.$route.query.catalogId
        itemId = this.$route.query.objectId
        assetId = this.$route.query.id
        assetType = 'DATA_OBJECT'
        break
      case 'tableDetails':
        catalogId = this.$route.query.catalogId
        itemId = this.$route.query.objectId
        assetId = this.$route.query.id
        assetType = 'TABLE'
        break
      case 'fileDetails':
        catalogId = this.$route.query.catalogId
        itemId = this.$route.query.objectId
        assetId = this.$route.query.id
        assetType = 'FILE'
        break
      case 'reportDetails':
        catalogId = this.$route.query.catalogId
        itemId = this.$route.query.objectId
        assetId = this.$route.query.id
        assetType = 'REPORT'
        break
      case 'catalogDetails':
        catalogId = this.$route.query.id
        itemId = this.$route.query.id
        assetId = this.$route.query.id
        assetType = 'CATALOG'
        break
      default:
        catalogId = ''
        itemId = ''
        assetId = ''
        assetType = ''
    }
    api.toVisitAsset({
      catalogId,
      assetType,
      itemId,
      assetId,
    })
  },
}
</script>

<style></style>
