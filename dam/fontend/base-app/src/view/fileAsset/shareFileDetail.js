import paneMenu from '@/view/dataService/paneMenu.vue'
// import paneAccess  from '@/view/dataService/paneAccess.vue';
import fieldTitle from '@/view/dataProperty/meta/fieldTitle.vue'
import shareFileUdpEdit from '@/view/dataProperty/meta/shareFileUdpEdit.vue'
// import viewCode from './viewCode.vue';
// import quoto from './quoto.vue';
// import version from './version.vue';
// import agTableComponent from '@/components/common/agTableComponent.vue'
export default {
  props: [
    'fileData',
    'frontEnd',
    // 'udps',
    // 'serviceType',
    // 'serviceId'
  ],
  components: {
    // paneMenu,
    // paneAccess,
    fieldTitle,
    shareFileUdpEdit,
    // viewCode,
    // quoto,
    // version,
    // agTableComponent
  },
  data() {
    return {
      hasAccess: this.$isAdmin,
      // fileDataResult:null,
      activeTab: 'detail',
      definitionEditing: false,
      definitionSaving: false,
      definition: '',
      // definitionSaving: false,
      fileDataResult: null,

      // old
      udpKeyValueMap: {},
      code: '',
      codeDialogVisible: false,

      isEditing: false,
      currentEditKey: null,
      currentEditValue: '',
      columnDefs: null,
      rowData: null,
      tagsBefore: null,
      statusMap: {
        APPLYING: '申请中',
        SUBMITTING: '未提交',
        REJECTED: '已拒绝',
        SUCCESS: '已批准',
        EXPIRED: '已过期',
      },
    }
  },
  beforeMount() {
    if (this.frontEnd) {
      this.dataInit()
    }

    // this.columnDefs = [
    //   {
    //     headerName: '',
    //     minWidth:50,
    //     width:30,
    //     cellRenderer:node=>{
    //       return node.rowIndex+1
    //     }
    //   },
    //   {
    //     headerName: '调用单位',
    //     field: 'i0',
    //     minWidth: 120,
    //     sortable: true,
    //   },{
    //     headerName: '调用系统',
    //     field: 'i1',
    //     tooltipField: 'i1',
    //     minWidth: 120,
    //     sortable: true,
    //   },{
    //     headerName: '调用次数',
    //     field: 'i2',
    //     tooltipField: 'i2',
    //     minWidth: 120,
    //     sortable: true,
    //   },{
    //     headerName: '调用频率',
    //     field: 'i3',
    //     tooltipField: 'i3',
    //     minWidth: 120,
    //     sortable: true,
    //   },{
    //     headerName: '首次调用时间',
    //     field: 'i4',
    //     minWidth: 120,
    //     sortable: true,
    //   },{
    //     headerName: '最近调用时间',
    //     field: 'i5',
    //     minWidth: 120,
    //     sortable: true,
    //   }

    //   ];
    // this.rowData = [
    //   {
    //     i0:'中信集团',
    //     i1:'产品交易',
    //     i2:'29',
    //     i3:'1次/天',
    //     i4:'1992-12-13',
    //     i5:'2019-11-07',
    //   },{
    //     i0:'中信集团',
    //     i1:'BI',
    //     i2:'40',
    //     i3:'1次/天',
    //     i4:'1992-12-13',
    //     i5:'2019-11-07',
    //   },{
    //     i0:'中信集团',
    //     i1:'BI',
    //     i2:'100',
    //     i3:'8次/天',
    //     i4:'1992-12-13',
    //     i5:'2019-11-07',
    //   },{
    //     i0:'中信集团',
    //     i1:'个性化推荐',
    //     i2:'80',
    //     i3:'5次/天',
    //     i4:'1992-12-13',
    //     i5:'2019-11-07',
    //   },
    // ];
    // if(this.serviceId){
    //   if(this.frontEnd){
    //     this.$http.put(this.$url + `/service/citic-data-service/${this.serviceId}/nums`).then(res=>{

    //     }).catch(e=>{

    //     }).then(()=>{
    //       this.$http.get(this.$url + '/service/citic-data-service/').then(res=>{
    //         res.data.forEach(item=>{
    //           if(item.dataServiceId === this.serviceId){
    //             this.fileDataResult = item;
    //           }
    //         })
    //       })
    //     });
    //   }else{
    //     this.$http.get(this.$url + '/service/citic-data-service/').then(res=>{
    //       res.data.forEach(item=>{
    //         if(item.dataServiceId === this.serviceId){
    //           this.fileDataResult = item;
    //         }
    //       })
    //     })
    //   }

    // }
  },
  mounted() {
    // if(this.data){
    //   if(this.frontEnd){
    //     this.$http.put(this.$url + `/service/citic-data-service/${this.data.dataServiceId}/nums`).then(res=>{
    //     }).catch(e=>{
    //     }).then(()=>{
    //       this.innerLoadStandardDetails();
    //     });
    //   }else{
    //     this.innerLoadStandardDetails();
    //   }
    //   this.getTagsBefore(this.data.dataServiceId);
    // }else if(this.serviceId){
    //   this.getTagsBefore(this.serviceId);
    // }
    // if(this.frontEnd){
    //   setTimeout(()=>{
    //     $('.citic-scan').parent().css('left',0);
    //   })
    // }
  },
  beforeDestroy() {
    $(this.$el).off('mousein')
    $(this.$el).off('scroll')
  },
  methods: {
    dataInit() {
      const id = this.fileData ? this.fileData.id : ''
      // console.log(this.fileData, 'this.fileData')
      if (id && (this.frontEnd || !this.fileData.name)) {
        const url = `${this.$url}/service/shareFile/folder/${id}`
        this.$http
          .get(url)
          .then(res => {
            this.fileDataResult = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.fileDataResult = this.fileData
      }
    },
    handleDefinitionEdit() {
      if (!this.contentWritable) {
        return
      }
      this.definitionEditing = true
      this.definition = this.fileDataResult.description
      setTimeout(() => {
        $(this.$refs.definition.$el).find('input').focus()
      })
    },

    saveDefinition() {
      this.definitionSaving = true
      const url = `${this.$url}/service/shareFile/folder`
      const description = this.definition || ''
      const body = _.cloneDeep(this.fileDataResult)
      body.description = description
      this.$http
        .post(url, body)
        .then(res => {
          this.fileDataResult.description = description
          this.definition = description
          this.definitionEditing = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.definitionSaving = false
        })
    },
    // old
    handleUpdateTags(tags) {
      this.tagsBefore = tags
    },
    getTagsBefore(serviceId) {
      const url =
        this.$url +
        `/service/tags/getTagsOfItem?itemId=${serviceId}&withoutCategory=true&type=${this.$commentPreCode.Service}`
      this.$http
        .get(url)
        .then(res => {
          this.tagsBefore = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showDetail(data) {
      const ifOpenNewPage = true
      const query = {
        objectId: this.data.objectId,
        keyword: this.keyword,
        catalogPath: this.catalogPath,
        type: this.data.type,
      }
      if (query.objectId) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            `myItem?objectId=${this.data.objectId}&keyword=${this.keyword}&catalogPath=${this.catalogPath}&type=${this.data.type}`
        )
      }
      if (this.data.domainId) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            `domain?domainId=${this.data.domainId}&vote=${this.data.vote}`
        )
      }
      if (data.dataReportType) {
        if (ifOpenNewPage) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          // window.open(baseUrl + `/reportForm?reportId=${data.id}&vote=${this.data.vote}`);
          window.open(
            baseUrl + `reportForm?reportId=${data.id}&keyword=${this.keyword}`
          )
        } else {
          const query = {
            reportId: data.id,
            type: 'Report',
            keyword: this.keyword,
          }
          this.$router.push({
            name: 'reportForm',
            query: query,
          })
        }
      }
      if (data.serviceId) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl +
            `myService/?objectId=${this.data.serviceId}&catalogPath=${this.catalogPath}`
        )
      }
    },
    scanAsset(row) {
      if (row.type === 80010066) {
        // domain
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + `domain?domainId=${row.id}`)
      } else if (row.type === 80000004) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 1)
        window.open(
          baseUrl + `myItem?objectId=${row.id}&keyword=&catalogPath=&type=TABLE`
        )
      } else if (row.type === 82800005) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + `myService/?objectId=${row.id}`)
      }
    },
    ldmTypesFormatter(row) {
      return this.$ldmTypes[row.type]
    },
    citicApplyData() {
      const serviceType = [
        'DIRECT_ACCESS',
        'OPEN_API',
        'DIRECT_DOWNLOAD',
        'ODS_PATCH_SWAP',
      ]
      this.$bus.$emit('addShareApplication', [
        {
          type: 'SERVICE',
          name: this.fileDataResult.name,
          id: this.fileDataResult.dataServiceId,
          serviceType: serviceType,
        },
      ])
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      this.$refs.versionsTable.sizeColumnsToFit()
    },
    goBack() {
      if (this.frontEnd) {
        window.close()
      } else {
        this.$emit('back')
      }
      this.$emit('close', {
        route: this.$route.name,
      })
    },
    handleEdit() {
      this.$emit('editCurrent')
    },

    handleForceUpdate() {
      const url =
        this.$url +
        '/service/domains/' +
        this.fileDataResult.domainId +
        '/newVersion?forceCreate=true'
      this.$http
        .post(url)
        .then(res => {
          this.$emit('goToUpdate', res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(res => {})
    },
    handleSave() {},
    innerLoadStandardDetails() {
      const fileDataResult = _.clone(this.data)
      fileDataResult.relatedAssets = []
      this.data.relatedAssets.forEach(item => {
        if (item.type !== Number.parseInt(this.$commentPreCode.Service)) {
          fileDataResult.relatedAssets.push(item)
        }
      })

      this.fileDataResult = fileDataResult
    },
    viewCode(code) {
      this.code = code
      this.codeDialogVisible = true
    },
    handleStateChange(state) {
      const domainId = this.data.id
      this.$http
        .put(
          this.$url +
            `/service/domains/${domainId}/states/${this.fileDataResult.state}`
        )
        .then(res => {
          this.$message.success('状态切换成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTabClick() {},
  }, // End of methods,
  watch: {
    fileData: {
      deep: true,
      handler: function (newVal, oldVal) {
        // console.log(newVal, 'newVal')
        if (!this.frontEnd) {
          this.dataInit()
        }
      },
      immediate: true,
    },
  },
  computed: {
    pathArr() {
      let arr = this.fileDataResult ? this.fileDataResult.path : ''
      arr = arr.split('/')
      arr.pop()
      if (!arr || !Array.isArray(arr)) {
        arr = []
      }
      return arr
    },
    contentWritable() {
      return this.hasAccess
    },
    // detailStateFirst(){
    //   let state = this.fileDataResult.state;
    //   return state==='A' || state==='V';
    // },
    // detailStateLast(){//开发、废弃
    //   let state = this.fileDataResult.state;
    //   return state==='D' || state==='X';
    // },
    // writable(){
    //   return /*(this.detailStateLast) && */this.hasAccess;
    // }
  },
}
