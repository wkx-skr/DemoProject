export default {
  data() {
    return {
      colorArr: {
        80010000: '#FBD6A6',
        82800002: '#F8DD6C',
        82800010: '#F8976C',
        82800009: '#F86C6C',
        82800017: '#F86C9F',
        82800012: '#CF4BD5',
        82800016: '#9663F3',
        80010001: '#A77CF8',
        80010066: '#7C8BF8',
        80010098: '#5DABFF',
        80000004: '#F86C6C',
        80000005: '#849FCA',
        82800008: '#3397FF',
      },
      typeNameArr: {
        // '82800013': '数据字典',
        80010000: this.$t('meta.common.sourceType.tag'),
        82800002: this.$t('meta.common.sourceType.report'),
        82800010: this.$t('meta.common.sourceType.user'),
        // 82800009: this.$t('meta.common.sourceType.meta'),
        82800017: this.$t('meta.common.sourceType.busiRule'),
        82800012: this.$t('meta.common.sourceType.appSystem'),
        82800016: this.$t('meta.common.sourceType.techRule'),
        80010001: this.$t('meta.common.sourceType.dataSource'),
        80010066: this.$t('meta.common.sourceType.dataStandard'),
        80010098: this.$t('meta.common.sourceType.standardCode'),
        80000004: this.$t('meta.common.sourceType.table'),
        80000005: this.$t('meta.common.sourceType.column'),
        80010118: this.$t('meta.common.sourceType.storedProcedure'),
        80010119: this.$t('meta.common.sourceType.function'),
        82800003: this.$t('meta.common.sourceType.index'),
        80500008: this.$t('meta.common.sourceType.view'),
        82800018: this.$t('meta.common.sourceType.ownershipDepartment'),
        82800015: this.$t('meta.common.sourceType.lineage'),
        // 82800019: this.$t('meta.common.sourceType.API'),
        60010077: this.$t('meta.common.sourceType.catlog'),
        60010076: this.$t('meta.common.sourceType.assetCatlog'),
        82800020: this.$t('meta.common.sourceType.synonym'),
        82800024: this.$t('meta.common.sourceType.package'),
        82800023: this.$t('meta.common.sourceType.dim'),
        82800031: this.$t('meta.common.sourceType.dimLevel'),
        82800008: this.$t('meta.common.sourceType.file'),
        82800032: '修饰类型',
        82800033: '时间周期类型',
        82800034: '修饰词',
        82800035: '时间周期',
      },
      /* edgesColorArr: {
       标签: '#4D86E0',
       拥有: '#E198B4',
       字段: '#B44C97',
       创建: '#93CA76',
       技术负责人: '#85A452',
       业务负责人: '#BF794E',
       包含: '#9079AD',
       数据标准: '#38B48B',
       所有者: '#8491C3',
       引用: '#E49E61',
       关联: '#CBB994',
       权属部门: '#EE827C',
       数据管家: '#A88462',
       绑定: '#A3A3A2',
       数据来源: '#80ABA9',
       派生: '#C5C56A',
       目录: '#888084',
       同义词: '#7BB15D',
       层级: '#CA8FDE',
       映射: '#81D3F0',
     }, */
    }
  },
  methods: {
    edgesColorArr(value) {
      switch (value) {
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.tag'):
          return '#4D86E0'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.has'):
          return '#E198B4'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.column'):
          return '#B44C97'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.create'):
          return '#93CA76'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.techLeader'):
          return '#85A452'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.busiLeader'):
          return '#BF794E'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.include'):
          return '#9079AD'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.dataStandard'):
          return '#38B48B'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.owner'):
          return '#8491C3'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.quote'):
          return '#E49E61'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.relation'):
          return '#CBB994'
        case this.$t(
          'meta.DS.tableDetail.knowledgeGraph.edges.ownershipDepartment'
        ):
          return '#EE827C'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.dataSteward'):
          return '#A88462'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.bound'):
          return '#A3A3A2'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.dataSource'):
          return '#80ABA9'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.derive'):
          return '#C5C56A'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.catlog'):
          return '#888084'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.synonym'):
          return '#7BB15D'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.level'):
          return '#CA8FDE'
        case this.$t('meta.DS.tableDetail.knowledgeGraph.edges.mapping'):
          return '#81D3F0'
      }
    },
  },
}
