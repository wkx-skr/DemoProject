
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import authManage from './authManage.vue'
import moment from 'moment'
import string from '@/resource/utils/string.js'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import ResizeVertical from '@/components/common/ResizeVertical'
import $ from 'jquery'
import HTTP from '@/dataWarehouse/resource/http.js'
import editor from './editor.vue'
import modelTree from './modelTree.vue'
import modelDetail from './modelDetail.vue'
import operateHint from './operatorHint.vue'
// import tableItem from './tableItem.vue'
import tableDetail from './tableDetail.vue'
// import { changeColor } from '@/resource/changeColor.js'
import dsIframeContainer from './dsIframeContainer.vue'
import ddlSetting from '@/dataWarehouse/views/sqlEditor/ddlSetting'
import { mapState } from 'vuex'
import WinMergePage from '@/dataWarehouse/components/winMerge/main.vue'
// import dataMigrationLog from '@/dataWarehouse/views/sqlEditor/dataMigrationLog'
import dataMigration from '@/dataWarehouse/views/sqlEditor/dataMigration'
import Drag from './drag'
import databaseType from '@/components/common/DatabaseType.vue'
import tableColumnDetail from '@/dataWarehouse/views/sqlEditor/tableColumnDetail'
import dataSandboxd from '@/dataWarehouse/views/sqlEditor/dataSandboxd.vue'

