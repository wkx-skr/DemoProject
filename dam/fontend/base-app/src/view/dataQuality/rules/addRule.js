import editCate from '../editCate.vue'
import sectionLabel from '../components/sectionLabel.vue'
import description from '../components/description.vue'
import Status from './Status'
import HTTP from '@/http/main'
export default {
  components: {
    editCate,
    sectionLabel,
    description,
    Status,
  },
  props: [
    'ruleData',
    'allCategories',
    'catalogStr',
    'addState',
    'rowList',
    'currentCategory',
    'treeRawData',
    'auth',
  ],
  data() {
    this.catalogUrl = this.$url + '/service/categories/'
    return {
      writable: this.ruleData ? this.ruleData.directEdit : true,
      ruleContent: {
        writable: true,
        // state: 0,
        priority: 1,
        category: 0,
        catalog: this.currentCategory ? [this.currentCategory] : '',
        catalogArr: [],
        // modelCategoryIds: '',modelCategoryIds
        businessType: '',
        bms: '',
        orgBm: '',
      },
      selectedTable: '',
      currentParentId: 0,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('quality.page.dataQualityRules.rules.name1'),
            trigger: 'blur',
          },
          {
            max: 128,
            message: this.$t('quality.page.dataQualityRules.rules.name2'),
            trigger: 'change',
          },
        ],
        catalog: [
          {
            required: true,
            message: this.$t('quality.page.dataQualityRules.rules.catalog'),
            trigger: 'change',
          },
        ],
        category: [
          {
            required: true,
            message: this.$t('quality.page.dataQualityRules.rules.catalog'),
            trigger: 'change',
          },
        ],
        bms: [
          {
            required: true,
            message:
              this.$t('system.user.organization') +
              this.$t('system.user.validator.notEmpty'),
            trigger: 'change',
          },
        ],
      },
      checkedmodelCategoryIds: [],
      editCategoryVisible: false,
      ruleCategories: [],
      // defaultProps:{
      //   value:'name',
      //   label:'name',
      //   children:'subNodes'
      // },
      options: [],
      diaData: {},
      optionProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
        checkStrictly: true,
      },
      tableData: [],
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      nameMapping: {},
      systemList: [],
      originFormStr: '',
      baseCategoryIds: '',
      queryArr: [],
      businessTypeList: [],
      organizationList: null,
      defaultPara: {
        bigClassSelectOption: '',
        bizTypeSelectOption: '',
        creator: '',
        currentPage: 1,
        endTime: '',
        keyword: '',
        modelCategoryId: '',
        pageSize: 20,
        publicState: null,
        smallClassSelectOption: '',
        startTime: '',
        state: '',
      },
      relTechRules: [],
    }
  },
  created() {
    this.loadQualityJobs()
  },
  mounted() {
    if (this.ruleData) {
      this.baseCategoryIds = JSON.parse(
        JSON.stringify(this.ruleData)
      ).modelCategoryIds
      if (typeof this.ruleData.catalog == 'string') {
        this.ruleData.catalog = JSON.parse(this.ruleData.catalog)
      }
      this.ruleContent = _.clone(this.ruleData)
      this.getOrganizationList()
      this.originFormStr = JSON.stringify(this.ruleContent)
      this.systemList = this.$modelCategories
      this.getAssignedData()
    }
    if (this.addState) {
      let newRowList
      newRowList = this.rowList.slice(0, this.rowList.length - 1)
      this.ruleContent.catalog = newRowList.reverse()
      if (this.auth === false) {
        this.ruleContent.catalog = []
      }
    }
    // if (this.addState) {
    //   this.ruleContent.catalog = this.catalogStr
    // }
    this.getCatalogs()
    this.getBigClassListAndBusinessTypeList()
    this.getQuery()
  },
  filters: {
    systemFilter(id, systemList) {
      let result = ''
      systemList.forEach(e => {
        if (e.categoryId === id) {
          result = e.categoryName
        }
      })
      return result
    },
  },
  methods: {
    loadQualityJobs() {
      const para = _.clone(this.defaultPara)
      para.buRuleId = this.ruleData.id
      this.$http
        .post(`${this.$quality_url}/quality/rules/tech/page`, para)
        .then(res => {
          console.log(res, 'res')
          this.relTechRules = res.data.ruleList
        })
        .catch(e => {
          this.relTechRules = []
          this.$showFailure(e)
        })
    },
    getOrganizationList() {
      if (!this.ruleContent.orgBm) {
        this.$set(this.ruleContent, 'bms', '')
      }
      /* HTTP.getOrgDetailByBm(this.ruleContent.orgBm).then(res => {
        this.$set(this.ruleContent, 'bms', res.data.fullName)
      }) */
      HTTP.getOrgDetailByBms([this.ruleContent.orgBm]).then(res => {
        this.$nextTick(() => {
          if (res.data.length > 0) {
            this.$set(this.ruleContent, 'bms', res.data[0].fullName)
          } else {
            this.$set(this.ruleContent, 'bms', '')
          }
        })
      })
    },
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        this.ruleContent.orgBm = res.bm
        this.getOrganizationList()
      })
    },
    getQuery() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          this.queryArr = res.data
          if (res.data.length > 0) {
            if (!this.ruleData) {
              this.ruleContent.category = res.data[0].id
            }
          } else {
            this.$message.warning({
              message: this.$t(
                'quality.page.dataQualityRules.rules.noTypeTips'
              ),
              showClose: true,
              duration: 0,
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchQuery(id) {
      let name = ''
      this.queryArr.forEach(element => {
        if (element.id == id) {
          name = element.optionValue
        }
      })
      return name
    },
    stateChange(val) {
      if (val === 0 && this.ruleData && this.ruleData.directEdit) {
        this.$DatablauCofirm(
          this.$t('quality.page.dataQualityRules.confirm.stateMsg'),
          this.$t('quality.page.dataQualityRules.confirm.stateTitle'),
          {
            type: 'warning',
          }
        )
          .then(() => {
            this.ruleContent.state = 0
          })
          .catch((this.ruleContent.state = 1))
      }
    },
    getBigClassListAndBusinessTypeList() {
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/select/option/get`, {
            category: 'TR',
            names: ['业务类型'],
          })
          .then(res => {
            const typeList = res.data.filter(e => e.optionName === '业务类型')
            typeList.forEach(e => {
              const typeObj = {
                lable: e.optionValue,
                value: e.optionValue,
              }
              this.businessTypeList.push(typeObj)
            })
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    addEdit(buRule) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl + `main/dataQuality/qualityRule?id=${buRule.id}`,
        '_blank'
      )
    },
    getPeopleName(list) {
      return list.map(e => this.nameMapping[e]).toString()
    },
    getAssignedData() {
      this.$http
        .post(this.$quality_url + '/quality/rules/tech/page', {
          currentPage: 1,
          pageSize: 20,
          buRuleId: this.ruleData.id.toString(),
          bigClassSelectOption: '',
          bizTypeSelectOption: '',
          creator: '',
          endTime: '',
          keyword: '',
          modelCategoryId: '',
          smallClassSelectOption: '',
          startTime: '',
          // state: '',
        })
        .then(res => {
          this.tableData = res.data.ruleList
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleChangeCatalog(value) {
      // this.ruleContent.catalog = value
      //   .map(function (obj, index) {
      //     return obj
      //   })
      //   .join('/')
    },
    createCate(newCate) {
      this.createCategory(newCate)
    },
    removeCate(cate) {
      this.deleteCategory(cate)
    },
    showEditDia() {
      this.$refs.editDialog.showCataDia()
    },
    deleteCategory(cate) {
      const url = this.$quality_url + '/categories/'
      this.$http
        .delete(url + cate.categoryId)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRules.successfullyDeleted')
          )
          this.getCatalogs()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    createCategory(newName) {
      const url = this.$quality_url + '/categories/'
      const para = {
        type: 'QUALITY_RULE',
      }
      if (!newName) return
      para.name = newName
      this.$http
        .post(url, para)
        .then(res => {
          // this.$message.success('目录创建成功');
          this.getCatalogs()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addAttr(data) {
      for (var j = 0; j < data.length; j++) {
        if (data[j].auth < 17) {
          data[j].disabled = true
        }
        if (data[j].subNodes && data[j].subNodes.length > 0) {
          this.addAttr(data[j].subNodes)
        } else {
          delete data[j].subNodes
        }
      }
      return data
    },
    getCatalogs() {
      this.options = []
      this.$utils.sort.sortConsiderChineseNumber(
        this.treeRawData.subNodes,
        'name',
        'ascending',
        true
      )
      this.options = _.cloneDeep(this.treeRawData.subNodes)
      this.options = this.addAttr(this.options)
    },
    confirmAddRule(type) {
      this.$refs.ruleForm.validate(valid => {
        if (!valid) {
          return false
        } else {
          // if (!this.options.includes(this.ruleContent.catalog)) { // 创建目录
          //   this.createCategory(this.ruleContent.catalog)
          // }
          // this.ruleContent.catalog = this.ruleContent.catalogArr.join(' / ');
          if (this.ruleData) {
            // update
            let old = this.baseCategoryIds && this.baseCategoryIds.split(',')
            let news = this.checkedmodelCategoryIds
            let num = 0
            old &&
              old.forEach(o => {
                if (news.includes(Number(o))) {
                  num++
                }
              })
            if (old && num < old.length) {
              this.$DatablauCofirm(
                this.$t('quality.page.dataQualityRules.confirm.systemMsg'),
                this.$t('quality.page.dataQualityRules.confirm.deleteSystem'),
                {
                  type: 'warning',
                }
              )
                .then(() => {
                  this.handleSave(type)
                })
                .catch(() => {
                  // this.checkedmodelCategoryIds = this.baseCategoryIds.split(',')
                  this.checkedmodelCategoryIds = this.baseCategoryIds
                    .split(',')
                    .map(item => {
                      return item - 0
                    })
                })
            } else {
              this.handleSave(type)
            }
          } else {
            // add
            const self = this
            self.ruleContent.uniCategoryId =
              self.ruleContent.catalog[self.ruleContent.catalog.length - 1]
            self.ruleContent.catalog = JSON.stringify(self.ruleContent.catalog)
            if (type && type === 'publish') {
              self.ruleContent.state = 'A'
            }
            const rules = [self.ruleContent]
            self.$http
              .post(this.$quality_url + '/quality/rules/bu', rules)
              .then(res => {
                self.$message.success(
                  self.ruleContent.name +
                    this.$t('quality.page.dataQualityRules.createdSuccessfully')
                )
                self.$bus.$emit('reloadQualityRules')
                self.removeAddRule()
              })
              .catch(e => {
                if (typeof this.ruleContent.catalog == 'string') {
                  this.ruleContent.catalog = JSON.parse(
                    this.ruleContent.catalog
                  )
                }
                this.$showFailure(e)
              })
          }
        }
      })
    },
    handleSave(type) {
      const self = this
      self.ruleContent.uniCategoryId =
        self.ruleContent.catalog[self.ruleContent.catalog.length - 1]
      self.ruleContent.catalog = JSON.stringify(self.ruleContent.catalog)
      if (this.$isShort && type && type === 'publish') {
        self.ruleContent.state = 'A'
      }
      const rule = self.ruleContent
      if (
        this.ruleContent.copyId ||
        this.ruleContent.state !== 'A' ||
        this.$isShort
      ) {
        if (this.ruleContent.level === 1) {
          self.$http
            .put(
              this.$quality_url + '/quality/rule/bu/' + this.ruleData.id,
              rule
            )
            .then(res => {
              self.$message.success(
                self.ruleContent.name +
                  this.$t('quality.page.dataQualityRules.successfullyModified')
              )
              self.$bus.$emit('reloadQualityRules')
              this.writable = false
              this.$emit('updateCurrentTab', this.ruleContent)
              this.$bus.$emit('cancel')
              // self.removeEditRule();
            })
            .catch(e => {
              if (typeof this.ruleContent.catalog == 'string') {
                this.ruleContent.catalog = JSON.parse(this.ruleContent.catalog)
              }
              this.$showFailure(e)
            })
        } else {
          self.$http
            .post(`${this.$quality_url}/quality/rule/bu/updateCopy`, rule)
            .then(res => {
              self.$message.success(
                self.ruleContent.name +
                  this.$t('quality.page.dataQualityRules.successfullyModified')
              )
              self.$bus.$emit('reloadQualityRules')
              this.writable = false
              this.$emit('updateCurrentTab', this.ruleContent)
              this.$bus.$emit('cancel')
            })
            .catch(e => {
              if (typeof this.ruleContent.catalog == 'string') {
                this.ruleContent.catalog = JSON.parse(this.ruleContent.catalog)
              }
              this.$showFailure(e)
            })
        }
      } else {
        const obj = {
          businessRuleId: this.ruleData.id,
          processState: 'A_TO_A',
          businessRule: this.ruleContent,
        }
        this.$http
          .post(this.$quality_url + '/quality/rule/bu/createUpdateCopy', obj)
          .then(res => {
            self.$message.success(
              self.ruleContent.name +
                this.$t('quality.page.dataQualityRules.successfullyModified')
            )
            self.$bus.$emit('reloadQualityRules')
            this.writable = false
            this.$emit('updateCurrentTab', this.ruleContent)
            this.$bus.$emit('cancel')
            // self.removeEditRule();
          })
          .catch(e => {
            if (typeof this.ruleContent.catalog == 'string') {
              this.ruleContent.catalog = JSON.parse(this.ruleContent.catalog)
            }
            this.$showFailure(e)
          })
      }
    },
    removeAddRule() {
      if (this.ruleData) {
        if (JSON.stringify(this.ruleContent) !== this.originFormStr) {
          this.$DatablauCofirm(
            this.$version.ruleTemplate.tell.isGiveUp,
            this.$version.ruleTemplate.tell.info,
            {
              confirmButtonText: this.$version.ruleTemplate.name.confirm,
              cancelButtonText: this.$version.ruleTemplate.name.cancel,
              type: 'warning',
            }
          )
            .then(() => {
              this.removeEditRule()
            })
            .catch(() => {})
        } else {
          this.removeEditRule()
        }
      } else {
        this.$bus.$emit('removeAddRule')
      }
    },
    removeEditRule() {
      this.$bus.$emit('removeEditRule', this.ruleData.name)
    },
    querySearch(queryString, cb) {
      const restaurants = this.options
      const results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) ===
          0
        )
      }
    },
  },
}
