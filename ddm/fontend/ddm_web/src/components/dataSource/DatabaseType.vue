<template>
  <div>
    <div class="left-icon">
      <img
        :src="imageSrc"
        :class="dbtypeClass"
        style="width: 16px; height: 16px"
        alt=""
      />
    </div>
    <span class="dbname">
      {{ this.value | databaseLabel(te) }}
    </span>
  </div>
</template>

<script>
import {databaseType} from "@/components/dataSource/databaseType";
export default {
  props: ['value', 'size'],
  data () {
    let imageSrc
    let name = ''
    // 缺少 GBASE, ODPS,TABLEAU,Hive
    switch (this.value.toLowerCase()) {
      case 'oceanbase-oracle':
        imageSrc = './static/images/database/oracle.png'
        break
      case 'polar-db':
        imageSrc = './static/images/database/postgresql.png'
        break
      case 'mysql':
      case 'oceanbase':
      case 'oracle':
      case 'db2':
      case 'postgresql':
      case 'sqlserver':
      case 'csv':
      case 'es':
      case 'excel':
      case 'greenplum':
      case 'hana':
      case 'hbase':
      case 'mongodb':
      case 'teradata':
      case 'hive':
      case 'impala':
      case 'maxcompute':
      case 'hashdata':
      case 'hologres':
      case 'inceptor':
      case 'starrocks':
        imageSrc = `./static/images/database/${this.value.toLowerCase()}.png`
        break
      case 'db2i':
        name = 'db2'
        imageSrc = './static/images/database/db2.png'
        break
      case 'datadictionary':
        name = 'excel'
        imageSrc = `./static/images/database/${name}.png`
        break
      default:
        name = 'default'
        imageSrc = `./static/images/database/${name}.png`
        break
    }
    return {
      imageSrc: imageSrc,
      dbtypeClass: {
        mangodb: this.value.toLowerCase() === 'mongodb'
      }
    }
  },
  filters: {
    databaseLabel: function (value, te) {
      return te(value) || value
    }
  },
  methods: {
    te (value) {
      const databaseTypeMap = databaseType
      return databaseTypeMap[value]
    }
  }
}
</script>

<style lang="scss" scoped>
.left-icon {
  box-sizing: border-box;
  display: inline-block;
  width: 16px;
  height: 16px;
  position: relative;
  vertical-align: text-bottom;
  margin-right: 0.2em;
  img {
    // width: 16px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    &.mangodb {
      margin-left: 1px;
    }
  }
}
</style>