const monaco = require('monaco-editor/esm/vs/editor/editor.api')
export default {
  components: {
    modelTree,
    editor,
    dbTree,
    authManage,
    operateHint,
    dsIframeContainer,
    modelDetail,
    // tableItem,
    tableDetail,
    ddlSetting,
    WinMergePage,
    dataMigration,
    databaseType,
    tableColumnDetail,
    dataSandboxd
  },
  data () {
    return {
      allFileLength: null,
      Drag,
      isShowMenu: false,
      menuX: 0,
      menuY: 0,
      tabName: '',
      migrationId: 0,
      // changeColor,
      selectVersion: [],
      envType: '',
      leftType: '',
      black: (localStorage.getItem('editorTheme') || window.setting.editorTheme) === 'black',
      show: false,
      projectName: '',
      projectData: null,
      fileWidth: 240,
      hintW: 304,
      hintWidth: 304,
      windowWidth: window.innerWidth,
      editorTab: 'editor',
      statusFilter: -1,
      statusMap: {
        D: '待审核',
        C: '审核中',
        A: '已发布',
        X: '已废弃'
      },
      newParam: {
        fileName: '',
        domainCode: ''
      },
      newFileDomainModel: false,
      chooseTreeId: 0,
      chooseMoveDirId: null,
      disabledDirIds: new Set(),
      moveDirModel: false,
      moment,
      versionHistoryList: [],
      versionHistoryModel: false,
      expandKeys: [],
      currentKey: [], // 模型选中的key
      path: '',
      currentParentId: null,
      currentItem: null,
      idToFileData: {},
      modifyDirName: '',
      modifyDirModel: false,
      newDirName: '',
      newDirModel: false,
      dataSandboxd: false,
      dependent: [],
      newFileName: '',
      newFileModel: false,
      projectId: +this.$route.query.projectId,
      currentFile: '',
      editFiles: [],
      procedureFile: [],
      tableDetailList: [],
      dataMigrationList: [],
      models: [],
      tables: [],
      opts: {
        value: '123',
        origin: '1234'
      },
      scriptList: [],
      fileData: [],
      // fileDataFilterAuth: [],
      fielDirData: [],
      treeLoading: true,
      defaultProps: {
        children: 'childList',
        label: 'name'
      },
      defaultDirProps: {
        children: 'childDirList',
        label: 'name'
      },
      fileSearchQuery: '',
      showAuthManageDialog: false,
      chosenCategoryId: '',
      dependenciesTreeData: [{
        name: '工作流',
        value: 'dependent',
        children: [
          { name: '工作流定义', value: 'workflowDefinition' },
          { name: '工作流实例', value: 'workflowInstance' }
        ]
      }],
      dataMigrationTreeData: [{
        name: '数据同步',
        value: 'dataMigration',
        children: null
      }],
      fileForm: {
        newFileName: '',
        fileName: [],
        fileTypeId: '',
        extension: '',
        mainJar: '',
        mainClass: ''
      },
      formRules: {
        newFileName: { required: true, message: '请输入文件名', trigger: 'blur' },
        fileTypeId: { required: true, message: '请选择文件类型', trigger: 'blur' },
        fileName: { required: true, message: '请选择目录', trigger: 'blur' },
        extension: { required: true, message: '请选择程序类型', trigger: 'blur' },
        mainClass: { required: true, message: '请选择主函数的Class', trigger: 'blur' },
        mainJar: { required: true, message: '请选择主程序包', trigger: 'blur' }
      },
      fileFormLog: false,
      // synchronFlg: false,
      programFlg: false,
      // tabs 上是否显示 工作流相关 tab
      showWorkflowDefinition: false,
      showWorkflowInstance: false,
      showDataMigration: false,
      addMigration: false,
      dsId: '', // dolphin
      dataSourceId: '',
      currentType: '', // model, file, workflow
      // 底部有三种状态:
      // 1. 全部隐藏, 非文件环境下, 不需要显示
      // 2. 文件状态下, 显示底部按钮, 但是不显示底部 tab, 不能拖拽
      // 3. 显示底部按钮, 并显示底部 tab, tab 高度可以拖拽
      bottomDomHeightSave: 305,
      bottomDraggable: false, // 底部tab 是否显示, 点击切换显示隐藏状态, 隐藏时, 显示 tab 底部 按钮
      verticalResizeInstance: null,
      editor: null,
      migrationObj: {},
      nodeData: [
        'Home',
        'Application',
        'Center',
        'Application List',
        'An Application'
      ],
      showSettingDialog: false,
      option: null,
      options: null,
      multipleSelection: { endVersion: {}, startVersion: {} },
      radioValue: '',
      workflowExportCode: null,
      workflowProjectCode: null,
      leftExportData: null,
      rightExportData: null,
      envData: [],
      scriptTitle: this.$store.state.$v.dataEntity.noMsg,
      evnDataValue: null,
      exportDisabled: true,
      bottomDomDis: true,
      modelTreeData: null,
      switchBranch: false,
      newBranch: false,
      branchName: '',
      gitPath: [],
      newBranchName: '',
      oldBranch: '',
      branchList: [],
      branchListArr: [],
      mask: false,
      logTil: '',
      branchLoading: false,
      branchSelect: '',
      orderNum: 0, // 新建文件得order
      searchBranchName: '',
      migraLog: false, // 数据同步弹窗显示
      // codeDetail: []
      openDataMigration: false,
      createDefinition: false,
      refreshWork: false,
      type: 1,
      codeTree: {},
      extensionList: {
        JAVA: '.java',
        SCALA: '.scala',
        PYTHON: '.py',
        SQL: '.sql'
      },
      extensionFile: [30, 7, 19, '30', '7', '19'],
      formData: {
        extension: '',
        mainJar: '',
        mainClass: ''
      },
      mainJarList: [],
      iconNameLIst: {
        1: 'tree-hive',
        2: 'tree-mysql',
        3: 'tree-postgresql',
        4: 'tree-oracle',
        5: 'tree-starrocks',
        6: 'tree-sqlserver',
        7: 'tree-flinksql',
        /* 8: 'tree-flinkjar',
        9: 'tree-java',  */
        10: 'tree-python',
        11: 'tree-gbase',
        12: 'tree-transwarp-inceptor',
        13: 'tree-shell',
        14: 'file',
        15: 'tree-migration',
        16: 'clickhouse',
        17: 'oceanbase',
        18: 'db2',
        19: 'tree-flinkStream',
        30: 'tree-spark',
        31: 'tree-transformation',
        32: 'tree-job'
      },
      iconNameLIstfile: {
        1: 'tree-hive',
        2: 'tree-mysql',
        3: 'tree-postgresql',
        4: 'tree-oracle',
        5: 'tree-starrocks',
        6: 'tree-sqlserver',
        7: 'tree-flinksql',
        /* 8: 'tree-flinkjar',
        9: 'tree-java', */
        10: 'tree-python',
        11: 'tree-gbase',
        12: 'tree-transwarp-inceptor',
        13: 'tree-shell',
        14: 'file',
        16: 'clickhouse',
        17: 'oceanbase',
        18: 'db2',
        19: 'tree-flinkStream',
        30: 'tree-spark',
        31: 'tree-transformation',
        32: 'tree-job'
      },
      suffixList: {
        1: '.sql',
        2: '.sql',
        3: '.sql',
        4: '.sql',
        5: '.sql',
        6: '.sql',
        7: '.sql',
        8: '.jar',
        9: '.java',
        10: '.py',
        11: '.sql',
        12: '.sql',
        13: '.sh',
        14: '',
        15: '.sync',
        16: '.sql',
        17: '.sql',
        18: '.sql',
        19: '.sql',
        30: '.sql',
        31: '.ktr',
        32: '.kjb'
      },
      hideTree: false, // 隐藏左侧目录树
      workflowCode: null,
      newAddSync: 0,
      resultPage: 1,
      resultSize: 20,
      resultVisible: false,
      resultList: [],
      checkTime: '',
      resultTotalItems: 0,
      noDataResult: false,
      createdCodeDetail: null,
      uploadZip: false,
      fileTypeId: '',
      action: '',
      fileList: [],
      accept: '.zip',
      gitEnable: false,
      sqlTEmplet: {
        'FlinkJar': JSON.stringify('public class FlinkKafkaConsumer {\n    public static void main(String[] args) throws Exception {\n        // 创建执行环境\n        ExecutionEnvironment env = ExecutionEnvironment.getExecutionEnvironment();\n        \n        // 设置Kafka参数\n        Properties props = new Properties();\n        props.put("bootstrap.servers", "kafka-broker1:9092,kafka-broker2:9092");\n        props.put("group.id", "group1");\n        \n        // 消费Kafka Topic数据\n        DataStream<String> stream = env.addSource(\n                new FlinkKafkaConsumer<>(\n                        "mytopic",  \n                        new SimpleStringSchema(), \n                        props));\n                        \n        // 打印数据\n        stream.print();      \n        \n        // 执行任务\n        env.execute("Flink Kafka Consumer");\n    }\n}'),
        'FlinkSQL': JSON.stringify("-- 注册Kafka数据源\nCREATE TABLE kafka_table (\n  `timestamp` STRING,\n  `user` BIGINT,\n  `message` STRING\n) WITH (\n  'connector' = 'kafka',\n  'topic' = 'mytopic',\n  'properties.bootstrap.servers' = 'kafka-broker1:9092,kafka-broker2:9092',\n  'format' = 'json'\n);\n\n-- 消费Kafka数据\nSELECT * FROM kafka_table;\n\n-- 将数据写入Kafka并过滤\nINSERT INTO kafka_sink \nSELECT `timestamp`, `user` \nFROM kafka_table \nWHERE `user` > 5;\n\n-- 将数据转换后输出到文件\nSELECT \n  CAST(`timestamp` AS TIMESTAMP) AS `ts`,\n  `user`,\n  `message`\nFROM kafka_table\nWHERE `user` > 10\nOUTPUT TO 'output' \nFORMAT 'csv' \nTBLPROPERTIES ('outputMode' = 'append');\n\n-- 执行SQL任务\nEXECUTE AS batch; "),
        'Hive': JSON.stringify("-- 创建外部表连接Kafka\nCREATE EXTERNAL TABLE kafka_table (\n  `timestamp` BIGINT, \n  `user` BIGINT,\n  `message` STRING\n)\nSTORED BY 'org.apache.hadoop.hive.kafka.KafkaStorageHandler' \nTBLPROPERTIES (\n  \"kafka.bootstrap.servers\" = \"kafka-broker1:9092,kafka-broker2:9092\",\n  \"kafka.topic\" = \"mytopic\"\n);\n\n-- 消费Kafka数据\nSELECT * FROM kafka_table;\n\n-- 创建分区表\nCREATE TABLE page_view(\n   viewTime INT, \n   userid BIGINT,\n   page_url STRING, \n   referrer_url STRING,\n   ip STRING COMMENT 'IP Address of the User')\nPARTITIONED BY (dt STRING)\nROW FORMAT DELIMITED \nFIELDS TERMINATED BY '\\t';\n\n-- 加载数据到分区表\nLOAD DATA LOCAL INPATH '/data/page_view.txt'\nOVERWRITE INTO TABLE page_view \nPARTITION (dt='2008-08-15');\n\n-- 创建聚合视图\nCREATE VIEW agg_view AS\nSELECT dt, COUNT(*) AS cnt \nFROM page_view\nGROUP BY dt;\n\n-- 从视图插入到Hive表 \nINSERT INTO table_view \nSELECT * FROM agg_view;\n\n-- 执行Hive任务\nSUBMIT hive.xml;"),
        'Java': JSON.stringify('public class ETLJob {\n    public static void main(String[] args) {\n        // 1. 连接Source数据库\n        Connection sourceConn = getConnection("源数据库URL", "用户名", "密码");\n        \n        // 2. 连接Target数据库\n        Connection targetConn = getConnection("目标数据库URL", "用户名", "密码");\n        \n        // 3. 从Source数据库读取数据\n        String sql = "SELECT * FROM source_table";\n        ResultSet rs = sourceConn.createStatement().executeQuery(sql);\n        \n        // 4. 清空Target表已有数据\n        String truncateSql = "TRUNCATE TABLE target_table";\n        targetConn.createStatement().execute(truncateSql);\n        \n        // 5. 向Target表插入数据\n        String insertSql = "INSERT INTO target_table VALUES(?, ?, ?)";\n        PreparedStatement pstmt = targetConn.prepareStatement(insertSql);\n        \n        // 6. 遍历结果集,将数据插入Target表\n        while (rs.next()) {\n            pstmt.setString(1, rs.getString("field1"));\n            pstmt.setInt(2, rs.getInt("field2"));\n            pstmt.setDate(3, rs.getDate("field3"));\n            pstmt.execute();\n        }\n        \n        // 7. 释放资源\n        rs.close();\n        pstmt.close();\n        sourceConn.close();\n        targetConn.close();\n    }  \n}'),
        'Python': JSON.stringify('import mysql.connector\n\n# 连接源数据库\nsource_conn = mysql.connector.connect(\n    host="源数据库host",\n    user="用户名",\n    password="密码",\n    database="数据库名"\n)\n\n# 连接目标数据库\ntarget_conn = mysql.connector.connect(\n    host="目标数据库host",\n    user="用户名",\n    password="密码",\n    database="数据库名" \n)\n\n# 查询源表数据\nsource_cursor = source_conn.cursor()\nsource_cursor.execute("SELECT * FROM source_table")\nresults = source_cursor.fetchall()\n\n# 清空目标表数据    \ntarget_cursor = target_conn.cursor()\ntarget_cursor.execute("TRUNCATE TABLE target_table")\n\n# 向目标表插入数据\ninsert_sql = "INSERT INTO target_table(field1, field2, field3) VALUES(%s, %s, %s)" \ntarget_cursor.executemany(insert_sql, results)\n\n# 提交事务\ntarget_conn.commit() \n\n# 关闭连接  \nsource_cursor.close()\ntarget_cursor.close()\nsource_conn.close()\ntarget_conn.close()'),
        'Shell': JSON.stringify('#!/bin/bash\n\n# 这个脚本的目的是显示传入参数的信息\n\n# 获取传入参数的个数\nparam_count=$#\n\n# 显示传入参数的个数\necho "Parameter count: $param_count"\n\n# 显示每个传入参数的值  \nfor param in "$@"\ndo\n    echo "Parameter $count: $param"\n    count=$((count+1))\ndone\n\n# 检查用户名是否存在,如果不存在给出提示\nuser_name=$1\ngrep -q "$user_name" /etc/passwd\nif [ $? -ne 0 ] \nthen\n    echo "User $user_name does not exist!"\n    exit 1\nfi\n\n# 脚本结束显示OK\necho "OK" '),
        'Sql': JSON.stringify('-- 删除TargetTable已有数据\nTRUNCATE TABLE TargetTable;   \n\n-- 将SourceTable数据插入TargetTable\nINSERT INTO TargetTable(Field1, Field2, Field3)  \nSELECT Field1, Field2, Field3  \nFROM SourceTable;'),
        'StarRocks': JSON.stringify("-- 创建Kafka数据源\nCREATE TABLE kafka_table (\n  `timestamp` BIGINT,\n  `user` BIGINT,\n  `message` STRING\n) WITH (\n  'connector' = 'kafka',\n  'topic' = 'mytopic',\n  'properties.bootstrap.servers' = 'kafka-broker1:9092,kafka-broker2:9092',\n  'format' = 'json'\n);\n\n-- 消费Kafka数据\nSELECT * FROM kafka_table;\n\n-- 创建聚合视图 \nCREATE VIEW agg_view AS\nSELECT `timestamp`, COUNT(*) AS `cnt`\nFROM kafka_table\nGROUP BY `timestamp`;\n\n-- 查询聚合视图\nSELECT * FROM agg_view;\n\n-- 将聚合结果输出到StarRocks表\nINSERT INTO agg_result\nSELECT `timestamp`, `cnt` \nFROM agg_view; \n\n-- 加载HDFS数据到StarRocks表\nLOAD LABEL load_hdfs\n(\nDATA INFILE(\"hdfs://namenode:9000/file\") \nINTO TABLE hdfs_table\nCOLUMNS TERMINATED BY \",\"\n) AS select * from hdfs_table;\n\n-- 执行ETL任务\nSUBMIT ETL JOB load_hdfs;\n\n-- 查询HDFS表\nSELECT * FROM hdfs_table;")
      },
      runRefresh: window.setting.sqlRunRefresh,
      oldFileList: [],
      flagType: true,
      treeLeaveType: false,
      iframeSrc: null,
      editorData: {},
      dataSandboxdList: [],
      newAddMaticSync: 0,
      dataSandboxdTreeData: [],
      catalogueData: [],
      sandboxdData: {},
      automaticMode: true,
      rules: {
        newFileName: { required: true, message: '请输入文件名', trigger: 'blur' },
        extension: { required: true, message: '请选择程序类型', trigger: 'blur' },
        mainClass: { required: true, message: '请选择主函数的Class', trigger: 'blur' },
        mainJar: { required: true, message: '请选择主程序包', trigger: 'blur' }
      },
      schemaNameOp: ''
    }
  },
  watch: {
    $route (newRoute, oldRoute) {
      if (newRoute.query.file !== oldRoute.query.file) {
        this.showFileInTree(+this.$route.query.file)
      }
    },
    searchBranchName (val) {
      this.findBranch()
    },
    currentFile (val) {
      this.verticalDragInit()
      // this.showDataMigration = false
      if (val.indexOf('model') !== -1) {
        this.currentType = 'model'
      } else if (val.indexOf('script') !== -1) {
        this.currentType = 'script'
      } else if (val.indexOf('table') !== -1) {
        this.currentType = 'table'
      } else if (val.indexOf('file') !== -1) {
        this.currentType = 'file'
      } else if (val.indexOf('dataMigration') !== -1) {
        this.currentType = 'dataMigration'
        // this.showDataMigration = true
      }
    },
    workflowExportCode (value) {
      if (value === '') {
        this.exportDisabled = true
      } else {
        this.exportDisabled = false
      }
    },
    allFileLength (val) {
      if (this.allFileLength !== null && this.tabLen === this.allFileLength) {
        // this.$route.query.fileId
        this.$route.query.fileId && this.getFileId(this.fileData, Number(this.$route.query.fileId))
      }
    },
    tabLen () {
      if (this.allFileLength !== null && this.tabLen === this.allFileLength) {
        // this.$route.query.fileId
        this.$route.query.fileId && this.getFileId(this.fileData, Number(this.$route.query.fileId))
      }
    }
  },
  computed: {
    tabLen () {
      let ary = [...this.models, ...this.editFiles, ...this.dataSandboxdList, ...this.dataMigrationList]
      return ary.length
    },
    modifyFileList () {
      return Object.values(this.idToFileData).filter(item => item.changed)
    },
    isThemeBlack () {
      return (localStorage.getItem('editorTheme') || window.setting.editorTheme) === 'black'
    },
    ...mapState({
      auth: (state) => {
        return state.ddtStore.auth
      }
    }),
    ruleButtonLeft () {
      return this.hideTree
        ? this.currentFile.indexOf('file') !== -1 ||
        this.currentFile.indexOf('script') !== -1 ||
        this.currentFile.indexOf('procedure') !== -1
          ? this.runRefresh
            ? '260px'
            : '230px'
          : '30px'
        : this.currentFile.indexOf('file') !== -1 ||
        this.currentFile.indexOf('script') !== -1 ||
        this.currentFile.indexOf('procedure') !== -1
          ? this.runRefresh
            ? '471px'
            : '440px'
          : '240px'
    },
    // 首页显示
    homePageShow () {
    /*  let ary = [...this.models, ...this.tables, ...this.scriptList, ...this.editFiles, ...this.tableDetailList, ...this.dataMigrationList, ...this.scriptList, ...this.procedureFile, ...this.dataSandboxdList] */
      if (!this.currentFile || this.currentFile === '0') {
        this.changeHintWidth(0)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      }
      return !!this.currentFile && this.currentFile !== '0'
    }
  },
  beforeMount () {
    // if (this.isThemeBlack) {
    // changeColor()
    // }
    setTimeout(() => {
      this.show = true
    }, 500)
  },
  mounted () {
    this.$bus.$on('removeBlankTab', (id, modelId) => {
      let indx = this.tables.findIndex(item => item.id === modelId + '_' + id)
      if (indx !== -1) {
        this.tables.splice(indx, 1)
        let nexTab = this.tables[indx - 1] || this.tables[indx]
        if (nexTab) {
          this.currentFile = 'table' + nexTab.id
          return
        }
        nexTab = this.models[this.models.length - 1]
        if (nexTab) {
          this.currentFile = 'model' + nexTab.id
        }
      }
    })
    this.getProjectAuth(this.projectId)
    this.getProjectInfo()
    this.getFileTreeData('getCache')
    this.getProjectDetail()
    this.getdataSandboxdData()
    let r = new ResizeHorizontal($('.left-wrapper'), $('.content-edit-wrapper'), $('.resize-column-middle'), $('.ddt-editor-wrapper'), 0, (e) => {
      if (e.type === 'mousedown') {
        this.mask = true
      } else if (e.type === 'mouseup') {
        this.mask = false
      }
      this.fileWidth = $('.left-wrapper').width()
      this.Drag.setFileWidth(this.fileWidth)
    })
    let r2 = new ResizeHorizontal($('.content-wrapper'), $('.operator-hint-wrapper'), $('.resize-column-right'), $('.drag-container'), 0, (e) => {
      this.hintW = this.windowWidth - $('.resize-column-right')[0].offsetLeft
    }, '', '', 240, 290, '', 640)
    setTimeout(() => {
      if (this.$route.query.file) {
        this.showFileInTree(+this.$route.query.file)
      }
    }, 1000)

    this.$bus.$on('dataSourceIdChange', (dataSourceId, schemaName) => {
      this.dataSourceId = dataSourceId
      this.schemaNameOp = schemaName
    })
    // 数据同步执行完成
    this.$bus.$on('interfaceSuccess', (key) => {
      this.refreshWork = !this.refreshWork
      this.workflowCode = key
      this.createDefinition = false
      let id = this.currentFile.slice(13)
      this.flagType = true
      this.treeLeaveType = true
      this.dataMigrationList.forEach((item, i) => {
        if (item.id === id) {
          this.dataMigrationList.splice(i, 1)
        }
      })
      if (this.showWorkflowDefinition) {
        this.currentType = 'workflowDefinition'
        this.currentFile = 'workflowDefinition'
        this.setTabsSelect('workflowTree', 'workflowDefinition')
      } else {
        this.showWorkflowDefinition = true
        this.currentFile = 'workflowDefinition'
        this.setTabsSelect('workflowTree', 'workflowDefinition')
      }
    })
    this.$bus.$on('interfaceSuccessEdit', (key) => {
      this.dataMigrationList.forEach((item, i) => {
        if (item.codeDetailId === key) {
          this.dataMigrationList.splice(i, 1)
        }
      })
      if (this.showWorkflowDefinition) {
        this.currentType = 'workflowDefinition'
        this.currentFile = 'workflowDefinition'
        this.setTabsSelect('workflowTree', 'workflowDefinition')
      } else {
        this.showWorkflowDefinition = true
        this.currentFile = 'workflowDefinition'
        this.setTabsSelect('workflowTree', 'workflowDefinition')
      }
    })
    this.$bus.$on('allVerification', this.allVerification)
    this.$bus.$on('viewResults', this.viewResults)

    window.onresize = () => {
      this.windowWidth = window.innerWidth
    }
    $(window).on('click', (e) => {
      this.isShowMenu = false
    })
    /* this.$nextTick(() => {
      setTimeout(() => {
        this.getCacheFile()
      }, 500)
    }) */
  },
  destroyed () {
    this.$bus.$off('dataSourceIdChange')
    this.$bus.$off('interfaceSuccess')
    this.$bus.$off('interfaceSuccessEdit')
    window.onresize = null
  },
  methods: {
    // 首页创建数据同步
    synchronization () {
      let path = []
      path.push(this.fileData[0].gitPath)
      this.fileAddMigration({ id: this.fileData[0].id })
      this.gitPath = path
    },
    // 创建数据模型
    dataModel () {
      this.$refs.modelCom.setNewModel()
    },
    // 创建开发程序
    program () {
      this.fileFormLog = true
      // this.synchronFlg = false
      this.programFlg = true
    },
    // 创建工作流
    workflow () {
      // if (!this.workflowProjectCode) return
      this.workflowNodeClick({ name: '工作流定义', value: 'workflowDefinition' })
      this.$refs.workflowTree?.setCurrentKey('workflowDefinition')
    },
    changeCascader () {
      this.$refs.cascader.$refs.dataCascader.dropDownVisible = false
    },
    closeFileLog () {
      this.fileForm = {
        newFileName: '',
        fileName: '',
        fileTypeId: ''
      }
      this.fileFormLog = false
      this.$refs.fileFormCatalogue.resetFields()
    },
    fileFormSub () {
      this.$refs.fileFormCatalogue.validate(valid => {
        if (valid) {
          if (this.programFlg) {
            // this.fileShow(1, data)
            this.currentParentId = this.fileForm.fileName[this.fileForm.fileName.length - 1]
            this.getSelectTreeData(this.fileData, this.currentParentId)
            this.newFileName = this.fileForm.newFileName
            this.formData.mainJar = this.fileForm.mainJar
            this.formData.mainClass = this.fileForm.mainClass
            this.formData.extension = this.fileForm.extension
            this.type = this.fileForm.fileTypeId
            this.gitPath = this.$refs['cascader'].$refs.dataCascader.getCheckedNodes()[0].pathLabels.join('/')
            this.addNewFile('fileFormCatalogue')
          }
          this.closeFileLog()
        }
      })
    },
    getSelectTreeData (ary, id) {
      try {
        ary.forEach(item => {
          if (item.id === id) {
            this.currentItem = item
            throw new Error()
          } else if (item.childList && item.childList.length) {
            this.getSelectTreeData(item.childList, id)
          }
        })
      } catch (e) {

      }
    },
    // 获取 主程序包
    getMainJars () {
      let obj = {
        '.java': 'JAVA',
        '.scala': 'SCALA',
        '.py': 'PYTHON'
      }
      this.formData.mainClass = ''
      this.formData.mainJar = ''
      this.mainJarList = []
      obj[this.formData.extension] && HTTP.getMainJars({ programType: obj[this.formData.extension] })
        .then(res => {
          this.mainJarList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getdataSandboxdData () {
      this.$http.get(`${this.$dddUrl}/service/metrics/build/getMetricsTree/${this.projectId}`).then(res => {
        this.dataSandboxdTreeData = res.data.data || []
        this.dependent = [res.data.data?.id]
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    dataSandboxdNodeClick (data, node, e, type) {
      // console.log(data, node, 'data')
      if (!this.flagType || !this.automaticMode) {
        let text = !this.flagType ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            if (!this.automaticMode) {
              this.dataSandboxdList.forEach((item, i) => {
                if (item.id.toString().indexOf('add') !== -1) {
                  this.dataSandboxdList.splice(i, 1)
                }
              })
            } else {
              this.dataMigrationList.forEach((item, i) => {
                if (item.id.toString().indexOf('add') !== -1) {
                  this.dataMigrationList.splice(i, 1)
                }
              })
            }
            this.automaticMode = true
            this.flagType = true
            this.treeLeaveType = true
            this.setNewSand(data, node, e, type)
          })
          .catch(() => {
          })
        return
      }
      if (!this.flagType || !this.automaticMode) return
      this.setNewSand(data, node, e, type)
      /* if (data.type === 0) return */
    },
    setNewSand (data, node, e, type) {
      if (node.level === 1) {
        this.automaticModeling()
        this.setTabsSelect('dataSandboxd', data.id)
      } else if (data.type === 1) {
        this.$http.get(HTTP.$dddServerUrl + `metrics/build/getMetrics?id=${data.id}`)
          .then(res => {
            res.data.data.path = data.id
            this.sandboxdData = res.data.data
            let table = this.dataSandboxdList.find(i => i.id === res.data.data.id)
            let file = {
              id: res.data.data.id,
              name: res.data.data.name + '建模分析',
              tabPanlName: 'dataSandboxd' + res.data.data.id
            }
            if (!table) {
              this.dataSandboxdList.push(file)
              this.currentFile = 'dataSandboxd' + res.data.data.id
            } else {
              this.currentFile = 'dataSandboxd' + res.data.data.id
            }

            this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
            // this.automaticMode = true
            this.changeHintWidth(0)
            type !== 'noCache' && this.setStatus('METRIC', file.id)
            this.setTabsSelect('dataSandboxd', data.id)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    newDirModelMeth () {
      this.newDirName = ''
      this.newDirModel = false
      this.dataSandboxd = false
    },
    fileNameMeth () {
      this.newParam = { fileName: '', domainCode: '', comment: '' }
      this.newFileDomainModel = false
    },
    newFileModelClose () {
      this.newFileName = ''
      this.newFileModel = false
    },
    modifyDirModelClose () {
      this.modifyDirName = ''
      this.modifyDirModel = false
    },
    automaticModeling () {
      // dataSandboxd
      this.automaticMode = false // 表示有新建 自动建模
      this.newAddMaticSync++
      let file = {
        id: 'add' + this.newAddMaticSync,
        name: '自动建模未命名' + this.newAddMaticSync,
        tabPanlName: 'dataSandboxd' + 'add' + this.newAddMaticSync
      }
      this.dataSandboxdList.push(file)
      this.currentFile = 'dataSandboxd' + 'add' + this.newAddMaticSync
      this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      this.sandboxdData = {}
      this.changeHintWidth(0)
      this.currentType = 'dataSandboxd'
    },
    intelligentQuery () {
      window.open(`http://172.16.0.111:82/dam-web/#/main/AIQuery`)
    },
    signInDDM () {
      let p1 = this.$http.get(this.$url + '/service/configs/')
      let p2 = this.$http.get(this.$url + `/service/main/login/web/token`)
      Promise.all([p1, p2]).then(res => {
        let config = res[0]?.data || []
        let hostname = ''
        let port = ''
        let UseHttps = ''
        config.forEach(item => {
          if (item.propertyName === 'configurable.server.https') {
            if (item.propertyValue !== '') {
              UseHttps = item.propertyValue === true || item.propertyValue === 'true'
            } else {
              UseHttps = window.location.protocol !== 'http:'
            }
          } else if (item.propertyName === 'configurable.server.ip') {
            hostname = item.propertyValue || location.hostname
          } else if (item.propertyName === 'configurable.server.port') {
            port = item.propertyValue || ''
          }
        })
        let defaultPort = UseHttps ? 443 : 80
        port = port || location.port || defaultPort

        const json = {
          Host: hostname,
          Port: port,
          App: 'ddm',
          WebLoginToken: res[1].data,
          UseHttps: UseHttps
        }
        const s = JSON.stringify(json)
        this.iframeSrc = 'ddm:' + `${btoa(JSON.stringify(json))}`
        this.$message({
          message: `正在尝试启动DDM客户端。如未看到启动界面，请检查DDM客户端是否已被正确的安装和配置`,
          type: 'warning',
          duration: 8000,
          showClose: true
        })
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    // changeRunRefresh (value) {
    //   console.log(value, 'value')
    //   this.runRefresh = value
    // },
    // 查看历史表格选择
    handleSelectionChange (row) {
      this.selectVersion = row
      if (row.length > 2) {
        this.$refs.historyTable.toggleRowSelection(row[0], false)
      }
    },
    // 对比差异
    difference () {
      this.envType = this.selectVersion[1].version
      this.leftType = this.selectVersion[0].version
      this.$refs.winMergePages.init(this.selectVersion[0].content, this.selectVersion[1].content)
    },
    // 规则校验
    allVerification () {
      this.$http.get(`${this.$dddUrl}/service/check/startCheck/${this.projectId}`).then(res => {
        if (res.data === '没有可检查的文件') {
          this.$message.info(res.data)
        } else {
          this.$message.success('检查任务已开始执行，请稍后查看结果')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    viewSizeChange (size) {
      this.resultPage = size
      this.resultPage = 1
      this.viewResults()
    },
    viewCurrentChange (current) {
      this.resultPage = current
      this.viewResults()
    },
    // 查看结果
    viewResults () {
      this.noDataResult = false
      this.$http.get(`${this.$dddUrl}/service/check/getResult/${this.projectId}?currentPage=${this.resultPage}&pageSize=${this.resultSize}`).then(res => {
        if (JSON.stringify(res.data) !== '{}') {
          this.checkTime = res.data.checkTime
          this.resultList = res.data.pageResult.content
          this.resultTotalItems = res.data.pageResult.totalItems
          this.resultVisible = true
        } else {
          this.noDataResult = true
          this.resultVisible = true
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 新建文件弹窗
    fileShow (type, data) {
      if (!this.flagType || !this.automaticMode) {
        let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.orderNum = data.childList?.length || 1
          this.currentParentId = data.id
          this.currentItem = data
          this.newFileModel = true
          this.$refs.fileForm && this.$refs.fileForm.resetFields()
          this.type = type
          if (!this.automaticMode) {
            this.dataSandboxdList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataSandboxdList.splice(i, 1)
              }
            })
          } else {
            this.dataMigrationList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataMigrationList.splice(i, 1)
              }
            })
          }
          this.automaticMode = true
          this.flagType = true
          this.getDefaultTab()
        })
          .catch(e => {})
      }
      if (!this.flagType || !this.automaticMode) return
      this.orderNum = data.childList?.length || 1
      this.currentParentId = data.id
      this.currentItem = data
      this.newFileModel = true
      this.$refs.fileForm && this.$refs.fileForm.resetFields()
      this.type = type
    },
    fileAddMigration (data) {
      if (!this.flagType || !this.automaticMode) {
        let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (!this.automaticMode) {
            this.dataSandboxdList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataSandboxdList.splice(i, 1)
              }
            })
          } else {
            this.dataMigrationList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataMigrationList.splice(i, 1)
              }
            })
          }
          this.automaticMode = true
          this.flagType = true
          this.treeLeaveType = true
          this.fileMigration(data)
        })
          .catch(e => {})
      }
      if (!this.flagType || !this.automaticMode) return
      this.fileMigration(data)
    },
    fileMigration (data) {
      this.flagType = false
      this.treeLeaveType = false
      this.newAddSync++
      this.codeTree = {
        currentParentId: data.id,
        branchName: this.branchName || 'master',
        projectId: this.projectId
      }
      this.newFileModel = false
      this.migration()
      this.bottomDomDis = false
      this.addMigration = true
      this.currentType = 'dataMigration'
      this.migrationObj = {}
      this.dataMigrationList.push({
        id: 'add' + this.newAddSync,
        name: '未命名' + this.newAddSync + this.suffixList[15],
        tabPanlName: 'dataMigration' + 'add' + this.newAddSync
      })
      this.newFileName = ''
      this.currentFile = 'dataMigration' + 'add' + this.newAddSync
    },
    // 数据同步
    migration () {
      // this.migraLog = true
      this.$store.commit('ddtStore/setCurrentFileType', {
        type: 0,
        id: null,
        hidRightMenu: true
      })
      this.changeHintWidth(0)
      // this.showDataMigration = true
      this.currentType = 'dataMigration'
      // this.currentFile = 'dataMigration'
    },
    cancel () {
      this.migraLog = false
    },
    keywordChange () {
      // if (!this.searchBranchName) {
      this.findBranch()
      // }
    },
    findBranch () {
      this.branchList = this.branchListArr.filter(item => item.toLowerCase().indexOf(this.searchBranchName.toLowerCase()) !== -1)
    },
    cancelBranch (row) {
      this.$set(row, 'newBranchName', '')
    },
    getTreeData (data) {
      this.modelTreeData = data
      if (this.currentFile.indexOf('model') !== -1) {
        let id = Number(this.currentFile.slice(5))
        this.currentKey = [id]
        // this.$refs.modelCom.$refs.modelTree.setCurrentKey(id)
      }
      /*    let id = Number(this.currentFile.slice(5))
      this.currentFile.indexOf('model') !== -1 && this.location() */
    },
    getEnv () {
      this.envData = []
      this.$http.get(`${this.$dddUrl}/service/project/getEnv`).then(res => {
        for (let i in res.data) {
          this.envData.push({
            label: i,
            value: res.data[i]
          })
        }
        this.radioValue = this.envData[0].label
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    setValue (value) {
      let editor = this.$refs['editor'].monacoEditor
      editor.setValue(value)
    },
    getExportCode (code, projectCode) {
      this.workflowExportCode = code
      this.workflowProjectCode = projectCode
    },
    // 获取iframe中的画布
    getDropEle (val) {
      if (val) {
        // console.log(this.$refs.workflowDefinitionIframe.$refs.dsWorkflowIframe)
        // console.log(this.$refs.fileTree.$el)
        let dropEle = this.$refs.workflowDefinitionIframe.$refs.dropMask
        let dragEle = this.$refs.fileTree.$el
        let modelEle = this.$refs.modelCom.$el
        let triggerEle = this.$refs.workflowDefinitionIframe
        this.Drag.init({
          dropEle,
          dragEle,
          modelEle,
          triggerEle
        })
      }
      // let dropEle = ele // iframe中的画布
    },
    radioValueChange () {

    },
    exportWorkflow () {
      this.evnDataValue = JSON.stringify(this.envData.find(item => item.label === this.radioValue).value)
      this.$http.post(`/dolphinscheduler/projects/${this.workflowProjectCode}/process-definition/batch-export?codes=${this.workflowExportCode}`).then(res => {
        this.leftExportData = JSON.stringify(res.data)
        this.$http.get(`${this.$dddUrl}/service/project/exportDsWorkflow?env=${this.radioValue}&projectCode=${this.workflowProjectCode}&codes=${this.workflowExportCode}`).then(resRight => {
          this.rightExportData = JSON.stringify(resRight.data)
          this.$refs.winMergePage.init(this.leftExportData, this.rightExportData)
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getProjectAuth (id) {
      let isAdmin = this.$store.state.user.isAdmin
      this.$store.commit('ddtStore/setAuth', { isAdmin })
      // if (isAdmin) {
      //   return
      // }
      this.$http.get(`${this.$dddUrl}/service/project/auth/findAuthByProject?projectId=${id}`)
        .then(res => {
          let auth = {}
          let currentuser = res.data.find(v => v.username === this.$store.state.user.name && v.enabled)
          let authList = currentuser ? currentuser.authType : []
          authList.forEach(v => {
            auth[v] = true
          })
          auth.isAdmin = isAdmin
          this.$store.commit('ddtStore/setAuth', _.cloneDeep(auth))
        })
    },
    openTable (data) {
      let table = this.tables.find(i => i.id === data.id)
      data.tabPanlName = 'table' + data.id
      if (!table) {
        this.tables.push(data)
      }
      this.currentFile = 'table' + data.id
    },
    async openModelData (obj) {
      let { data, noCache, select } = obj
      let flag = true
      if (this.flagType !== true || !this.automaticMode) {
        let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (!this.automaticMode) {
            this.dataSandboxdList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataSandboxdList.splice(i, 1)
              }
            })
          } else {
            this.dataMigrationList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataMigrationList.splice(i, 1)
              }
            })
          }
          let model = this.models.find(i => i.id === data.id)
          if (model) {
            !select && (this.currentFile = 'model' + data.id)
          } else {
            data.tabPanlName = 'model' + data.id
            this.models.push(data)
            !select && (this.currentFile = 'model' + data.id)
          }
          noCache !== 'noCache' && this.setStatus('MODEL', data.id)
          !select && this.changeHintWidth(0)
          this.flagType = true
          this.treeLeaveType = true
          this.automaticMode = true
        }).catch(() => {
          return true
        })
      }
      if (!this.flagType || !this.automaticMode) return
      let model = this.models.find(i => i.id === data.id)
      if (model) {
        !select && (this.currentFile = 'model' + data.id)
      } else {
        data.tabPanlName = 'model' + data.id
        this.models.push(data)
        !select && (this.currentFile = 'model' + data.id)
      }
      noCache !== 'noCache' && this.setStatus('MODEL', data.id)
      !select && this.changeHintWidth(0)
    },
    // 标记文件打开状态
    setStatus (type, id) {
      HTTP.maintainStatus({
        type,
        procedureId: id,
        projectId: this.projectId
      }).then(res => { console.log(res, '添加状态') }).catch(e => {})
    },
    // 关闭标记缓存的文件
    closeCache (type, id) {
      HTTP.closeCache({
        type,
        procedureId: id,
        projectId: this.projectId
      }).then(res => { console.log(res, '关闭状态') }).catch(e => {})
    },
    // 获取缓存的打开的文件
    getCacheFile () {
      HTTP.getCacheFile(this.projectId)
        .then(res => {
          this.allFileLength = res.codeDetailFiles.length + res.metricFiles.length + res.modelFiles.length
          let flag = res.codeDetailFiles.length
          if (this.auth.isAdmin || this.auth['PROCEDURE_EDIT'] || this.auth['PROCEDURE_VIEW']) {
            flag && (this.currentFile = 'true')
            res.codeDetailFiles.forEach(item => {
              // console.log(this.fileData, 'this.fileData')
              this.getFileId(this.fileData, item)
            })
            res.metricFiles.forEach(item => {
              // console.log(this.fileData, 'this.fileData')
              this.getMetricId(this.dataSandboxdTreeData, item)
            })
          }

          /* res.modelFiles.forEach(item => {
            this.getModelId(this.modelTreeData, item)
          }) */
        })
        .catch(e => {})
    },
    getFileId (ary, id) {
      try {
        ary.forEach(item => {
          if (item.codeDetailId === id) {
            this.expandKeys = [item.parentId]
            this.nodeClick(item, null, '', 'noCache')

            this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
            throw new Error('end')
          }
          if (item.childList) {
            this.getFileId(item.childList, id)
          }
        })
      } catch (e) {

      }
    },
    getMetricId (ary, id) {
      try {
        ary.forEach(item => {
          if (item.id === id) {
            this.dependent = [item.parentId]
            this.dataSandboxdNodeClick(item, {}, '', 'noCache')

            this.$refs.dataSandboxd?.setCurrentKey(null)
            throw new Error('end')
          }
          if (item.children) {
            this.getMetricId(item.children, id)
          }
        })
      } catch (e) {

      }
    },
    // 更改完模型属性后刷新打开的tab
    updateTabsData (data) {
      this.models.forEach((v, i) => {
        if (v.id === data.id) {
          this.$set(this.models, i, data)
        }
      })
    },
    showDdlScript (data) {
      if (this.flagType !== true || !this.automaticMode) {
        let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (!this.automaticMode) {
            this.dataSandboxdList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataSandboxdList.splice(i, 1)
              }
            })
          } else {
            this.dataMigrationList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataMigrationList.splice(i, 1)
              }
            })
          }

          const mode = data.endVersion.version === data.startVersion.version ? 'CREATE' : 'ALTER'
          let endVersion = data.endVersion.name === 'Latest Version' ? '-1' : data.endVersion.version
          let startVersion = data.startVersion.name === 'Latest Version' ? '-1' : data.startVersion.version
          this.$http.get(`${this.$url}/service/models/${data.modelId}/option?type=${data.endVersion.version !== data.startVersion.version ? 'AlterDDL' : 'CreateDDL'}`).then(res => {
            if (res.data === '') {
              // 获取默认配置
              /* this.$http.get(this.$url + '/service/models/script/option').then(res => {
            const option = res.data
            this.option = option
          }).catch(e => {
            this.incrementalScript = ''
            this.$showFailure(e)
          }).then(() => {
            this.loading = false
          }) */
            } else {
              this.option = JSON.parse(res.data.option)
              this.loading = false
            }
            let url = `${this.$url}/service/models/${data.modelId}/script?targetVerId=${endVersion}`
            if (mode === 'CREATE') {
              url += `&mode=CREATE`
            } else {
              url += `&baseVerId=${startVersion}&mode=ALTER`
            }
            return this.$http.post(url, {
              option: this.option
            })
          })
            .then(res => {
              let script = (mode === 'CREATE' ? res.data?.create : res.data?.alter) || ''
              let obj = {
                content: script,
                origin: '',
                nodeAuth: [],
                changed: false,
                // value: this.item.content, origin: this.item.origin, readOnly: this.item.domainState === 'C' || this.item.domainState === 'X', theme: this.black ? 'vs-dark' : 'vs'

                ...data
              }
              obj.tabPanlName = 'script_' + data.id
              obj.modelName = data.name
              obj.name = `script_${data.modelId}`
              obj.script = script
              obj.type = 'script'

              let ary = null
              this.scriptList.map((v, index) => {
                if (v.id === obj.id) {
                  ary = index
                }
              })
              ary !== null && this.scriptList.splice(ary, 1, obj)
              ary === null && this.scriptList.push(obj)
              this.idToFileData[obj.id] = obj
              // this.scriptList.push(obj)
              this.currentFile = 'script_' + data.id
              this.currentKey = [data.id]
              this.setTabsSelect('modelCom', data.id)
              this.changeHintWidth(304)
              this.$store.commit('ddtStore/setCurrentFileType', { type: 'script', id: data.id, hidRightMenu: false, dataBaseId: data.dataBaseId, schemaName: data.schemaName })
            })
            .catch(e => {
              this.$showFailure(e)
            })
          this.flagType = true
          this.treeLeaveType = true
          this.automaticMode = true
        }).catch(() => {
          return true
        })
      }
      if (!this.flagType) return
      const mode = data.endVersion.version === data.startVersion.version ? 'CREATE' : 'ALTER'
      let endVersion = data.endVersion.name === 'Latest Version' ? '-1' : data.endVersion.version
      let startVersion = data.startVersion.name === 'Latest Version' ? '-1' : data.startVersion.version
      this.$http.get(`${this.$url}/service/models/${data.modelId}/option?type=${data.endVersion.version !== data.startVersion.version ? 'AlterDDL' : 'CreateDDL'}`).then(res => {
        if (res.data === '') {
          // 获取默认配置
          /* this.$http.get(this.$url + '/service/models/script/option').then(res => {
            const option = res.data
            this.option = option
          }).catch(e => {
            this.incrementalScript = ''
            this.$showFailure(e)
          }).then(() => {
            this.loading = false
          }) */
        } else {
          this.option = JSON.parse(res.data.option)
          this.loading = false
        }
        let url = `${this.$url}/service/models/${data.modelId}/script?targetVerId=${endVersion}`
        if (mode === 'CREATE') {
          url += `&mode=CREATE`
        } else {
          url += `&baseVerId=${startVersion}&mode=ALTER`
        }
        return this.$http.post(url, {
          option: this.option
        })
      })
        .then(res => {
          let script = (mode === 'CREATE' ? res.data?.create : res.data?.alter) || ''
          let obj = {
            content: script,
            origin: '',
            nodeAuth: [],
            changed: false,
            // value: this.item.content, origin: this.item.origin, readOnly: this.item.domainState === 'C' || this.item.domainState === 'X', theme: this.black ? 'vs-dark' : 'vs'

            ...data
          }
          obj.tabPanlName = 'script_' + data.id
          obj.modelName = data.name
          obj.name = `script_${data.modelId}`
          obj.script = script
          obj.type = 'script'

          let ary = null
          this.scriptList.map((v, index) => {
            if (v.id === obj.id) {
              ary = index
            }
          })
          ary !== null && this.scriptList.splice(ary, 1, obj)
          ary === null && this.scriptList.push(obj)
          // this.scriptList.push(obj)
          this.idToFileData[obj.id] = obj
          this.currentFile = 'script_' + data.id
          this.currentKey = [data.id]
          this.setTabsSelect('modelCom', data.id)
          this.changeHintWidth(304)
          this.$store.commit('ddtStore/setCurrentFileType', { type: 'script', id: data.id, hidRightMenu: false, dataBaseId: data.dataBaseId, schemaName: data.schemaName })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // ddl历史版本添加到scriptList中
    addScriptList (row) {
      if (this.flagType !== true || !this.automaticMode) {
        let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (!this.automaticMode) {
            this.dataSandboxdList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataSandboxdList.splice(i, 1)
              }
            })
          } else {
            this.dataMigrationList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataMigrationList.splice(i, 1)
              }
            })
          }
          let ary = null
          row.history = true
          row.modelName = row.name
          row.origin = ''
          row.nodeAuth = []
          row.type = 'script'
          row.changed = false
          row.tabPanlName = 'script_' + row.id
          this.scriptList.map((v, index) => {
            if (v.id === row.id) {
              ary = index
            }
          })
          ary !== null && this.scriptList.splice(ary, 1, row)
          ary === null && this.scriptList.push(row)
          this.idToFileData[row.id] = row
          this.currentFile = 'script_' + row.id
          this.changeHintWidth(304)
          this.$store.commit('ddtStore/setCurrentFileType', { type: 'script', id: row.id, hidRightMenu: false, dataBaseId: row.dataBaseId, schemaName: row.schemaName })
          this.flagType = true
          this.treeLeaveType = true
          this.automaticMode = true
        }).catch(() => {
          return true
        })
      }
      if (!this.flagType) return
      let ary = null
      row.history = true
      row.modelName = row.name
      row.origin = ''
      row.nodeAuth = []
      row.type = 'script'
      row.changed = false
      row.tabPanlName = 'script_' + row.id
      this.scriptList.map((v, index) => {
        if (v.id === row.id) {
          ary = index
        }
      })
      ary !== null && this.scriptList.splice(ary, 1, row)
      ary === null && this.scriptList.push(row)
      this.idToFileData[row.id] = row
      this.currentFile = 'script_' + row.id
      this.changeHintWidth(304)
      this.$store.commit('ddtStore/setCurrentFileType', { type: 'script', id: row.id, hidRightMenu: false, dataBaseId: row.dataBaseId, schemaName: row.schemaName })
    },
    // DDL配置
    showDdlConfiguration (data) {
      this.multipleSelection = data
      this.getScriptOption()
      // this.showSettingDialog = true
    },
    delModel (ary) {
      ary.forEach(item => {
        if (item.type === 1) {
          this.removeFile('model' + item.id)
          return
        }
        this.removeFile(item.name)
      })
    },
    // 获取当前模型的配置
    getScriptOption (notOpenDialog = false) {
      // ?type= ${this.multipleSelection.length === 2 ? 'AlterDDL' :'CreateDDL'  目前只能是一个模型，不和ddm的一样
      this.$http.get(`${this.$url}/service/models/${this.multipleSelection.modelId}/option?type= ${this.multipleSelection.endVersion.version !== this.multipleSelection.startVersion.version ? 'AlterDDL' : 'CreateDDL'}`).then(res => {
        if (res.data === '') {
          // 获取默认配置
          /* this.$http.get(this.$url + `/service/models/script/option?dbType=${(this.multipleSelection.datasourceType || '').toUpperCase()}`).then(res => {
            const option = res.data
            this.option = option
            if (!notOpenDialog) {
              this.showSettingDialog = true
            }
          }).catch(e => {
            this.incrementalScript = ''
            this.$showFailure(e)
          }).then(() => {
            this.loading = false
          }) */
        } else {
          this.option = JSON.parse(res.data.option)
          this.loading = false
          if (!notOpenDialog) {
            this.showSettingDialog = true
          }
        }
      })
        .catch(e => {
          this.incrementalScript = ''
          this.$showFailure(e)
        })
    },
    // 保存配置
    saveOption () {
      const keys = this.$refs.ddlSetting.$refs.tree?.getCheckedKeys()
      const halfKeys = this.$refs.ddlSetting.$refs.tree?.getHalfCheckedKeys()
      this.options = new Set(_.concat(keys, halfKeys))
      this.forEachData(this.option.children)
      this.$http.post(`${this.$url}/service/models/option`, {
        option: JSON.stringify(_.cloneDeep(this.option)),
        modelId: this.multipleSelection.modelId,
        type: `${this.multipleSelection.endVersion.version !== this.multipleSelection.startVersion.version ? 'AlterDDL' : 'CreateDDL'}`
      })
        .then(res => {
          // this.getScript()
          this.$blauShowSuccess('配置保存成功')
          this.showSettingDialog = false
          this.loading = false
        })
        .catch(e => {
          this.showSettingDialog = true
          this.$showFailure(e)
        })
    },
    hideDirectoryTree () {
      this.hideTree = !this.hideTree
    },
    forEachData (array) {
      const checkMap = new Set()
      const forEach = array => {
        array.forEach(item => {
          if (item.children && item.children.length > 0) {
            item.selected = this.options.has(item.id)
            forEach(item.children)
          } else {
            item.selected = this.options.has(item.id)
          }
        })
      }
      forEach(array)
    },
    location (item) {
      this.expandKeys = [item.id]
      item.name.indexOf('script') !== -1 && (this.currentKey = [item.id])
    },
    triggerNodeClick (data) {
      this.nodeClick(data)
      this.$refs.fileTree?.setCurrentKey(data.id)
    },
    toggleTheme () {
      // this.changeColor(this.black)
      this.black = !this.black
      let theme = this.black ? 'vs-dark' : 'vs'
      monaco.editor.setTheme(theme)

      this.$bus.$emit('toggleTheme', this.black)
    },
    clearTreeActive (model) {
      !model && (this.bottomDomDis = !this.bottomDomDis)
      this.$refs.workflowTree?.setCurrentKey(null)
      this.$refs.fileTree?.setCurrentKey(null)
      this.$refs.dataMigrationTree?.setCurrentKey(null)
      this.$refs.dataSandboxd?.setCurrentKey(null)
    },
    getProjectInfo () {
      this.$http.get(`${this.$dddUrl}/service/project/id/${this.projectId}`).then(res => {
        this.projectName = res.data.name
        this.projectData = res.data
        this.gitEnable = res.data.gitEnable
        /* this.oldBranch = res.data.gitBranch
        this.branchName = res.data.gitBranch */
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    changeHintWidth (width) {
      this.hintWidth = width
    },
    /* setNewFile (obj) {
      if (this.editFiles.findIndex(item => item.id === 'new01') !== -1) {
        this.$DatablauCofirm('已创建程序还未保存，是否需要保存')
          .then(() => {
            this.saveNewFile()
          })
          .catch(() => {
            this.editFiles?.forEach((item, i) => {
              if (item.id === 'new01') {
                this.editFiles.splice(i, 1)
              }
            })
            this.setEditFiles(obj)
          })
      } else {
        this.setEditFiles(obj)
      }
    }, */
    setNewFile (obj) {
      // let obj = this.editFiles.find(item => item.id === 'new01')
      if (!obj.newFileName) {
        obj.name = obj.name + this.suffixList[obj.type]
        obj.savedPath = obj.filePath + obj.name
        this.setEditFiles(obj)
      } else {
        this.$http.post(this.$dddUrl + '/service/code/file', {
          projectId: this.projectId,
          parentId: obj.fileName[obj.fileName.length - 1],
          type: obj.type,
          content: obj.content,
          name: obj.newFileName + this.suffixList[this.type],
          admin: this.$store.state.user.username,
          updater: this.$store.state.user.username,
          branch: this.branchName || 'master',
          modelId: obj.dataSourceId,
          database: obj.schemaName,
          gitPath: obj.gitPath + '/' + obj.newFileName
          // order: this.orderNum
        })
          .then(res => {
            this.$datablauMessage.success('保存成功!')
            res.data.content = obj.content
            res.data.modelId = obj.modelId
            this.setEditFiles(res.data)
          })
          .catch(e => { this.$showFailure(e) })
      }

      /*  */
    },
    // 查看存储过程
    showProcedureFile (obj) {
      // obj.name = '存储过程'
      let text = {
        procedure: '存储过程',
        view: '视图',
        func: '函数'
      }
      // 表详情
      if (obj.type === 'columnDetails') {
        let file = {
          id: obj.id,
          type: 'columnDetails',
          name: obj.schemaName + '.' + obj.name + '详情',
          content: obj.content
        }
        if (this.tableDetailList.find(item => item.id === file.id)) {
          this.currentFile = 'columnDetails' + file.id
        } else {
          file.tabPanlName = 'columnDetails' + file.id
          this.tableDetailList.push(file)
          this.currentFile = 'columnDetails' + file.id
        }
        return
      }
      // 存储过程
      let file = {
        id: obj.id + obj.type,
        type: obj.type,
        dbType: obj.dbType,
        schemaName: obj.schemaName,
        modelId: obj.modelId,
        name: obj.schemaName + '.' + obj.name + text[obj.type],
        procedureName: obj.id,
        status: '',
        content: obj.content,
        curId: '',
        codeDetailId: '',
        isDiff: false,
        inlineDiff: false,
        origin: '',
        lineageSql: '',
        // parentId: obj.parentId || obj.fileName[obj.fileName.length - 1],
        projectId: '',
        maxLength: 10,
        nodeAuth: [],
        showName: '',
        changed: false
      }
      // this.currentParentId = file.parentId
      if (this.procedureFile.find(item => item.id === file.id)) {
        this.currentFile = 'procedure' + file.id
      } else {
        file.tabPanlName = 'procedure' + file.id
        this.procedureFile.push(file)
        this.currentFile = 'procedure' + file.id
      }
      this.idToFileData[file.id] = file

      this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(file))
      this.changeHintWidth(304)
    },
    async setEditFiles (obj) {
      let res = obj.codeDetailId && await this.$http.get(this.$dddUrl + '/service/code/file/' + obj.codeDetailId + `?projectId=${this.projectId}`)
      let file = {
        id: obj.id || 'new01',
        type: obj.type,
        name: obj.name || obj.newFileName + this.suffixList[this.type],
        status: '',
        content: obj.content || '',
        curId: res?.data?.curId,
        codeDetailId: obj.codeDetailId,
        isDiff: false,
        inlineDiff: false,
        origin: '',
        lineageSql: '',
        parentId: obj.parentId || obj.fileName[obj.fileName.length - 1],
        projectId: '',
        maxLength: 10,
        nodeAuth: [],
        showName: '',
        modelId: obj.modelId,
        temporarilyFile: obj.temporarilyFile, // 表示是表映射出来的临时文件
        savedPath: obj.savedPath // 映射的临时文件的地址
      }
      this.dataSourceId = obj.modelId
      file.tabPanlName = 'file' + file.id
      this.currentParentId = file.parentId
      let find = this.editFiles.find(item => item.id + '' === file.id)
      if (find) {
        this.currentFile = 'file' + file.id
      } else {
        this.editFiles.push(file)
        this.currentFile = 'file' + file.id
      }

      this.createdCodeDetail = null
      file.dataBaseId = obj.modelId
      if (obj.schemaName) {
        file.schemaName = obj.schemaName
      }
      this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(file))
      this.changeHintWidth(304)
      !obj.temporarilyFile && this.getFileTreeData()
    },
    // 数据映射，零时文件保存后，刷新目录树
    async refreshTree (obj) {
      let index
      let firstIndex = null
      this.editFiles.find((item, i) => {
        if (item.id + '' === obj.oldFileId) {
          index = i
        }
        if (item.id === obj.id) {
          firstIndex = i
        }
      })
      let res = obj.codeDetailId && await this.$http.get(this.$dddUrl + '/service/code/file/' + obj.codeDetailId + `?projectId=${this.projectId}`)
      let file = {
        id: obj.id || 'new01',
        type: obj.type,
        name: obj.name || obj.newFileName + this.suffixList[this.type],
        status: '',
        content: res?.data.content || '',
        curId: res?.data?.curId,
        codeDetailId: obj.codeDetailId,
        isDiff: false,
        inlineDiff: false,
        origin: '',
        lineageSql: '',
        parentId: obj.parentId || obj.fileName[obj.fileName.length - 1],
        projectId: '',
        maxLength: 10,
        nodeAuth: [],
        showName: '',
        modelId: obj.modelId,
        temporarilyFile: obj.temporarilyFile, // 表示是表映射出来的临时文件
        savedPath: obj.savedPath // 映射的临时文件的地址
      }
      if (firstIndex !== null) {
        this.editFiles.splice(index, 1)
        this.editFiles.find((item, i) => {
          if (item.id === obj.id) {
            firstIndex = i
          }
        })
        this.editFiles.splice(firstIndex, 1, file)
      } else {
        this.editFiles.splice(index, 1, file)
      }
      /* firstIndex !== null && this.editFiles.splice(index, 1, file)
      firstIndex !== null && this.editFiles.splice(firstIndex, 1, file) */
      // this.removeFile('file' + item.id)
      this.currentFile = 'file' + file.id
      file.tabPanlName = 'file' + file.id
      this.currentParentId = obj.parentId
      this.setStatus('FILE', file.codeDetailId)
      await this.getFileTreeData()
      this.setTabsSelect('fileTree', file.id)
      this.createdCodeDetail = file
    },
    allowDropModel (obj) {
      obj.draggingNode.data.type !== 0 && this.Drag.setDraggingNode(obj.draggingNode)
    },
    allowDrop (draggingNode, dropNode, type) {
      draggingNode.data.type !== 0 && this.Drag.setDraggingNode(draggingNode)
      this.oldFileList = _.cloneDeep(this.fileData)
      if (dropNode.data.type !== 0 && type === 'inner') {
        return false
      }
      if (dropNode.data.parentId === 0 && type !== 'inner') {
        return false
      }
      if (this.isDraggingParent(draggingNode, dropNode)) {
        return false
      }
      if (type === 'inner' || type === 'prev' || type === 'next') {
        return true
      }
    },
    isDraggingParent (drag, drop) {
      if (drop.parent) {
        if (drag.data.id === drop.parent.data.id) {
          return true
        }
        return this.isDraggingParent(drag, drop.parent)
      }
      return false
    },
    handleDrop (draggingNode, dropNode, dropType, ev) {
      let flag = this.Drag.getDrop()
      if (flag) {
        this.fileData = this.oldFileList
      }
      !flag && this.moveFile(draggingNode, dropNode, dropType)
    },
    applyPublish (item) {
      if (this.idToFileData[item.id]?.changed) {
        this.$datablauMessage.error('请先保存再申请！')
        return
      }
      this.$http.post(`${this.$dddUrl}/service/process/code/applyPublish?fileId=${item.codeDetailId}`).then(res => {
        this.$refs[`editor${item.codeDetailId}`][0].monacoEditor.updateOptions({ readOnly: true })
        item.domainState = 'C'
        this.$datablauMessage.success('申请成功！')
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    applyUpdate (item) {
      // this.saveSql(item)
      // setTimeout(() => {
      if (this.idToFileData[item.id]?.changed) {
        this.$datablauMessage.error('请先保存再申请！')
        return
      }
      this.$http.post(`${this.$dddUrl}/service/process/code/applyUpdate?fileId=${item.codeDetailId}`).then(res => {
        this.$refs[`editor${item.codeDetailId}`][0].monacoEditor.updateOptions({ readOnly: true })
        this.$datablauMessage.success('申请成功！')
      }).catch(err => {
        this.$showFailure(err)
      })
      // }, 1000)
    },
    applyAbolish (item) {
      this.$http.post(`${this.$dddUrl}/service/process/code/applyAbolish?fileId=${item.codeDetailId}`).then(res => {
        this.$refs[`editor${item.codeDetailId}`][0].monacoEditor.updateOptions({ readOnly: true })
        this.$datablauMessage.success('申请成功！')
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    showFileInTree (fileId) {
      let node = this.$refs.fileTree.getNode(fileId) || {}
      this.nodeClick(node.data, node)
      this.$refs.fileTree?.setCurrentNode(node.data)
    },
    httpRequest (option) {
      let file
      if (!option) {
        file = this.fileList[0].raw
      } else {
        file = option.file
      }

      const paramsData = new FormData()
      paramsData.append('file', file)
      this.$http({
        url: `${this.$dddUrl}/service/code/folder/upload?projectId=${this.projectId}&parentId=${this.currentItem.id}&fileTypeId=${this.fileTypeId}`,
        method: 'post',
        data: paramsData
      }).then(res => {
        this.$datablauMessage.success('上传成功！')
        // this.branchName && this.changeDataTree()
        // !this.branchName && this.getFileTreeData()
        this.changeDataTree()
        this.upZipClose()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    // 右键菜单
    showMenuBox (event, el) {
      let ele = $(event.target).attr('aria-controls') ? $(event.target).attr('aria-controls') : $(event.target).parents('.el-tabs__item').attr('aria-controls')
      // console.log(ele)
      this.tabName = ele.split('-')[1]
      this.isShowMenu = true
      this.menuX = event.pageX + 'px'
      this.menuY = event.pageY + 'px'
    },
    // 右键菜单点击
    handleMenuClick (val) {
      this.isShowMenu = false
      let ary = [...this.models, ...this.editFiles, ...this.dataMigrationList, ...this.scriptList, ...this.procedureFile, ...this.dataSandboxdList, ...this.tables, ...this.tableDetailList, { tabPanlName: 'workflowDefinition', id: '' }, { tabPanlName: 'workflowInstance', id: '' }]
      ary.forEach(item => {
        item.noClose = false
      })
      this.closeTabResume(ary, val, { modelFiles: [], codeDetailFiles: [], metricFiles: [] })
      // this.tabName
    },
    closeTabResume (ary, val, obj) {
      // let { modelFiles, codeDetailFiles } = obj
      if (val === 'all') {
        //  关闭所有
        ary.forEach(item => {
          if (item.noClose) return
          if (this.idToFileData[item.id]?.changed) {
            this.$DatablauCofirm('"' + item.name + '"' + '有未保存的内容，是否关闭？').then(() => {
              this.idToFileData[item.id].changed = false
              if (item.tabPanlName.indexOf('model') !== -1) {
                let modelId = +item.tabPanlName.slice(5)
                obj.modelFiles.push(modelId)
              } else if (item.tabPanlName.indexOf('dataSandboxd') !== -1) {
                let fileId = +item.tabPanlName.slice(12)
                obj.metricFiles.push(fileId)
              } else {
                item.codeDetailId && obj.codeDetailFiles.push(item.codeDetailId)
              }
              this.removeFile(item.tabPanlName, 'noRemove')
              this.closeTabResume(ary, val, obj)
            }).catch(() => {
              item.noClose = true
              this.closeTabResume(ary, val, obj)
            })
          } else if (item.temporarilyFile) {
            // 是映射的临时文件
            this.$DatablauCofirm('当前映射文件还未保存，是否关闭？').then(() => {
              item.temporarilyFile = false
              this.removeFile(item.tabPanlName, 'noRemove')
              this.closeTabResume(ary, val, obj)
            }).catch(() => {

            })
          } else {
            if (item.tabPanlName.indexOf('model') !== -1) {
              let modelId = +item.tabPanlName.slice(5)
              obj.modelFiles.push(modelId)
            } else if (item.tabPanlName.indexOf('dataSandboxd') !== -1) {
              let fileId = +item.tabPanlName.slice(12)
              obj.metricFiles.push(fileId)
            } else {
              item.codeDetailId && obj.codeDetailFiles.push(item.codeDetailId)
            }
            if ((item.tabPanlName.indexOf('dataSandboxd') !== -1 && item.tabPanlName.indexOf('dataSandboxdadd') === -1) || (item.tabPanlName.indexOf('dataMigration') !== -1 && item.tabPanlName.indexOf('dataMigrationadd') === -1)) {
              this.removeFile(item.tabPanlName, 'noRemove', 'noTip')
            } else {
              this.removeFile(item.tabPanlName, 'noRemove')
            }
          }
        })
        HTTP.closeAllCache({ projectId: this.projectId, para: obj })
          .then(res => {
            console.log('批量关闭')
          }).catch(e => {
            this.$showFailure(e)
          })
      } else if (val === 'other') {
        ary.forEach(item => {
          if (item.tabPanlName !== this.tabName && !item.noClose) {
            if (this.idToFileData[item.id]?.changed) {
              this.$DatablauCofirm('"' + item.name + '"' + '有未保存的内容，是否关闭？').then(() => {
                this.idToFileData[item.id].changed = false
                if (item.tabPanlName.indexOf('model') !== -1) {
                  let modelId = +item.tabPanlName.slice(5)
                  obj.modelFiles.push(modelId)
                } else if (item.tabPanlName.indexOf('dataSandboxd') !== -1) {
                  let fileId = +item.tabPanlName.slice(12)
                  obj.metricFiles.push(fileId)
                } else {
                  item.codeDetailId && obj.codeDetailFiles.push(item.codeDetailId)
                }
                this.removeFile(item.tabPanlName, 'noRemove')
                this.closeTabResume(ary, val, obj)
              }).catch(() => {
                item.noClose = true
                this.closeTabResume(ary, val, obj)
              })
            } else if (item.temporarilyFile) {
              // 是映射的临时文件
              this.$DatablauCofirm('当前映射文件还未保存，是否关闭？').then(() => {
                item.temporarilyFile = false
                this.removeFile(item.tabPanlName, 'noRemove')
                this.closeTabResume(ary, val, obj)
              }).catch(() => {

              })
            } else {
              if (item.tabPanlName.indexOf('model') !== -1) {
                let modelId = +item.tabPanlName.slice(5)
                obj.modelFiles.push(modelId)
              } else if (item.tabPanlName.indexOf('dataSandboxd') !== -1) {
                let fileId = +item.tabPanlName.slice(12)
                obj.metricFiles.push(fileId)
              } else {
                item.codeDetailId && obj.codeDetailFiles.push(item.codeDetailId)
              }
              if ((item.tabPanlName.indexOf('dataSandboxd') !== -1 && item.tabPanlName.indexOf('dataSandboxdadd') === -1) || (item.tabPanlName.indexOf('dataMigration') !== -1 && item.tabPanlName.indexOf('dataMigrationadd') === -1)) {
                this.removeFile(item.tabPanlName, 'noRemove', 'noTip')
              } else {
                this.removeFile(item.tabPanlName, 'noRemove')
              }
            }
          }
        })
        HTTP.closeAllCache({ projectId: this.projectId, para: obj })
          .then(res => {
            console.log('批量关闭')
          }).catch(e => {
            this.$showFailure(e)
          })
      }
    },
    async beforeLeaveTab (activeName, oldActiveName) {
      if (!this.treeLeaveType || !this.automaticMode) {
        let text = this.automaticMode ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        let flag1 = oldActiveName && oldActiveName.indexOf('dataMigrationadd') !== -1 && !this.flagType && activeName.indexOf('dataMigrationadd') === -1
        let flag2 = oldActiveName && oldActiveName.indexOf('dataSandboxdadd') !== -1 && !this.automaticMode && activeName.indexOf('dataSandboxdadd') === -1
        if ((flag1 || flag2)) {
          this.sandboxdData = {}
          var p = new Promise((resolve, reject) => {
            this.$DatablauCofirm(text, {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(async () => {
              this.flagType = true
              this.treeLeaveType = true
              this.automaticMode = true
              if (activeName.indexOf('dataSandboxd') !== -1) {
                this.removeTabSandboxd(activeName)
                this.dataSandboxdList.forEach((item, i) => {
                  if (item.id === oldActiveName.slice(12)) {
                    this.dataSandboxdList.splice(i, 1)
                  }
                })
                resolve()
                return
              }
              if (activeName.indexOf('dataMigration') !== -1) {
                let id = activeName.slice(13)
                let fileData = this.idToFileData[id]
                this.migrationId = fileData && fileData.codeDetailId
                this.migrationObj = {}
                let res = {}
                if (fileData && fileData.codeDetailId) {
                  res = await this.$http.get(this.$dddUrl + '/service/code/file/' + fileData.codeDetailId + `?projectId=${this.projectId}`)
                  fileData.type === 15 && (this.migrationObj = JSON.parse(res.data.content))
                }
                this.changeHintWidth(0)
                this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData))
                fileData && this.$refs.fileTree?.setCurrentKey(fileData.id)
                this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
                this.$refs.dataMigrationTree?.setCurrentKey(null)
                this.$refs.workflowTree?.setCurrentKey(null)
                this.$refs.dataSandboxd?.setCurrentKey(null)
                this.currentType = 'dataMigration'
              }
              this.flagType = true
              this.treeLeaveType = true
              this.automaticMode = true
              this.dataMigrationList.forEach((item, i) => {
                if (item.id === oldActiveName.slice(13)) {
                  this.dataMigrationList.splice(i, 1)
                }
              })
              this.dataSandboxdList.forEach((item, i) => {
                if (item.id === oldActiveName.slice(12)) {
                  this.dataSandboxdList.splice(i, 1)
                }
              })
              resolve()
            }).catch(() => {
              // this.flagType = false
              return true
            })
          })
          return p
        }
      } else {
        if (activeName.indexOf('dataMigration') !== -1) {
          let id = activeName.slice(13)
          let fileData = this.idToFileData[id]
          this.migrationId = fileData && fileData.codeDetailId
          this.migrationObj = {}
          let res = {}
          if (fileData && fileData.codeDetailId) {
            res = await this.$http.get(this.$dddUrl + '/service/code/file/' + fileData.codeDetailId + `?projectId=${this.projectId}`)
            fileData.type === 15 && (this.migrationObj = JSON.parse(res.data.content))
          }
          this.changeHintWidth(0)
          this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData))
          fileData && this.$refs.fileTree?.setCurrentKey(fileData.id)
          this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
          this.$refs.dataMigrationTree?.setCurrentKey(null)
          this.$refs.workflowTree?.setCurrentKey(null)
          this.$refs.dataSandboxd?.setCurrentKey(null)
          this.currentType = 'dataMigration'
        } else if (activeName.indexOf('dataSandboxd') !== -1) {
          this.removeTabSandboxd(activeName)
        }
      }
    },
    async removeTabSandboxd (activeName) {
      let id = activeName.slice(12)
      let fileData = this.dataSandboxdList.find(item => item.id === id)

      let res = {}
      if (id.indexOf('add') !== -1) {
        this.sandboxdData = {}
      } else {
        res = await this.$http.get(HTTP.$dddServerUrl + `metrics/build/getMetrics?id=${id}`)
        this.sandboxdData = res.data.data
      }
      this.changeHintWidth(0)
      this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData))
      fileData && this.$refs.fileTree?.setCurrentKey(null)
      this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
      this.$refs.dataMigrationTree?.setCurrentKey(null)
      this.$refs.workflowTree?.setCurrentKey(null)
      this.$refs.dataSandboxd?.setCurrentKey(id)
      this.currentType = 'dataSandboxd'
    },
    async changeTab (tab) {
      let stateAry = this.$store.state.ddtStore.openTableData
      let sqlId
      if (tab.name.indexOf('script_') !== -1) {
        sqlId = Number(tab.name.slice(7))
      } else if (tab.name.indexOf('file') !== -1) {
        sqlId = Number(tab.name.slice(4))
      } else if (tab.name.indexOf('procedure') !== -1) {
        sqlId = tab.name.slice(9)
        let file = this.procedureFile.find(item => item.id === sqlId)
        this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(file))
      }
      if (sqlId && stateAry.indexOf(sqlId) !== -1) {
        this.bottomDomDis = true
      } else {
        this.bottomDomDis = false
      }
      // this.bottomDomDis = !this.bottomDomDis
      let dependenciesTabs = this.dependenciesTreeData[0].children.map(item => item.value)
      if (dependenciesTabs.includes(tab.name)) {
        // 当前tab 为工作流
        let node = {
          data: {
            name: tab.name
          },
          parent: {
            data: {
              name: '工作流'
            }
          }
        }
        this.path = ''
        this.getNodePath(node)
        this.currentType = 'workflow'
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
        this.changeHintWidth(0)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(tab.name)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
        return
      }
      if (tab.name.indexOf('file') !== -1) {
        this.currentType = 'file'
        let id = tab.name.slice(4)
        let file = this.idToFileData[id]
        let obj = this.editFiles.find(item => item.id + '' === id)
        let fileData = file || obj
        this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData))
        this.changeHintWidth(304)
        // this.$refs[`editor${fileData.codeDetailId}`][0].changeSchemaName() // 刷新提示信息
        this.$refs['editor'].forEach(i => {
          i.backPath()
        })
        fileData && this.$refs.fileTree?.setCurrentKey(fileData.id)
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
        let node = this.$refs.fileTree.getNode(fileData)
        if (node) {
          this.path = ''
          this.getNodePath(node)
        }
      }
      if (tab.name.indexOf('model') !== -1) {
        this.currentType = 'model'
        this.changeHintWidth(0)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (tab.name.indexOf('script') !== -1) {
        this.currentType = 'script'
        this.changeHintWidth(304)
        this.$store.commit('ddtStore/setCurrentFileType', { type: '', id: this.scriptList[0].id, hidRightMenu: false, dataBaseId: this.scriptList[0].dataBaseId, schemaName: this.scriptList[0].schemaName })
      } else if (tab.name.indexOf('table') !== -1) {
        this.currentType = 'table'
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
        this.changeHintWidth(0)
      } else if (tab.name.indexOf('file') !== -1) {
        this.currentType = 'file'
      } else if (tab.name.indexOf('dataMigration') !== -1) {
        let obj = this.dataMigrationList.find(item => item.id + '' === tab.name.slice(13)).content || {}
        this.migrationObj = JSON.parse(obj)
      } else if (tab.name.indexOf('dataSandboxd') !== -1) {
        this.currentType = 'dataSandboxd'
        let id = tab.name.slice(12)
        if (!this.automaticMode) return
        if (id.indexOf('add') !== -1) {
          this.sandboxdData = {}
        } else {
          this.$http.get(HTTP.$dddServerUrl + `metrics/build/getMetrics?id=${id}`)
            .then(res => {
              this.sandboxdData = res.data.data
            })
            .catch(e => this.$showFailure(e))
        }
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
        this.changeHintWidth(0)
      }
      // 表示是模型
      if (tab.name.indexOf('script') !== -1 || tab.name.indexOf('model') !== -1) {
        this.currentType = 'model'
        let id = tab.name.indexOf('script_') !== -1 ? tab.name.slice(7) : tab.name.slice(5)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.modelCom.$refs.modelTree?.setCurrentKey(id)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
        if (tab.name.indexOf('script') !== -1) {
          this.scriptList.forEach(element => {
            if (element.id.toString() === tab.name.slice(7)) {
              this.changeHintWidth(304)
              this.$store.commit('ddtStore/setCurrentFileType', { type: 'script', id: element.id, hidRightMenu: false, dataBaseId: element.dataBaseId, schemaName: element.schemaName })
            }
          })
        }
      }
    },
    modifyDirNameFunc () {
      const reg = /[#/\\@$%<>]/gi
      if (reg.test(this.modifyDirName)) {
        this.$datablauMessage.error(`名称不允许包含#/\\@$%<>等特殊字符`)
        return
      }
      let suffixList = this.currentItem.type !== 0 ? this.suffixList[this.currentItem.type] : ''
      this.$http.put(this.$dddUrl + '/service/code/folder', {
        id: this.currentParentId,
        name: this.modifyDirName,
        parentId: this.currentItem.parentId,
        projectId: this.projectId,
        type: this.currentItem.type,
        branch: this.branchName || 'master'
      }).then(res => {
        this.$datablauMessage.success('修改成功!')
        this.currentItem.name = this.modifyDirName
        this.modifyDirName = ''
        this.modifyDirModel = false
        // this.getFileTreeData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    addNewDir () {
      if (!this.newDirName) {
        this.$datablauMessage.error('请输入文件夹名')
      } else {
        const reg = /[#/\\@$%<>]/gi
        if (reg.test(this.newDirName)) {
          this.$datablauMessage.error(`名称不允许包含#/\\@$%<>等特殊字符`)
          return
        }
        // 建模分析
        if (this.dataSandboxd) {
          this.$http.post(`${HTTP.$dddServerUrl}metrics/build/metrics`, {
            metric: {
              type: 0,
              parentId: this.currentParentId,
              projectId: this.projectId,
              name: this.newDirName
            },
            autoModelDto: {
              modelInfo: {},
              codeTreeNodeDto: {}
            }
          })
            .then(res => {
              this.$datablauMessage.success('文件夹创建成功！')
              this.newDirName = ''
              this.newDirModel = false
              this.dataSandboxd = false
              this.getdataSandboxdData()
            })
            .catch(e => {
              this.$showFailure(e)
            })

          return
        }
        let gitPath = this.gitPath.reverse().join('/')
        this.$http.post(this.$dddUrl + '/service/code/folder', {
          projectId: this.projectId,
          parentId: this.currentParentId,
          type: 0,
          name: this.newDirName,
          branch: this.branchName || 'master',
          order: this.orderNum,
          gitPath: gitPath + '/' + this.newDirName
        }).then(res => {
          this.$datablauMessage.success('文件夹创建成功！')
          // this.getFileTreeData()
          if (this.currentItem.childList) {
            this.currentItem.childList.push(res.data)
          } else {
            this.currentItem.childList = [res.data]
          }
          // this.branchName && this.changeDataTree()
          // !this.branchName && this.getFileTreeData()
          // this.changeDataTree()
          this.createdCodeDetail = null
          this.getFileTreeData()
          this.newDirName = ''
          this.newDirModel = false
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    upChange (file, fileList) {
      let size = Number(file.size / 1024 / 1024)
      if (file.name.indexOf('.zip') === -1) {
        this.$datablauMessage.warning('请上传zip格式的文档')
        this.fileList = []
        return
      } else if (size > 10) {
        this.$datablauMessage.warning('上传文件大小不能超过10M')
        this.fileList = []
        return
      }
      this.fileList = [file]
    },
    distribution () {
      if (this.fileList.length && this.fileTypeId) {
        this.httpRequest()
      }
    },
    upZipClose () {
      this.fileList = []
      this.uploadZip = false
      this.fileTypeId = ''
    },
    addNewFile (form) {
      form = form || 'fileForm'
      if (!this.newFileName) {
        this.$datablauMessage.error('请输入文件名')
      } else {
        if (this.type === 15) {
          this.newAddSync++
          this.codeTree = {
            currentParentId: this.currentParentId,
            newFileName: this.newFileName + this.suffixList[this.type],
            branchName: this.branchName || 'master',
            projectId: this.projectId
          }
          this.newFileModel = false
          this.migration()
          this.bottomDomDis = false
          this.addMigration = true
          this.currentType = 'dataMigration'
          this.migrationObj = {}
          this.dataMigrationList.push({
            id: 'add' + this.newAddSync,
            name: this.newFileName + this.suffixList[this.type],
            tabPanlName: 'dataMigration' + 'add' + this.newAddSync
          })
          this.newFileName = ''
          this.currentFile = 'dataMigration' + 'add' + this.newAddSync
          return
        }
        let gitPath = ''
        if (form === 'fileFormCatalogue') {
          gitPath = this.gitPath
        } else {
          gitPath = this.gitPath.reverse().join('/')
        }
        // let suffixList = this.newFileName.indexOf('.') !== -1 ? '' : this.suffixList[this.type]
        this.$refs[form].validate(valid => {
          if (valid) {
            let exten = this.extensionFile.indexOf(this.type) !== -1 ? this.formData.extension : this.suffixList[this.type]
            let taskParams = null
            if (this.extensionFile.indexOf(this.type) !== -1) {
              taskParams = JSON.stringify({
                extension: this.formData.extension,
                mainClass: this.formData.mainClass,
                mainJar: this.formData.mainJar
              })
            }
            this.$http.post(this.$dddUrl + '/service/code/file', {
              projectId: this.projectId,
              parentId: this.currentParentId,
              type: this.type,
              content: '',
              name: this.newFileName + exten,
              admin: this.$store.state.user.username,
              updater: this.$store.state.user.username,
              branch: this.branchName || 'master',
              taskParam: taskParams,
              gitPath: gitPath + '/' + this.newFileName + exten
              // order: this.orderNum
            }).then(res => {
              this.createdCodeDetail = res.data
              this.$datablauMessage.success('文件创建成功！')
              // this.getFileTreeData()
              if (this.currentItem.childList) {
                this.currentItem.childList.push(res.data)
              } else {
                this.currentItem.childList = [res.data]
              }
              // this.branchName && this.changeDataTree()
              // !this.branchName && this.getFileTreeData()
              // this.changeDataTree()
              this.getFileTreeData()
              this.newFileName = ''
              this.newFileModel = false
            }).catch(err => {
              this.$showFailure(err)
            })
          }
        })
      }
    },
    addNewFileDomain () {
      this.$http.post(this.$dddUrl + '/service/code/file/metric', {
        projectId: this.projectId,
        parentId: this.currentParentId,
        type: 1,
        content: '',
        comment: this.newParam.comment,
        name: this.newParam.fileName,
        domainCode: this.newParam.domainCode
      }).then(res => {
        this.$datablauMessage.success('文件创建成功！')
        // this.branchName && this.changeDataTree()
        // !this.branchName && this.getFileTreeData()
        this.changeDataTree()
        this.newParam = {
          fileName: '',
          domainCode: ''
        }
        this.newFileDomainModel = false
        this.$confirm('请前往指标页面补充相关信息', '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getDefaultTab () {
      if (this.editFiles.length) { // 开发程序sql文件
        this.currentType = 'file'
        this.currentFile = 'file' + this.editFiles[0]?.id
        let fileData = this.idToFileData[this.editFiles[0]?.id]
        this.changeHintWidth(304)
        this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData || {}))
        this.setTabsSelect('fileTree', fileData?.id)
      } else if (this.dataMigrationList.length) { // 数据迁移
        this.currentType = 'dataMigration'
        this.currentFile = 'dataMigration' + this.dataMigrationList[0]?.id
        let fileData = this.dataMigrationList[this.dataMigrationList[0]?.id]
        fileData && this.setTabsSelect('fileTree', fileData.id)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (this.dataSandboxdList.length) { // 建模
        this.currentType = 'dataSandboxd'
        this.currentFile = 'dataSandboxd' + this.dataSandboxdList[0]?.id
        this.setTabsSelect('dataSandboxd', this.dataSandboxdList[0]?.id)
        this.changeHintWidth(0)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (this.showWorkflowDefinition) { // 工作流
        this.currentType = 'workflowDefinition'
        this.currentFile = 'workflowDefinition'
        this.setTabsSelect('workflowTree', 'workflowDefinition')
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (this.showWorkflowInstance) { // 工作流
        this.currentType = 'workflowInstance'
        this.currentFile = 'workflowInstance'
        this.setTabsSelect('workflowTree', 'workflowInstance')
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (this.models.length) { // 模型
        this.currentType = 'model'
        this.currentFile = 'model' + this.models[0]?.id
        this.setTabsSelect('modelCom', this.models[0]?.id)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (this.tables.length) { // 模型中的表
        this.currentType = 'table'
        this.currentFile = 'table' + this.tables[0]?.id
        this.setTabsSelect('modelCom', '')
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      } else if (this.procedureFile.length) {
        this.currentType = 'procedure'
        this.currentFile = 'procedure' + this.procedureFile[0]?.id
        let fileData = this.procedureFile[0]
        this.changeHintWidth(304)
        this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData))
      } else if (this.tableDetailList.length) {
        this.currentType = 'columnDetails'
        this.currentFile = 'columnDetails' + this.tableDetailList[0]?.id
        let fileData = this.tableDetailList[0]
        this.changeHintWidth(304)
        this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(fileData))
      } else if (this.scriptList.length) { // 模型的ddl文件
        this.currentType = 'script'
        this.currentFile = 'script_' + this.scriptList[0]?.id
        this.setTabsSelect('modelCom', this.models[0]?.id)
        this.changeHintWidth(304)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 'script', id: this.scriptList[0].id, hidRightMenu: false, dataBaseId: this.scriptList[0].dataBaseId, schemaName: this.scriptList[0].schemaName })
      } else {
        this.currentType = ''
        this.currentFile = ''
        this.setTabsSelect('modelCom', '')
      }
      if (this.currentType.indexOf('script') !== -1 || this.currentType.indexOf('file') !== -1 || this.currentType.indexOf('procedure') !== -1 || this.currentType.indexOf('columnDetails') !== -1) {
      } else {
        this.changeHintWidth(0)
        this.$store.commit('ddtStore/setCurrentFileType', { type: 0, id: null, hidRightMenu: true })
      }
      if (this.editFiles.length === 0 && this.dataMigrationList.length === 0 && this.models.length === 0 && this.tables.length === 0 && this.scriptList.length === 0 && !this.showWorkflowInstance && !this.showWorkflowDefinition && this.procedureFile.length === 0 && this.tableDetailList.length === 0 && this.dataSandboxdList.length === 0) {
        this.$store.commit('ddtStore/setCurrentFileType', { type: '', id: null, hidRightMenu: true, dataBaseId: null, schemaName: null })
        this.changeHintWidth(0)
      }
    },
    setTabsSelect (name, val) {
      if (!val) {
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
        return
      }
      if (name === 'modelCom') {
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(val)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
      } else if (name === 'fileTree') {
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.fileTree?.setCurrentKey(val)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
      } else if (name === 'workflowTree') {
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(val)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(null)
      } else if (name === 'dataMigration') {
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(val)
        this.$refs.dataSandboxd?.setCurrentKey(null)
      } else if (name === 'dataSandboxd') {
        this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
        this.$refs.fileTree?.setCurrentKey(null)
        this.$refs.workflowTree?.setCurrentKey(null)
        this.$refs.dataMigrationTree?.setCurrentKey(null)
        this.$refs.dataSandboxd?.setCurrentKey(val)
      }
    },

    closeFile (item) {
      this.removeFile('procedure' + item.id)
    },

    closeCreate (item) {
      this.removeFile('dataSandboxd' + item.id)
    },
    updateTree (id) {
      this.getdataSandboxdData()
      this.getFileTreeData()
      let index = this.dataSandboxdList.findIndex(item => item.id === id)
      if (index !== -1) {
        this.dataSandboxdList.splice(index, 1)
        this.getDefaultTab()
      }
      this.automaticMode = true
    },
    removeFile (name, type = '', noTip) {
      // noTip 关闭所有的值判断
      if (name.indexOf('model') !== -1) {
        let modelId = +name.slice(5)
        let index = this.models.findIndex(i => i.id === modelId)
        this.models.splice(index, 1)
        type !== 'noRemove' && this.closeCache('MODEL', modelId)
        this.getDefaultTab()
      } else if (name.indexOf('columnDetails') !== -1) {
        let num = 13
        let fileId = name.slice(num)
        // let deleteFile = this.tableDetailList.find(item => item.id + '' === fileId)
        this.tableDetailList = this.tableDetailList.filter(item => item.id !== fileId)
        this.getDefaultTab()
      } else if (name.indexOf('table') !== -1) {
        let tableId = name.slice(5)
        let index = this.models.findIndex(i => i.id === tableId)
        this.tables.splice(index, 1)
        this.getDefaultTab()
      } else if (name.indexOf('file') !== -1) {
        let num = 4
        let fileId = name.slice(num)
        let deleteFile = this.editFiles.find(item => item.id + '' === fileId)
        if (deleteFile) {
          if (this.idToFileData[deleteFile.id]?.changed) {
            this.$DatablauCofirm('有未保存的内容，是否关闭？').then(() => {
              this.editFiles = this.editFiles.filter(item => item.id + '' !== fileId)
              this.idToFileData[deleteFile.id].changed = false
              this.$store.commit('delVariable', deleteFile.id)
              this.$store.commit('delFunNames', deleteFile.id)
              this.getDefaultTab()
              this.$store.commit('ddtStore/delSetting', deleteFile.id)
              type !== 'noRemove' && this.closeCache('FILE', deleteFile.codeDetailId)
              // if (this.editFiles.length) {
              //   this.currentFile = this.editFiles[0].id + ''
              // }
            }).catch(() => {

            })
          } else if (deleteFile.temporarilyFile) {
            // 是映射的临时文件
            this.$DatablauCofirm('当前映射文件还未保存，是否关闭？').then(() => {
              this.editFiles = this.editFiles.filter(item => item.id + '' !== fileId)
              this.getDefaultTab()
            }).catch(() => {

            })
          } else {
            this.editFiles = this.editFiles.filter(item => item.id + '' !== fileId)
            this.$store.commit('ddtStore/delSetting', fileId)
            type !== 'noRemove' && this.closeCache('FILE', deleteFile.codeDetailId)
            this.getDefaultTab()
            // if (this.editFiles.length) {
            //   this.currentFile = this.editFiles[0].id + ''
            // }
          }
        }
      } else if (name.indexOf('dataMigration') !== -1) {
        let num = 13
        let fileId = name.slice(num)
        let deleteFile = this.dataMigrationList.find(item => item.id + '' === fileId)
        if (deleteFile) {
          if (!this.flagType && noTip !== 'noTip') {
            this.$DatablauCofirm('数据同步正在创建中离开将不保存本页修改，确认要离开吗？', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.dataMigrationList.forEach((item, i) => {
                if (item.id.toString().indexOf('add') !== -1) {
                  this.dataMigrationList.splice(i, 1)
                }
              })
              type !== 'noRemove' && this.closeCache('FILE', deleteFile.codeDetailId)
              this.flagType = true
              this.treeLeaveType = true
              this.getDefaultTab()
            }).catch(() => {
              this.flagType = false
            })
          } else {
            this.dataMigrationList = this.dataMigrationList.filter(item => item.id + '' !== fileId)
            type !== 'noRemove' && this.closeCache('FILE', deleteFile.codeDetailId)
            this.getDefaultTab()
          }
        }
      } else if (name.indexOf('script_') === 0) { // 关闭工作流 tab
        let scriptId = name.replace('script_', '')
        let index = this.scriptList.findIndex(i => i.id === scriptId)
        if (this.idToFileData[scriptId]?.changed) {
          this.$DatablauCofirm('有未保存的内容，是否关闭？')
            .then(() => {
              this.scriptList.splice(index, 1)
              this.getDefaultTab()
            })
            .catch(() => {})
        } else {
          this.scriptList.splice(index, 1)
          this.getDefaultTab()
        }
      } else if (name.indexOf('procedure') !== -1) {
        let num = 9
        let fileId = name.slice(num)
        let deleteFile = this.procedureFile.find(item => item.id + '' === fileId)
        if (this.idToFileData[fileId]?.changed) {
          this.$DatablauCofirm('有未保存的内容，是否关闭？')
            .then(() => {
              this.procedureFile = this.procedureFile.filter(item => item.id !== deleteFile.id)
              this.getDefaultTab()
            })
            .catch(() => {})
        } else {
          this.procedureFile = this.procedureFile.filter(item => item.id !== deleteFile.id)
          this.getDefaultTab()
        }
        // this.procedureFile
      } else if (name.indexOf('dataSandboxd') !== -1) {
        if (!this.automaticMode && noTip !== 'noTip') {
          this.$DatablauCofirm('建模分析正在创建中离开将不保存本页修改，确认要离开吗？', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let fileId = name.slice(12)
            this.dataSandboxdList = this.dataSandboxdList.filter(item => item.id + '' !== fileId)
            this.getDefaultTab()
            type !== 'noRemove' && this.closeCache('METRIC', fileId)
            this.automaticMode = true
          })
            .catch(() => {})
        } else {
          let fileId = name.slice(12)
          this.dataSandboxdList = this.dataSandboxdList.filter(item => item.id + '' !== fileId)
          this.getDefaultTab()
          type !== 'noRemove' && this.closeCache('METRIC', fileId)
          noTip !== 'noTip' && (this.automaticMode = true)
        }
      } else if (name === 'workflowDefinition') { // 关闭工作流 tab
        this.showWorkflowDefinition = false
        this.getDefaultTab()
      } else if (name === 'workflowInstance') {
        this.showWorkflowInstance = false
        this.getDefaultTab()
      }
      if (name === 'dataMigration') {
        // console.log(11)
        this.addMigration = false
        this.showDataMigration = false
        this.getDefaultTab()
      }
    },
    dataSandboxdFunction (data, node) {
      let result = []
      result.push({
        label: '新建',
        callback: () => {
          this.orderNum = data.childList?.length || 1
          this.currentParentId = data.id
          this.currentItem = data
          this.newDirModel = true
          this.dataSandboxd = true
        }
      })
      node.level !== 1 && result.push({
        label: '删除',
        callback: () => {
          this.currentParentId = node.parent.data.id
          this.deleteDataSandboxdFile(data)
        }
      })
      return result
    },
    deleteDataSandboxdFile (data) {
      this.$DatablauCofirm('确定删除该文件夹？').then(() => {
        this.$http.delete(`${HTTP.$dddServerUrl}metrics/build/deleteMetrics?id=${data.id}`)
          .then(res => {
            this.$datablauMessage.success('删除成功')
            this.getdataSandboxdData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
        .catch(() => {})
    },
    // 获取文件路径
    getPathRoute (node) {
      this.gitPath.push(node.data.name)
      if (node.data.parentId !== 0) {
        this.getPathRoute(node.parent)
      }
    },
    dataOptionsFunction (data, node) {
      const isAdmin = this.$store.state.user.isAdmin
      let nodeAuth = data.nodeAuth || []
      let result = []
      if (!isAdmin && !this.auth['PROCEDURE_EDIT']) {
        return result
      }
      if (data.type === 0) { // 文件夹
        result.push({
          label: '新建',
          callback: () => {
            this.orderNum = data.childList?.length || 1
            this.currentParentId = data.id
            this.currentItem = data
            this.newDirModel = true
            this.gitPath = []
            this.getPathRoute(node)
          }
        })
        result.push({
          label: '重命名',
          callback: () => {
            this.currentParentId = data.id
            this.currentItem = data
            this.modifyDirName = data.name
            this.modifyDirModel = true
            this.logTil = '重命名'
          }
        })
        result.push({
          label: '新建文件',
          childList: [
            {
              label: '',
              type: 'HIVE',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(1, data)
              }
            },
            {
              label: '',
              type: 'MYSQL',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(2, data)
              }
            },
            {
              label: '',
              type: 'POSTGRESQL',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(3, data)
              }
            },
            {
              label: '',
              type: 'ORACLE',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(4, data)
              }
            },
            {
              label: '',
              type: 'STARROCKS',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(5, data)
              }
            },
            {
              label: '',
              type: 'SQLSERVER',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(6, data)
              }
            },
            {
              label: '',
              type: 'FLINKSQL',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.formData.extension = ''
                this.fileShow(7, data)
              }
            },
            {
              label: '',
              type: 'FLINK_STREAM',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.formData.extension = ''
                this.fileShow(19, data)
              }
            },
            /* {
              label: '',
              type: 'FLINKJAR',
              callback: () => {
                this.fileShow(8, data)
              }
            },
            {
              label: '',
              type: 'JAVA',
              callback: () => {
                this.fileShow(9, data)
              }
            }, */
            {
              label: '',
              type: 'PYTHON',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(10, data)
              }
            },
            {
              label: '',
              type: 'GBASE',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(11, data)
              }
            },
            {
              label: '',
              type: 'TRANSWARP-INCEPTOR',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(12, data)
              }
            },
            {
              label: '',
              type: 'SHELL',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(13, data)
              }
            },
            {
              label: '',
              type: 'FILE',
              callback: () => {
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(14, data)
              }
            },
            {
              label: '',
              name: '数据同步',
              type: 'migration',
              callback: async () => {
                // let flag = true
                // if (this.addMigration) {
                //   await this.$DatablauCofirm(`数据同步正在编辑中，确认要新建吗？`, '')
                //     .then(() => {
                //       flag = true
                //       this.addMigration = false
                //     })
                //     .catch(() => {
                //       flag = false
                //       this.clearTreeActive()
                //     })
                // }
                // if (!flag) return
                // this.fileShow(15, data)
                // this.flagType = false
                // this.treeLeaveType = false
                this.gitPath = []
                this.getPathRoute(node)
                this.fileAddMigration(data)
              }
            },
            {
              label: '',
              type: 'SPARK',
              callback: () => {
                this.formData.extension = ''
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(30, data)
              }
            },
            {
              label: '',
              type: 'CLICKHOUSE',
              callback: () => {
                this.formData.extension = ''
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(16, data)
              }
            },
            {
              label: '',
              type: 'OCEANBASE',
              callback: () => {
                this.formData.extension = ''
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(17, data)
              }
            },
            {
              label: '',
              type: 'DB2',
              callback: () => {
                this.formData.extension = ''
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(18, data)
              }
            },
            {
              label: '',
              name: 'Kettle Transformation',
              type: 'transformation',
              callback: () => {
                this.formData.extension = ''
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(31, data)
              }
            },
            {
              label: '',
              name: 'Kettle Job',
              type: 'job',
              callback: () => {
                this.formData.extension = ''
                this.gitPath = []
                this.getPathRoute(node)
                this.fileShow(32, data)
              }
            }
            // {
            //   label: '',
            //   type: 'SYNC',
            //   callback: () => {

            //   }
            // }
          ]
          /* callback: (evt) => {
            console.log(evt)
            // console.log(evt.clientX)
            /!* this.orderNum = data.childList?.length || 1
            this.currentParentId = data.id
            this.currentItem = data
            this.newFileModel = true *!/
          } */
        })
        if (data.parentId !== 0) {
          result.push({
            label: '移动',
            callback: () => {
              this.moveDir(data)
            }
          })
          result.push({
            label: '删除',
            callback: () => {
              this.deleteDir(data)
            }
          })
        }
        result.push({
          label: '上传',
          callback: () => {
            this.currentItem = data
            this.uploadZip = true
          }
        })
        result.push({
          label: '下载',
          callback: () => {
            this.downlaodDir(data)
          }
        })
        data.parentId === 0 && this.gitEnable && result.push(
          {
            label: '分支管理',
            callback: () => {
              this.switchBranch = true
              /* this.oldBranch = data.branch
              this.branchName = data.branch */
              this.getBranchList()
              this.$refs.branchTable?.clearSingleSelect()
            }
          })
        /* label: '切换分支',
          callback: () => {
            this.switchBranch = true
            this.oldBranch = data.branch
            this.branchName = data.branch
            this.getBranchList()
          }
        }, {
          label: '新建分支',
          callback: () => {
            this.newBranch = true
            this.newBranchName = ''
            // this.getBranchList()
          } */
        // })
        // if (isAdmin) {
        //   result.push({
        //     label: '权限管理',
        //     callback: () => {
        //       this.auditManage(data)
        //     }
        //   })
        // }
      } else { // 文件
        result.push({
          label: '重命名',
          callback: () => {
            this.currentParentId = data.id
            this.currentItem = data
            // let num = data.name.lastIndexOf('.') !== -1 ? data.name.lastIndexOf('.') : data.name.length
            // this.modifyDirName = data.name.substr(0, num)
            this.modifyDirName = data.name
            this.modifyDirModel = true
            this.logTil = '重命名'
          }
        })
        result.push({
          label: '编辑',
          callback: () => {
            this.nodeClick(data)
          }
        })
        result.push({
          label: '移动',
          callback: () => {
            this.moveDir(data)
          }
        })
        result.push({
          label: '删除',
          callback: () => {
            this.deleteFile(data)
          }
        })

        result.push({
          label: '查看历史',
          callback: () => {
            this.showVersionHistory(data)
          }
        })
        // result.push({
        //   label: '查看指标',
        //   callback: () => {
        //     this.$router.push({
        //       path: '/main/indexDefinition',
        //       query: {
        //         id: data.domainId
        //       }
        //     })
        //   }
        // })
        // result.push({
        //   label: '绑定指标',
        //   callback: () => {
        //     this.$alert('开发中...')
        //   }
        // })
      }

      return result
    },
    getBranchList () {
      this.branchList = null
      this.branchListArr = null
      this.searchBranchName = ''
      this.$http.get(`${this.$dddUrl}/service/project/git/branch?projectId=${this.projectId}`)
        .then(res => {
          this.branchList = res.data
          this.branchListArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addBranch () {
      this.newBranch = true
      this.newBranchName = ''
    },
    // 分支选择
    branchSelectList (val) {
      if (!val) return
      this.branchSelect = val
      this.branchName = val
    },
    updateBranch () {},
    modifyBranchName () {},
    deleteBranch (row) {
      this.$http.get(`${this.$dddUrl}/service/project/git/branch/delete?projectId=${this.projectId}&branchName=${row}`)
        .then(res => {
          this.$datablauMessage.success('分支删除成功')
          this.getBranchList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setNewBranch () {
      if (!this.newBranchName) {
        this.$datablauMessage.error('请输入/选择版本名')
        return
      }
      this.$http.get(`${this.$dddUrl}/service/project/git/branch/create?projectId=${this.projectId}&branchName=${this.newBranchName}&ref=${this.branchName || 'master'}`)
        .then(res => {
          this.$datablauMessage.success('新建分支成功')
          this.getBranchList()
          this.newBranch = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    selectBlur (e) {
      // 属性类别
      if (e.target.value !== '') {
        this.newBranchName = e.target.value
        this.$forceUpdate() // 强制更新
      }
    },
    selectClear () {
      this.newBranchName = ''
      this.$forceUpdate()
    },
    selectChange (val) {
      this.newBranchName = val
      this.$forceUpdate()
    },
    changeBranchClick () {
      /* if (!this.branchName) {
        this.$datablauMessage.error('请选择版本')
        return
      } */
      this.currentParentId = null
      this.changeBranchTree()
      this.switchBranch = false
      this.$store.commit('clearVariable')
    },
    delBranch () {
      this.branchName = this.oldBranch
      this.branchSelect = ''
      this.switchBranch = false
    },
    // 分支名切换脚本树
    changeBranchTree () {
      let codeDetailFiles = this.editFiles.map(item => item.codeDetailId)
      if (this.modifyFileList.length) {
        this.$DatablauCofirm('有未保存的内容，是否关闭？').then(() => {
          this.modifyFileList.forEach(item => {
            this.idToFileData[item.id] && (this.idToFileData[item.id].changed = false)
          })
          this.editFiles = []
          this.createdCodeDetail = null
          this.getFileTreeData()
        })
      } else {
        // this.changeTree()
        this.editFiles = []
        this.createdCodeDetail = null
        this.getFileTreeData()
      }
      codeDetailFiles.length && HTTP.closeAllCache({ projectId: this.projectId, para: { modelFiles: [], codeDetailFiles: codeDetailFiles, metricFiles: [] } })
        .then(res => {
          console.log('批量关闭')
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    changeDataTree () {
      if (this.modifyFileList.length) {
        this.$DatablauCofirm('有未保存的内容，是否关闭？').then(() => {
          this.modifyFileList.forEach(item => {
            this.idToFileData[item.id] && (this.idToFileData[item.id].changed = false)
          })
          this.editFiles = []
          // this.modifyFileList = []
          // this.changeTree()
          this.createdCodeDetail = null
          this.getFileTreeData()
        })
      } else {
        // this.changeTree()
        this.editFiles = []
        this.createdCodeDetail = null
        this.getFileTreeData()
      }
    },
    deleteFile (data) {
      let deleteFile = this.editFiles.find(item => item.id === data.id)
      if (deleteFile) {
        if (this.idToFileData[deleteFile.id]?.changed) {
          this.$DatablauCofirm('有未保存的内容，确定删除该文件？').then(() => {
            this.editFiles = this.editFiles.filter(item => item.id !== data.id)
            this.idToFileData[deleteFile.id].changed = false
            this.$store.commit('delVariable', deleteFile.id)
            this.$store.commit('delFunNames', deleteFile.id)
            if (this.editFiles.length) {
              this.currentFile = this.editFiles[0]?.id + ''
            }
          }).catch(() => {

          })
        } else {
          this.$DatablauCofirm('该文件已打开，确定删除？').then(() => {
            this.httpDeleteFile(data)
            this.editFiles = this.editFiles.filter(item => item.id !== data.id)
            if (this.editFiles.length) {
              this.currentFile = this.editFiles[0]?.id + ''
            }
          }).catch(() => {

          })
        }
      } else {
        this.$DatablauCofirm('确定删除该文件？').then(() => {
          this.httpDeleteFile(data)
        }).catch(() => {

        })
      }
    },
    auditManage (data) {
      this.chosenCategoryId = data.id
      this.showAuthManageDialog = true
    },
    goBack () {
      // this.branchName && this.changeDataTree()
      // !this.branchName && this.getFileTreeData()
      this.changeDataTree()
      this.showAuthManageDialog = false
    },
    downlaodDir (data) {
      this.$http({
        url: `${this.$dddUrl}/service/code/folder/download?projectId=${this.projectId}&folderId=${data.id}&branch=${this.branchName || 'master'}`,
        method: 'POST',
        responseType: 'blob'
      }).then(res => {
        const blob = res.data
        let link = document.createElement('a')
        link.href = URL.createObjectURL(new Blob([blob], { type: 'application/x-msdownload' }))
        link.download = data.name + '.zip'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    moveDir (data) {
      this.chooseTreeId++
      this.currentItem = data
      this.moveDirModel = true
      this.disabledDirIds = new Set()
      this.chooseMoveDirId = null
      this.getAllDeepDirIds(this.idToFileData[data.id])
    },
    moveFileToDir () {
      let folderId = { data: { id: this.currentItem.id } }
      let targetParentId = { data: {
        id: this.chooseMoveDirId.id,
        order: this.chooseMoveDirId.order,
        type: this.chooseMoveDirId.type
      },
      parent: {
        data: {
          id: this.chooseMoveDirId.parentId
        }
      }
      }
      this.moveFile(folderId, targetParentId, 'inner', () => {
        this.getFileTreeData()
      })
    },
    getAllDeepDirIds (file) {
      if (file.type === 0) {
        this.disabledDirIds.add(file.id)
        file.childDirList && file.childDirList.forEach(i => this.getAllDeepDirIds(i))
      }
    },
    deleteDir (data) {
      this.$DatablauCofirm(data.childList ? '确定删除该文件夹？该文件夹下所有文件(包括未保存文件)都会被删除！' : '确定删除该文件夹？').then(() => {
        this.$http({
          url: this.$dddUrl + '/service/code/folder/' + data.id,
          method: 'delete'
        }).then(res => {
          this.fileIds = []
          this.getFileIds(data)
          this.editFiles = this.editFiles.filter(item => !this.fileIds.includes(item.id))
          // if (this.editFiles.length) {
          //   this.currentFile = this.editFiles[0]?.id + ''
          // }
          this.getDefaultTab()
          this.$datablauMessage.success('删除成功!')
          // 从父元素删除结点
          let childList = this.idToFileData[data.parentId].childList
          if (childList) {
            this.idToFileData[data.parentId].childList = childList.filter(i => i.id !== data.id)
          }
          // this.getFileTreeData()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(() => {

      })
    },
    getFileIds (data) {
      if (data.type === 0) {
        data.childList && data.childList.forEach(item => this.getFileIds(item))
      } else {
        this.fileIds.push(data.id)
      }
    },
    showVersionHistory (data) {
      this.versionHistoryModel = true
      this.versionHistoryList = []
      this.$http.get(`${this.$dddUrl}/service/code/files?codeDetailId=${data.codeDetailId}`).then(res => {
        res.data.forEach(item => {
          item.content += item.properties && Object.keys(item.properties).length ? `;变量名：${JSON.stringify(item.properties)}` : ''
          item.content += item.funNames && Object.keys(item.funNames).length ? `;udf函数：${item.funNames.join(',')}` : ''
        })
        this.versionHistoryList = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    httpDeleteFile (data) {
      this.$http({
        url: this.$dddUrl + '/service/code/file',
        method: 'delete',
        data: {
          id: data.id,
          projectId: this.projectId,
          codeDetailId: data.codeDetailId,
          name: data.name,
          type: data.type,
          parentId: data.parentId
        }
      }).then(res => {
        this.getDefaultTab()
        this.$datablauMessage.success('删除成功!')
        // 从父元素删除结点
        let childList = this.idToFileData[data.parentId].childList
        if (childList) {
          let index = childList.findIndex(i => i.id === data.id)
          if (index !== -1) {
            childList.splice(index, 1)
          }
        }
        // this.getFileTreeData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    treeRightInfoFormatter (node, data) {
      if (data.changed) {
        return `<span style="color: rgb(218,140,87);position: relative;top: -5px;">M</span>`
      } else if (data.parentId === 0 && this.gitEnable) {
        return `<span style="color: #888888;position: relative;top: -5px;right:1px">${this.fileData[0].branch || 'master'}</span>`
      } else {
        return ''
      }
    },
    searchFile () {
      this.$refs.fileTree.filter(this.fileSearchQuery)
      this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree.filter(this.fileSearchQuery)
    },
    getFileDirData (arr) {
      return arr.filter(i => {
        if (i.type === 0) {
          if (i.childList) {
            i.childDirList = this.getFileDirData(i.childList)
          }
          return true
        } else {
          return false
        }
      })
    },
    mapFileData (arr) {
      arr.forEach(i => {
        if (i.type === 0) {
          if (i.childList) {
            i.children = i.childList
            this.mapFileData(i.children)
          }
        }
      })
    },
    moveFile (folderId, targetParentId, dropType, fn) {
      let type = {
        inner: 0,
        after: 1,
        before: 2
      }
      let params = {
        nodeId: folderId.data.id,
        projectId: this.projectId,
        branch: this.branchName || 'master',
        targetId: targetParentId.data.id,
        targetOrder: targetParentId.data.order,
        type: type[dropType]
      }
      if (targetParentId.parent.data.length) {
        params.targetParentId = targetParentId.parent.data[0].id
      } else {
        params.targetParentId = targetParentId.parent.data.id
      }
      this.$http.post(`${this.$dddUrl}/service/code/folder/move?nodeId=${params.nodeId}&projectId=${params.projectId}&branch=${params.branch}&targetId=${params.targetId}&targetParentId=${params.targetParentId}&targetOrder=${params.targetOrder}&type=${params.type}`)
        .then(res => {
          this.$datablauMessage.success('移动目录成功！')
          this.currentParentId = dropType === 'inner' ? targetParentId.data.id : targetParentId.parent.data.id
          this.moveDirModel = false
          fn && fn()
          // this.changeDataTree()
          fn && fn()
        })
        .catch(() => {
          this.$showFailure('文件移动失败')
          this.treeLoading = true
          // this.changeDataTree()
        })
    },
    filterList (ary) {
      if (ary) {
        for (let i = 0; i < ary.length; i++) {
          if (ary[i].type !== 0) {
            ary.splice(i, 1)
            i--
          }
        }
        ary.forEach(item => {
          if (item.childList.length) {
            this.filterList(item.childList)
          }
          if (!item.childList.length) {
            item.childList = null
          }
        })
      }
    },
    getFileTreeData (val) {
      let branch = this.branchName || 'master'
      this.treeLoading = true
      HTTP.changeDataTree({ id: this.projectId, branch }).then(res => {
        this.fileData = [res]
        this.catalogueData = _.cloneDeep([res])
        this.filterList(this.catalogueData)
        // this.codeDetail = [] // 切换分支的sql存放
        this.branchName = res.branch
        this.oldBranch = res.branch
        this.getFileDirData(this.fileData)
        this.mapFileData(this.fileData)
        this.expandKeys = (this.currentParentId && [this.currentParentId]) || [res.id]
        this.idToFileDataBak = _.cloneDeep(this.idToFileData)
        this.idToFileData = {}
        this.translateTreeToMap(this.fileData)
        this.$nextTick(function () {
          if (this.createdCodeDetail) {
            this.nodeClick(this.$refs.fileTree.getNode(this.createdCodeDetail.id).data, this.$refs.fileTree.getNode(this.createdCodeDetail.id), '', 'add')
            this.$refs.fileTree.setCurrentKey(this.createdCodeDetail.id)
          }
          val === 'getCache' && this.getCacheFile()
          this.$refs.workflowDefinitionIframe.changebranchName()
        })
      }).catch(err => {
        this.treeLoading = true
        this.$showFailure(err)
      }).finally(() => {
        this.treeLoading = false
      })
    },

    // getFileDataFilterAuth() {
    //   function getAuthFile(arr) {
    //     let result = []
    //     arr.forEach(item => {
    //       if ((item.nodeAuth || []).indexOf('UPDATE') !== -1 || this.$store.state.user.isAdmin) {
    //         result.push(item)
    //       }
    //     })
    //     return result
    //   }
    //   this.fileDataFilterAuth = getAuthFile(this.fileData)
    // },
    translateTreeToMap (arr) {
      arr.forEach(item => {
        this.$set(item, 'changed', this.idToFileDataBak[item.id] && this.idToFileDataBak[item.id].changed)
        if (item.type === 0) { // 文件夹
          item.showName = item.name
        } else if (item.type) { // 文件
          item.showName = `${item.name} 管理者：${item.admin} 更新者： ${item.updater} 备注： ${item.comment}`
        }
        this.idToFileData[item.id] = item
        if (item.childList) {
          this.translateTreeToMap(item.childList)
        }
      })
    },
    getDataName (name) {
      let v = this.iconNameLIst[name.type] || 'default'
      if (this.iconNameLIst[name.type] === 'tree-flinksql' || this.iconNameLIst[name.type] === 'tree-flinkjar' || this.iconNameLIst[name.type] === 'tree-gbase' || this.iconNameLIst[name.type] === 'tree-hive' || this.iconNameLIst[name.type] === 'tree-java' || this.iconNameLIst[name.type] === 'tree-python' || this.iconNameLIst[name.type] === 'tree-shell' || this.iconNameLIst[name.type] === 'tree-migration' || this.iconNameLIst[name.type] === 'tree-transformation' || this.iconNameLIst[name.type] === 'tree-job') {
        return require(`@/assets/images/database/${v}.svg`)
      } else if (name.type === 'procedure') {
        return require(`@/assets/images/database/cunchu.svg`)
      } else if (name.type === 'view') {
        return require(`@/assets/images/search/view.svg`)
      } else if (name.type === 'func') {
        return require(`@/assets/images/search/function.svg`)
      } else if (this.iconNameLIst[name.type] === 'tree-flinkStream') {
        return require(`@/assets/images/database/tree-flinkjar.svg`)
      }
      return require(`@/assets/images/database/${v}.png`)
    },
    dataIconFunction (data, node) {
      if (data.type === 0) { // 文件夹
        if (data.parentId === 0) {
          return 'iconfont icon-code'
        } else {
          return 'iconfont icon-openfile'
        }
      } else if (data.type) {
        let name = this.iconNameLIst[data.type] || 'default'
        return `tree-icon ${name}`
      } else {
        return ''
      }
    },
    dataMigrationFunction (data, node) {
      if (data.value === 'dataMigration') {
        return 'iconfont icon-file'
      }
    },
    workflowIconFunction (data, node) {
      if (data.value === 'dependent') {
        if (node.expanded) { // 文件夹
          return 'iconfont icon-liucheng'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.value === 'workflowDefinition') {
        return 'iconfont icon-menu-lcgl'
      } else {
        return 'iconfont icon-menu-ywlc'
      }
    },
    dataSandIconFunction (data, node) {
      if (node.level === 1) {
        return 'iconfont icon-modelanalyze'
      } else {
        if (data.type === 0) return 'iconfont icon-file'
        if (data.type !== 0) return 'iconfont icon-menu-xqgl'
      }
    },
    filterNode (value, data) {
      if (this.statusFilter === -1) { // 全部状态
        if (!value) {
          return true
        } else {
          return string.matchKeyword(data, value, 'name', 'domainCode', 'domainName', 'admin', 'updater', 'comment', 'content')
        }
      } else {
        if (data.status !== this.statusFilter) {
          return false
        } else {
          return string.matchKeyword(data, value, 'name', 'domainCode', 'domainName', 'admin', 'updater', 'comment', 'content')
        }
      }
    },
    getNodePath (node) {
      if (!node) {
        return ''
      } else if (node.parent) {
        let parentString = this.getNodePath(node.parent)
        this.path += parentString + node.data.name
        return parentString
      } else {
        return '>'
      }
    },
    nodeDirClick (data, node) {
      this.chooseMoveDirId = data
    },
    nodeLockDirClick (data, node) {
      this.chooseMoveDirId = null
    },
    nodeExpandModel (data) {
      this.nodeExpand(data)
    },
    nodeExpand (data, node, el) {
      this.$nextTick(() => {
        node && this.Drag.initDrag(el.$refs.node)
        !node && this.Drag.initDrag(data.ele)
      })
    },
    async nodeClick (data, node, e, addType) {
      let flag = true
      this.migrationId = data.codeDetailId
      this.isShowMenu = false
      // if (this.addMigration) {
      //   await this.$DatablauCofirm(`数据同步正在编辑中，确认要取消吗？`, '')
      //     .then(() => {
      //       flag = true
      //       this.addMigration = false
      //     })
      //     .catch(() => {
      //       flag = false
      //       this.clearTreeActive()
      //     })
      // }
      if (!flag) return
      this.$refs.workflowTree?.setCurrentKey(null)
      this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
      this.$refs.dataMigrationTree?.setCurrentKey(null)
      this.$refs.dataSandboxd?.setCurrentKey(null)
      if (data.type === 0) return
      let stateAry = this.$store.state.ddtStore.openTableData
      if (stateAry.indexOf(data.id) !== -1) {
        this.bottomDomDis = true
      } else {
        this.bottomDomDis = false
      }
      // this.bottomDomDis = !this.bottomDomDis // 血缘，数据弹窗消失
      this.changeHintWidth(304)
      this.currentType = 'file'
      if (!node) {
        node = this.$refs.fileTree?.getNode(data)
      }
      if (data.type !== 0) { // 文件
        this.path = ''
        this.getNodePath(node)
      }
      if (data.type) {
        try {
          let nodeAuth = node?.parent?.data?.nodeAuth || []
          let res = {}
          let readonly = ''
          /* if (this.branchName && this.codeDetail?.length) {
            res.data = this.codeDetail.find(item => item.id === data.codeDetailId)
            typeof res.data.funNames === 'string' && (res.data.funNames = JSON.parse(res.data.funNames))
            typeof res.data.properties === 'string' && (res.data.properties = JSON.parse(res.data.properties))
            readonly = 'script' // sql只读
          } else { */
          res = await this.$http.get(this.$dddUrl + '/service/code/file/' + data.codeDetailId + `?projectId=${this.projectId}`)
          // }
          // 定义变量值
          if (res.data.properties && !this.$store.state.variable[data.id]) {
            // variable = Object.keys(res.data.properties).map(item => {
            //   return { name: item, value: res.data.properties[item] }
            // })

            let key = {}
            key[data.id] = res.data.properties
            this.$store.commit('setVariable', key)
            this.$store.commit('setOldVariable', key)
          }
          if (res.data.funNames && !this.$store.state.funNames[data.id]) {
            let key = {}
            key[data.id] = res.data.funNames
            this.$store.commit('setFunNames', key)
            this.$store.commit('setOldFunNames', key)
          }
          // let fileStatus = await this.$http.post(this.$dddUrl + '/service/code/file/getStatus?fileId=' + data.codeDetailId)
          let file = {
            id: data.id,
            type: readonly || data.type,
            name: data.name,
            status: data.status,
            content: res.data.content || '',
            curId: res.data.curId,
            codeDetailId: data.codeDetailId,
            isDiff: false,
            inlineDiff: false,
            origin: '',
            // bottomInfoTab: 'data',
            // dataSql: '',
            lineageSql: '',
            parentId: data.parentId,
            projectId: data.projectId,
            // dataSourceId: '',
            // schemaList: [],
            // schemaName: '',
            maxLength: 10,
            nodeAuth: nodeAuth,
            // domainState: fileStatus.data.domainState,
            // applyMessage: fileStatus.data.applyMessage,
            showName: data.showName,
            taskCode: res.data.taskCode || '',
            taskParam: ''
          }
          res.data.taskParam && (file.taskParam = JSON.parse(res.data.taskParam))
          if (addType === 'add') {
            if (data.type === 2 || data.type === 3 || data.type === 4 || data.type === 6 || data.type === 11) { // MySQL，Oracle, SQL Server, GBase， PostgreSQL
              file.content = JSON.parse(this.sqlTEmplet.Sql)
            } else if (data.type === 8) { // FlinkJar
              file.content = JSON.parse(this.sqlTEmplet.FlinkJar)
            } else if (data.type === 7) { // FlinkSQL
              file.content = JSON.parse(this.sqlTEmplet.FlinkSQL)
            } else if (data.type === 1) { // Hive
              file.content = JSON.parse(this.sqlTEmplet.Hive)
            } else if (data.type === 9) { // Java
              file.content = JSON.parse(this.sqlTEmplet.Java)
            } else if (data.type === 10) { // Python
              file.content = JSON.parse(this.sqlTEmplet.Python)
            } else if (data.type === 13) { // Shell
              file.content = JSON.parse(this.sqlTEmplet.Shell)
            } else if (data.type === 5) { // StarRocks
              file.content = JSON.parse(this.sqlTEmplet.StarRocks)
            }
          }
          if (data.type === 15) {
            if (this.flagType === true && this.automaticMode) {
              data.type === 15 && (this.migrationObj = JSON.parse(res.data.content))
              if (this.dataMigrationList.findIndex(item => item.id === data.id) !== -1) {
                this.currentFile = 'dataMigration' + data.id
              } else {
                file.tabPanlName = 'dataMigration' + file.id
                this.dataMigrationList.push(file)
                this.currentFile = 'dataMigration' + data.id
              }
              addType !== 'noCache' && this.setStatus('FILE', data.codeDetailId)
              addType === 'noCache' && this.$refs.fileTree.setCurrentKey(file.id)
            } else {
              this.treeLeaveType = false
              let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
              this.$DatablauCofirm(text, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                data.type === 15 && (this.migrationObj = JSON.parse(res.data.content))
                if (!this.automaticMode) {
                  this.dataSandboxdList.forEach((item, i) => {
                    if (item.id.toString().indexOf('add') !== -1) {
                      this.dataSandboxdList.splice(i, 1)
                    }
                  })
                } else {
                  this.dataMigrationList.forEach((item, i) => {
                    if (item.id.toString().indexOf('add') !== -1) {
                      this.dataMigrationList.splice(i, 1)
                    }
                  })
                }
                if (this.dataMigrationList.findIndex(item => item.id === data.id) !== -1) {
                  this.currentFile = 'dataMigration' + data.id
                } else {
                  file.tabPanlName = 'dataMigration' + file.id
                  this.dataMigrationList.push(file)
                  this.currentFile = 'dataMigration' + data.id
                }

                addType !== 'noCache' && this.setStatus('FILE', data.codeDetailId)
                addType === 'noCache' && this.$refs.fileTree.setCurrentKey(file.id)
                this.flagType = true
                this.treeLeaveType = true
                this.automaticMode = true
                // this.getDefaultTab()
              }).catch(() => {
                return true
              })
              // }
            }
          } else {
            if (this.flagType !== true || !this.automaticMode) {
              this.treeLeaveType = false
              let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
              this.$DatablauCofirm(text, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                data.type === 15 && (this.migrationObj = JSON.parse(res.data.content))
                if (!this.automaticMode) {
                  this.dataSandboxdList.forEach((item, i) => {
                    if (item.id.toString().indexOf('add') !== -1) {
                      this.dataSandboxdList.splice(i, 1)
                    }
                  })
                } else {
                  this.dataMigrationList.forEach((item, i) => {
                    if (item.id.toString().indexOf('add') !== -1) {
                      this.dataMigrationList.splice(i, 1)
                    }
                  })
                }
                if (this.editFiles.findIndex(item => item.id === data.id) !== -1) { // 由此文件
                  this.currentFile = 'file' + data.id
                } else {
                  file.tabPanlName = 'file' + file.id
                  this.editFiles.push(file)
                  this.currentFile = 'file' + data.id
                }
                addType !== 'noCache' && this.setStatus('FILE', data.codeDetailId)
                addType === 'noCache' && this.$refs.fileTree.setCurrentKey(file.id)
                this.flagType = true
                this.treeLeaveType = true
                this.automaticMode = true
                // this.getDefaultTab()
              }).catch(() => {
                return true
              })
            } else {
              if (this.editFiles.findIndex(item => item.id === data.id) !== -1) { // 由此文件
                this.currentFile = 'file' + data.id
              } else {
                file.tabPanlName = 'file' + file.id
                this.editFiles.push(file)
                this.currentFile = 'file' + data.id
              }
              addType !== 'noCache' && this.setStatus('FILE', data.codeDetailId)
              addType === 'noCache' && this.$refs.fileTree.setCurrentKey(file.id)
            }
          }
        } catch (err) {
          this.$showFailure(err)
        }
      }
      if (data.type === 15) {
        this.migration()
        this.codeTree = {
          currentParentId: data.parentId,
          newFileName: data.name,
          branchName: this.branchName || 'master',
          projectId: this.projectId
        }
      } else {
        this.showDataMigration = false
        this.$store.commit('ddtStore/setCurrentFileType', _.cloneDeep(data))
        this.changeHintWidth(304)
      }
    },
    async workflowNodeClick (data, node) {
      let flag = true
      this.workflowCode = null
      node ? this.createDefinition = false : this.createDefinition = true
      this.refreshWork = !this.refreshWork
      if (this.flagType !== true || !this.automaticMode) {
        let text = this.flagType !== true ? '数据同步正在创建中离开将不保存本页修改，确认要离开吗？' : '建模分析正在创建中离开将不保存本页修改，确认要离开吗？'
        this.$DatablauCofirm(text, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (!this.automaticMode) {
            this.dataSandboxdList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataSandboxdList.splice(i, 1)
              }
            })
          } else {
            this.dataMigrationList.forEach((item, i) => {
              if (item.id.toString().indexOf('add') !== -1) {
                this.dataMigrationList.splice(i, 1)
              }
            })
          }
          if (data.value !== 'dependent') {
            this.$store.commit('ddtStore/setCurrentFileType', {
              type: 0,
              id: null,
              hidRightMenu: true
            })
            this.changeHintWidth(0)
          }
          this.currentType = 'workflow'
          this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
          this.$refs.dataMigrationTree?.setCurrentKey(null)
          this.$refs.fileTree?.setCurrentKey(null)
          this.$refs.dataSandboxd?.setCurrentKey(null)
          if (data.value === 'workflowDefinition') {
            this.showWorkflowDefinition = true
            this.currentFile = 'workflowDefinition'
          } else if (data.value === 'workflowInstance') {
            this.showWorkflowInstance = true
            this.currentFile = 'workflowInstance'
          } else if (data.value === 'dataMigration') {
            this.showDataMigration = true
            // this.currentFile = 'dataMigration'
          }
          this.flagType = true
          this.treeLeaveType = true
          this.automaticMode = true
        }).catch(() => {
          return true
        })
      }
      if (!this.flagType || !this.automaticMode) return
      if (data.value !== 'dependent') {
        this.$store.commit('ddtStore/setCurrentFileType', {
          type: 0,
          id: null,
          hidRightMenu: true
        })
        this.changeHintWidth(0)
      }
      this.currentType = 'workflow'
      this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
      this.$refs.dataMigrationTree?.setCurrentKey(null)
      this.$refs.fileTree?.setCurrentKey(null)
      this.$refs.dataSandboxd?.setCurrentKey(null)
      if (data.value === 'workflowDefinition') {
        this.showWorkflowDefinition = true
        this.currentFile = 'workflowDefinition'
      } else if (data.value === 'workflowInstance') {
        this.showWorkflowInstance = true
        this.currentFile = 'workflowInstance'
      } else if (data.value === 'dataMigration') {
        this.showDataMigration = true
        // this.currentFile = 'dataMigration'
      }
    },
    dataMigrationNodeClick (data, node) {
      this.migration()
      this.$refs.modelCom && this.$refs.modelCom.$refs.modelTree?.setCurrentKey(null)
      this.$refs.workflowTree?.setCurrentKey(null)
      this.$refs.fileTree?.setCurrentKey(null)
      this.bottomDomDis = false
      this.currentType = 'dataMigration'
    },
    verticalDragInit () {
      this.verticalDragDestroy()

      setTimeout(() => {
        if (this.currentType !== 'file' || !this.bottomDraggable) {
          return
        }
        $(this.$refs.verticalMiddleDom).css('bottom', this.bottomDomHeightSave - 5 + 'px')
        $(this.$refs.verticalTopDom).css('bottom', this.bottomDomHeightSave + 'px')
        $(this.$refs.verticalBottomDom).css('height', this.bottomDomHeightSave + 'px')
        this.verticalResizeInstance = new ResizeVertical({
          outerDom: this.$refs.editorWrapper,
          topDom: this.$refs.verticalTopDom,
          bottomDom: this.$refs.verticalBottomDom,
          middleDom: this.$refs.verticalMiddleDom,
          topMinSize: 100,
          bottomMinSize: 120,
          topPadding: 0,
          noCrack: false, // 是否显示拖拽间隔
          onDragEvent: () => {
            this.bottomOndrag()
          },
          callback: () => {
          }
        })
      }, 1000)
    },
    verticalDragDestroy () {
      const defaultHeight = 24
      // 文件类型时, 显示底部 tab 选择按钮
      if (this.currentType === 'file' || this.currentType === 'script') {
        $(this.$refs.verticalTopDom).css('bottom', defaultHeight + 'px')
        $(this.$refs.verticalBottomDom).css('height', defaultHeight + 'px')
      } else {
        $(this.$refs.verticalTopDom).css('bottom', 0 + 'px')
        $(this.$refs.verticalBottomDom).css('height', 0 + 'px')
      }

      this.verticalResizeInstance && this.verticalResizeInstance.destory()
      this.verticalResizeInstance = null
    },
    // main 底部 拖拽过程中, 重置 编辑器底部 tab 高度
    bottomOndrag () {
      this.setVerticalTopDomBottom()
    },
    // 切换底部 tab 的展示, 有 展示和隐藏两个状态
    changeBottomCurrentTab (bottomTab) {
      this.bottomDraggable = !!bottomTab

      this.verticalDragInit()
    },
    // 拖拽 底部tab时, 保存底部 tab 高度
    setVerticalTopDomBottom () {
      const defaultHeight = 24
      let bottomDomHeightSave = parseInt($(this.$refs.verticalTopDom).css('bottom'))
      this.bottomDomHeightSave = isNaN(bottomDomHeightSave) ? defaultHeight : bottomDomHeightSave
      // $(this.$refs.verticalTopDom).css('bottom', defaultHeight + 'px')
    },
    getProjectDetail () {
      HTTP.getDsProjectDetail(this.projectId)
        .then(data => {
          this.dsId = data.dsProjectCode || ''
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  }
}
