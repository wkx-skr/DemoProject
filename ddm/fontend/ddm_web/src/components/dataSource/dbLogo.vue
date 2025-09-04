<template>
  <div>
    <div class="db-logo-container">
      <img
        :src="`${webPath}static/image/DBlogos/${fileName}`"
        :width="logoWidth"
        :height="logoHeight"
      >
    </div>
  </div>
</template>

<script>
import dbType from '@/components/dataSource/databaseType.js'

export default {
  name: 'dbLogo',
  data() {
    return {
      dbMap: dbType.dbMap,
      webPath: window.setting.products.ddm.webPath,
      logoNameMap: {
        'GaussDB': 'GaussDBA.png',
        'CBase': 'CBase.svg'
      },
    }
  },
  props: {
    dbType: {
      type: String,
      required: true
    },
    logoWidth: {
      type: Number,
      default: 112
    },
    logoHeight: {
      type: Number,
      default: 48
    }
  },
  components: {},
  computed: {
    fileName() {
      let dbName = this.dbMap[this.dbType.toUpperCase() === 'GAUSSDB' ? 'GAUSSDBA' : this.dbType.toUpperCase()]
      return this.logoNameMap[dbName] || (dbName + '.png')
    }
  },
  mounted() {
    this.dataInit();
  },
  methods: {
    dataInit() {
      // console.log("dataInit");
    }
  },
  watch: {},
}
</script>

<style lang="scss" scoped>


</style>
