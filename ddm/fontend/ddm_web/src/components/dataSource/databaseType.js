import Vue from 'vue'
import store from '@/store'
import i18n from '@/next/i18n'

// console.log(store.state.lic.archy, 'this.$store.state.lic.archy')
const This = i18n
This.$t = i18n.t

// 模型规则检查 支持的模型类型
// first: 中文, 不推荐使用
// second: 英文 大写, 返回给后台
// text: 展示
// text2: 展示, (概念模型与逻辑模型) 优先使用 text2, 没有的用 text1
const DB_TYPE_TREE = {
  'name': 'root',
  'type': 'root',
  'subTree': [
    {
      'name': '概念模型',
      'type': 'Conceptual Data Model',
      'dataSourceTypeList': [
        {
          'first': '概念模型',
          'second': 'CONCEPTUAL',
          'text': 'CONCEPTUAL',
          'text2': '概念',
        },
        {
          'first': '业务领域概念模型',
          'second': 'CONCEPTUALBUSINESSDOMAIN',
          'text': 'CONCEPTUALBUSINESSDOMAIN',
          'text2': '业务领域-概念',
        }
      ]
    },
    {
      'name': '逻辑数据模型',
      'type': 'Logical Data Model',
      'dataSourceTypeList': [
        {
          'first': '逻辑模型',
          'second': 'LOGICAL',
          'text': 'LOGICAL',
          'text2': '逻辑',
        },
        {
          'first': '业务领域逻辑模型',
          'second': 'LOGICALBUSINESSDOMAIN',
          'text': 'LOGICALBUSINESSDOMAIN',
          'text2': '业务领域-逻辑',
        },
        {
          'first': '业务对象逻辑模型',
          'second': 'LOGICALBUSINESSOBJECT',
          'text': 'LOGICALBUSINESSOBJECT',
          'text2': '业务对象-逻辑',
        },
        {
          'first': '应用逻辑模型',
          'second': 'LOGICALAPP',
          'text': 'LOGICALAPP',
          'text2': '应用-逻辑',
        }
      ]
    },
    {
      'name': '关系型数据模型',
      'type': 'Relational Data Model',
      'dataSourceTypeList': [
        {
          'first': 'MYSQL',
          'second': 'MYSQL',
          text: 'MySQL',
        },
        {
          'first': 'ORACLE',
          'second': 'ORACLE',
          text: 'Oracle',
        },
        {
          'first': 'POSTGRESQL',
          'second': 'POSTGRESQL',
          text: 'PostgreSQL',
        },
        {
          'first': 'SQLSERVER',
          'second': 'SQLSERVER',
          text: 'SQLServer',
        },
        {
          'first': 'MARIADB',
          'second': 'MARIADB',
          text: 'MariaDB'
        },
        {
          'first': 'GAUSSDBA',
          'second': 'GAUSSDBA',
          text: 'GaussDB',
        },
        {
          'first': 'OPENGAUSS',
          'second': 'OPENGAUSS',
          text: 'OpenGauss',
        },
        {
          'first': 'HIVE',
          'second': 'HIVE',
          text: 'Hive',
        },
        {
          'first': 'DB2LUW',
          'second': 'DB2LUW',
          text: 'DB2LUW',
        },
        // {
        //   first: 'GAUSS100',
        //   second: 'GAUSS100',
        //   text: 'Gauss100'
        // },
        {
          'first': 'GBASE',
          'second': 'GBASE',
          text: 'GBase',
        },
        {
          'first': 'GREENPLUM',
          'second': 'GREENPLUM',
          text: 'Greenplum',
        },
        {
          'first': 'HANA',
          'second': 'HANA',
          text: 'Hana',
        },
        {
          first: 'INFORMIX',
          second: 'INFORMIX',
          text: 'Informix'
        },
        {
          'first': 'MAXCOMPUTE',
          'second': 'MAXCOMPUTE',
          text: 'MaxCompute',
        },
        {
          'first': 'STARROCKS',
          'second': 'STARROCKS',
          text: 'StarRocks',
        },
        {
          'first': 'TERADATA',
          'second': 'TERADATA',
          text: 'Teradata',
        },
        {
          'first': 'TIDB',
          'second': 'TIDB',
          text: 'TiDB',
        },
        {
          'first': 'VERTICA',
          'second': 'VERTICA',
          text: 'Vertica',
        },
        {
          first: 'ARGODB',
          second: 'ARGODB',
          text: 'ArgoDB'
        },
        {
          first: 'ICEBERGONHIVESPARK',
          second: 'ICEBERGONHIVESPARK',
          text: 'IcebergOnHiveSpark'
        },
        {
          'first': 'IMPALA',
          'second': 'IMPALA',
          text: 'Impala',
        },
        {
          'first': 'INCEPTOR',
          'second': 'INCEPTOR',
          text: 'Inceptor',
        },
        {
          'first': 'CBASE',
          'second': 'CBASE',
          text: 'CBase',
        },
        {
          'first': 'CLICKHOUSE',
          'second': 'CLICKHOUSE',
          text: 'ClickHouse',
        },
        {
          first: 'DORIS',
          second: 'DORIS',
          text: 'Doris'
        },
        {
          'first': 'GOLDENDB',
          'second': 'GOLDENDB',
          text: 'GoldenDB',
        },
        {
          'first': 'HASHDATA',
          'second': 'HASHDATA',
          text: 'HashData',
        },
        {
          'first': 'HOLOGRES',
          'second': 'HOLOGRES',
          text: 'Hologres',
        },
        {
          'first': 'KINGBASEES',
          'second': 'KINGBASEES',
          text: 'KingbaseES',
        },
        {
          'first': 'OCEANBASEMYSQL',
          'second': 'OCEANBASEMYSQL',
          text: 'OceanbaseMySQL',
          label: 'Oceanbase MySQL',
        },
        {
          'first': 'OCEANBASEO',
          'second': 'OCEANBASEO',
          text: 'OceanbaseO',
          label: 'Oceanbase Oracle',
        },
        {
          'first': 'POLARDBMYSQL',
          'second': 'POLARDBMYSQL',
          text: 'PolarDBMySQL',
          label: 'PolarDB MySQL',
        },
        {
          'first': 'POLARDBO',
          'second': 'POLARDBO',
          text: 'PolarDBO',
          label: 'PolarDB Oracle',
        },
        {
          'first': 'TDSQLMYSQL',
          'second': 'TDSQLMYSQL',
          text: 'TDSQLMySQL',
        },
        {
          first: 'TDSQLPOSTGRESQL',
          second: 'TDSQLPOSTGRESQL',
          text: 'TDSQLPostgresQL'
        },
        {
          'first': 'DAMENG',
          'second': 'DAMENG',
          text: 'DaMeng',
        },
        {
          first: 'HUDIONHIVESPARK',
          second: 'HUDIONHIVESPARK',
          text: 'HudiOnHiveSpark'
        }
      ]
    },
    {
      'name': 'NoSQL数据模型',
      'type': 'NoSQL Data Model',
      'dataSourceTypeList': [
        {
          'first': 'CASSANDRA',
          'second': 'CASSANDRA',
          text: 'Cassandra',
        },
        {
          'first': 'MONGODB',
          'second': 'MONGODB',
          text: 'MongoDB',
        },
      ]
    }
  ]
}

