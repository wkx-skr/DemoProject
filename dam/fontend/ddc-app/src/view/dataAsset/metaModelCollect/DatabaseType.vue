<template>
  <div>
    <div
      class="left-icon"
      v-if="!hideIcon"
      :style="`width: ${size}px;height: ${size}px;`"
    >
      <datablau-tooltip
        :content=" this.label || this.mapValue "
        style="display: inline-block;"
        :disabled="!showIconTooltip"
      >
        <img
          :src="imageSrc"
          :class="dbtypeClass"
          :style="`width: ${size}px;height: ${size}px;margin-right:4px;`"
          alt="">
      </datablau-tooltip>
    </div>
    <span v-if="!hideLabel">
      <span class="dbname">
        {{ this.label || this.mapValue }}
      </span>
    </span>

  </div>
</template>

<script>
import dbType from './databaseType.js'
export default {
  props: {
    value: { // 数据库类型
      required: true
    },
    showIconTooltip: { // 当仅显示图标时, 可以显示 tooltip
      default: false,
    },
    size: {
      type: Number,
      default: 16
    },
    hideLabel: { // 是否隐藏 文本
      default: false,
    },
    hideIcon: { // 是否隐藏图标
      default: false,
    },
    label: { // 数据库名称, 优先级高于通过 value mapping 的 名称
      default: '',
    },
  },
  data() {
    let imageSrc
    let name = ''
    let dbName = this.value || ''
    let mapValue = this.value || ''
    // if (mapValue.toLowerCase() === 'logical') {
    //   mapValue = '逻辑'
    // } else if (mapValue.toLowerCase() === 'logicalbusinessdomain') {
    //   mapValue = '业务领域-逻辑'
    // } else if (mapValue.toLowerCase() === 'logicalbusinessobject') {
    //   mapValue = '业务对象-逻辑'
    // } else if (mapValue.toLowerCase() === 'logicalapp') {
    //   mapValue = '应用-逻辑'
    // } else if (mapValue.toLowerCase() === 'conceptual') {
    //   mapValue = '概念'
    // } else if (mapValue.toLowerCase() === 'conceptualbusinessdomain') {
    //   mapValue = '业务领域-概念'
    // }
    let obj = dbType.dbMapObj[mapValue.toUpperCase() === 'GAUSSA' ? 'GAUSSDBA' :mapValue.toUpperCase() ]
    if(obj) {
      mapValue = obj.text2 || obj.text
    }
    // 缺少  ODPS,TABLEAU
    switch (dbName.toLowerCase()) {
      case 'mysql':
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
      case 'mariadb':
      case 'teradata':
      case 'hive':
      case 'impala':
      case 'maxcompute':
      case 'gbase':
      case 'opengauss':
      case 'goldendb':
      case 'hashdata':
      case 'hologres':
      case 'inceptor':
      case 'starrocks':
      case 'clickhouse':
      case 'vertica':
      case 'tidb':
      case 'dameng':
      case 'tdsqlmysql':
      case 'informix':
      case 'doris':
      case 'argodb':
      case 'hudionhivespark':
      case 'icebergonhivespark':
      case 'gauss100':
      case 'tdsqlpostgresql':
      case 'kingbasees':
        imageSrc = require(`@/assets/images/database/${this.value.toLowerCase()}.png`)
        break
      case 'cbase':
        imageSrc = require(`@/assets/images/database/${this.value.toLowerCase()}.svg`)
        break
      case 'logical':
        imageSrc = require(`@/assets/images/database/logical.svg`)
        break
      case 'gaussdb/a':
      case 'gaussa':
      case 'gaussdb':
      case 'gaussdba':
        imageSrc = require(`@/assets/images/database/gaussdb.png`)
        break
      case 'db2luw':
        imageSrc = require(`@/assets/images/database/db2.png`)
        break
      case 'cassandra':
        imageSrc = require(`@/assets/images/database/cassandra.svg`)
        break
      case 'db2i':
        name = 'db2'
        imageSrc = `${this.$url}/static/images/database/db2.png`
        break
      case 'datadictionary':
        name = 'excel'
        imageSrc = `${this.$url}/static/images/database/${name}.png`
        break
      case 'logicalbusinessdomain':
        imageSrc = require(`@/assets/images/database/logical.svg`)
        break
      case 'logicalbusinessobject':
        imageSrc = require(`@/assets/images/database/logical.svg`)
        break
      case 'logicalapp':
        imageSrc = require(`@/assets/images/database/logical.svg`)
        break
      case 'conceptual':
        imageSrc = require(`@/assets/images/database/conceptual.svg`)
        break
      case 'conceptualbusinessdomain':
        imageSrc = require(`@/assets/images/database/conceptual.svg`)
        break
      case 'tree-flinksql':
      case 'tree-flinkjar':
      case 'tree-gbase':
      case 'tree-hive':
      case 'tree-java':
      case 'tree-python':
      case 'tree-shell':
        imageSrc = require(`@/assets/images/database/${this.value.toLowerCase()}.svg`)
        break
      case 'tree-flink_stream' :
      case 'tree-flinkstream' :
        imageSrc = require(`@/assets/images/database/tree-flinkjar.svg`)
        break
      case 'tree-mysql':
      case 'tree-oracle':
      case 'tree-postgresql':
      case 'tree-sqlserver':
      case 'tree-spark':
      case 'tree-starrocks':
      case 'tree-transwarp-inceptor':
        imageSrc = require(`@/assets/images/database/${this.value.toLowerCase()}.png`)
        break
      case 'tree-migration':
        imageSrc = require(`@/assets/images/database/tree-migration.svg`)
        break
      case 'tree-transformation':
        imageSrc = require(`@/assets/images/database/tree-transformation.svg`)
        break
      case 'tree-job':
        imageSrc = require(`@/assets/images/database/tree-job.svg`)
        break
     /* case 'java':
        imageSrc = require(`@/assets/images/database/java.svg`)
        break
      case 'python':
        imageSrc = require(`@/assets/images/database/python.svg`)
        break
      case 'flinkjar':
        imageSrc = require(`@/assets/images/database/flinkjar.svg`)
        break
      case 'flinksql':
        imageSrc = require(`@/assets/images/database/flinksql.svg`)
        break
      case 'transwarp-inceptor':
        imageSrc = require(`@/assets/images/database/transwarpInceptor.png`)
        break*/
      case 'tree-file':
        imageSrc = require(`@/assets/images/database/file.png`)
        break
      default:
        if (dbName.toLowerCase().indexOf('oceanbase') !== -1) {
          name = 'oceanbase'
          imageSrc = require(`@/assets/images/database/oceanbase.png`)
          break
        }
        if (dbName.toLowerCase().indexOf('clickhouse') !== -1) {
          name = 'clickhouse'
          imageSrc = require(`@/assets/images/database/clickhouse.png`)
          break
        }
        if (dbName.toLowerCase().indexOf('db2') !== -1) {
          name = 'db2'
          imageSrc = require(`@/assets/images/database/db2.png`)
          break
        }
        if (dbName.toLowerCase().indexOf('polardb') !== -1) {
          name = 'polardb'
          imageSrc = require(`@/assets/images/database/polardb.png`)
          break
        }
        name = 'default'
        imageSrc = require(`@/assets/images/database/default.png`)
        break
    }
    return {
      imageSrc: imageSrc,
      dbtypeClass: {
        mangodb: dbName.toLowerCase() === 'mongodb'
      },
      mapValue
    }
  },
  beforeMount () {
  },
  mounted () {
    if (this.value !== 'ORACLE' && this.value !== 'MYSQL') {
    }
  }
}
</script>

<style lang="scss" scoped>
.left-icon {
  box-sizing: border-box;
  display: inline-block;
  //width: 16px;
  //height: 16px;
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
