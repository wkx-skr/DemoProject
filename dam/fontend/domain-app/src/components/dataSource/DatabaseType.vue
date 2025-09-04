<template>
  <div>
    <div class="left-icon" v-if="!noIcon">
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
export default {
  props: ['value', 'size', 'noIcon'],
  data() {
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
        imageSrc = `./static/images/database/${this.value.toLowerCase()}.png`
        break
      case 'db2i':
        name = 'db2'
        imageSrc = './static/images/database/db2.png'
        break
      case 'datadictionary':
      case 'datadictionary_logical':
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
        mangodb: this.value.toLowerCase() === 'mongodb',
      },
    }
  },
  filters: {
    databaseLabel: function (value, te) {
      return te(value) || value
    },
  },
  methods: {
    te(value) {
      const databaseTypeMap = {
        OFFLINEDUMP: 'Offline Dump',
        OFFLINEDUMP_RAW: 'Offline Dump_ex',
        ORACLE: 'Oracle',
        SQLSERVER: 'SQL Server',
        MYSQL: 'MySQL',
        OCEANBASE: 'OceanBase',
        'OCEANBASE-ORACLE': 'OceanBase-Oracle',
        POSTGRESQL: 'PostgreSQL',
        'POLAR-DB': 'Polar-DB',
        GAUSSDB: 'GaussDB',
        GREENPLUM: 'Greenplum',
        DB2: 'DB2',
        DB2I: 'DB2 for iSeries',
        GBASE: 'GBase',
        HANA: 'Hana',
        MAXCOMPUTE: 'MaxCompute',
        TERADATA: 'Teradata',
        CUSTOMIZED: 'Custom Driver',
        EXCEL: 'Excel',
        CSV: 'CSV',
        DATADICTIONARY: 'Data Dictionary(Physical)',
        DATADICTIONARY_LOGICAL: 'Data Dictionary(Logical)',
        TABLEAU: 'Tableau',
        SMBSHAREFILE: 'File Storage Server', // 文件类资产
        HBASE: 'HBASE',
        HIVE: 'Hive',
        IMPALA: 'Impala',
        MONGODB: 'MongoDB',
        ES: 'Elasticsearch',
        INCEPTOR: 'Transwarp-Inceptor',
        FUSIONINSIGHT: 'FusionInsight',
        CLICKHOUSE: 'ClickHouse',
        Vertica: 'VERTICA',
      }
      return databaseTypeMap[value]
    },
  },
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