let dbMap = {}
let dbMapObj = {}
let modelTypeList = []

const SQL_DB_LIST = DB_TYPE_TREE.subTree[2].dataSourceTypeList
const SQL_MODEL_LIST = SQL_DB_LIST.map(item => item.text)

const NO_SQL_DB_LIST = DB_TYPE_TREE.subTree[3].dataSourceTypeList
const NO_SQL_MODEL_LIST = NO_SQL_DB_LIST.map(item => item.text)

let dbTypeFormat = () => {
  modelTypeList.splice(0, modelTypeList.length)
  Object.keys(DB_TYPE_TREE.subTree).forEach(key => {
    let modelType = DB_TYPE_TREE.subTree[key].dataSourceTypeList
    modelType.forEach(item => {
      dbMap[item.second] = item.text
      dbMapObj[item.second] = item
      modelTypeList.push({
        text: item.text2 || item.first,
        value: item.text.toLowerCase()
      })
    })
  })

}

// arch 关闭时隐藏部分模型类型
let hideDbType = () => {
  if (!store.state.lic.ready || !store.state.featureMapReady) {
    setTimeout(hideDbType, 200)
  } else  {
    if (!store.state.lic.archy) {
      // 非 arch 时，只显示 概念模型与逻辑模型
      DB_TYPE_TREE.subTree[0].dataSourceTypeList.length = 1
      DB_TYPE_TREE.subTree[1].dataSourceTypeList.length = 1
    }

    // 专业版隐藏部分数据库类型
    const SqlDbHide = []
    const NoSqlDbHide = []
    if (!store.state.featureMap.ddm_Database_CBase) {
      SqlDbHide.push('CBase')
    }
    if (!store.state.featureMap.ddm_Database_Hudi) {
      SqlDbHide.push('HudiOnHiveSpark')
    }
    // if (!store.state.featureMap.ddm_Database_TDSQLMySQL) {
    //   SqlDbHide.push('TDSQLMySQL')
    // }

    if (!store.state.featureMap.ddm_Database_Cassandra) {
      NoSqlDbHide.push('Cassandra')
    }
    if (!store.state.featureMap.ddm_Database_MongoDB) {
      NoSqlDbHide.push('MongoDB')
    }

    let SqlDbHideText = SqlDbHide.map(item => {return {text: item}})
    let NoSqlDbHideText = NoSqlDbHide.map(item => {return {text: item}})
    if (SqlDbHide.length > 0) {
      _.pullAllBy(SQL_DB_LIST, SqlDbHideText, 'text')
      _.pullAll(SQL_MODEL_LIST, SqlDbHide)
    }
    if (NoSqlDbHide.length > 0) {
      _.pullAllBy(NO_SQL_DB_LIST, NoSqlDbHideText, 'text')
      _.pullAll(NO_SQL_MODEL_LIST, NoSqlDbHide)
    }
    // store.state.dbTypeReady = true
    store.commit('setDbTypeReady', true)

    dbTypeFormat()
  }
}
hideDbType()
// dbTypeFormat()

// 废弃, 不推荐使用
const databaseTypeMap = {
  OFFLINEDUMP: This.$t('meta.dataSourceMapping.offLineDump'),
  OFFLINEDUMP_RAW: This.$t('meta.dataSourceMapping.offLineDumpRaw'),
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
  CUSTOMIZED: This.$t('meta.dataSourceMapping.custom'),
  EXCEL: 'Excel',
  CSV: 'CSV',
  DATADICTIONARY: 'Data Dictionary(excel)',
  TABLEAU: 'Tableau',
  SMBSHAREFILE: This.$t('meta.dataSourceMapping.fileResouse'),
  HBASE: 'HBASE',
  HIVE: 'Hive',
  IMPALA: 'Impala',
  MONGODB: 'MongoDB',
  ES: 'Elasticsearch',
  INCEPTOR: 'Transwarp-Inceptor',
  FUSIONINSIGHT: 'FusionInsight',
  CLICKHOUSE: 'ClickHouse',
  Vertica: 'VERTICA'
}

export default {
  dbMap,
  dbMapObj,
  databaseTypeMap,
  DB_TYPE_TREE,
  SQL_DB_LIST,
  NO_SQL_DB_LIST,
  modelTypeList,
  SQL_MODEL_LIST,
  NO_SQL_MODEL_LIST,
}
