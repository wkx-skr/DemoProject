<template>
  <div class="edit-business-object">
    <div class="breadcrumb-wrapper">
      <datablau-breadcrumb
        :node-data="breadcrumbData"
        @back="handleCancel"
      ></datablau-breadcrumb>
    </div>
    <datablau-form-submit class="edit-business-obj-content">
      <div class="content">
        <datablau-form
          v-loading="loading"
          label-width="190px"
          :model="createForm"
          ref="createForm"
          class="edit-obj-form"
          :rules="rules"
        >
          <div class="top-hint">基本信息</div>
          <!--目录-->
          <el-form-item label="目录" prop="subjectId">
            <!--<datablau-select-->
            <!--  v-model="createForm.subjectId"-->
            <!--&gt;-->
            <!--  <el-option-->
            <!--    v-for="item in categoryList"-->
            <!--    :key="item.value"-->
            <!--    :label="item.label"-->
            <!--    :value="item.value"-->
            <!--  ></el-option>-->
            <!--</datablau-select>-->
            <!--<datablau-input-->
            <!--  v-model="createForm.subjectName"-->
            <!--  :disabled="true"-->
            <!--  v-if="editModel"-->
            <!--&gt;-->
            <!--</datablau-input>-->
            <datablau-cascader
              expand-trigger="click"
              :options="categoryList"
              :props="cascaderProps"
              :change-on-select="true"
              :emit-path="false"
              filterable
              ref="pathCascader"
              v-model="createForm.subjectId"
            ></datablau-cascader>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <datablau-input
              v-model="createForm.name" placeholder="请输入" clearable maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item label="简称" prop="abbreviation">
            <datablau-input
              v-model="createForm.abbreviation" placeholder="请输入" clearable
              maxlength="100" show-word-limit
            ></datablau-input>
          </el-form-item>
<!--          <el-form-item label="编码" prop="code">
            <datablau-input
              :disabled="editModel" v-model="createForm.code" placeholder="请输入"
              clearable maxlength="100" show-word-limit
            ></datablau-input>
          </el-form-item>-->
          <el-form-item label="英文名称">
            <datablau-input
              v-model="createForm.alias" placeholder="请输入" clearable maxlength="100"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item label="业务定义" prop="definition" >
            <datablau-input
              type="textarea" v-model="createForm.definition" placeholder="请输入"
              maxlength="200"
              clearable
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item label="数据概念" prop="subjectTag">
            <datablau-select
              v-model="createForm.subjectTag"
              clearable
              filterable
              allow-create
              maxlength="100"
            >
              <el-option
                v-for="item in themeList"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            label=""
            v-for="(udp, index) in udps.filter(
                  e => e.catalog === '基本信息'
                )"
            :key="`base_${index}`"
            :prop="udp.propertyId + ''"
            class="udp-form-item"
            label-width="0"
          >
            <udp-form-label
              :content="`${udp.name}`"
              :strWidth="190"
              :showModel="false"
              :showRequired="!!udp.required"
            ></udp-form-label>
            <datablau-input
              v-if="udp.dataType === 'String'"
              type="textarea"
              :autosize="{ minRows: 2 }"
              v-model="additionalPropertiesObj[udp.propertyId]"
              :placeholder="$version.domain.placeholder.property"
              class="udp-form-edit-item"
            ></datablau-input>
            <datablau-select
              v-if="Array.isArray(udp.candidates) && udp.dataType === 'List'"
              v-model="additionalPropertiesObj[udp.propertyId]"
              :placeholder="$version.domain.placeholder.property"
              class="udp-form-edit-item"
            >
              <el-option
                v-for="item in udp.candidates"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <div class="top-hint">管理信息</div>

          <el-form-item label="目的">
            <datablau-input v-model="createForm.purpose" placeholder="请输入" clearable maxlength="100"
                            show-word-limit></datablau-input>
          </el-form-item>
          <el-form-item label="范围">
            <datablau-input v-model="createForm.scope" placeholder="请输入" clearable maxlength="100"
                            show-word-limit></datablau-input>
          </el-form-item>
          <el-form-item label="包含">
            <datablau-input v-model="createForm.include" placeholder="请输入" clearable maxlength="100"
                            show-word-limit></datablau-input>
          </el-form-item>
          <el-form-item label="不包含">
            <datablau-input v-model="createForm.exclude" placeholder="请输入" clearable maxlength="100"
                            show-word-limit></datablau-input>
          </el-form-item>

          <el-form-item
            label=""
            v-for="(udp, index) in udps.filter(
                  e => e.catalog === '管理信息'
                )"
            :key="`manage_${index}`"
            :prop="udp.propertyId + ''"
            class="udp-form-item"
            label-width="0"
          >
            <!--注意：需要搭配 样式：.el-form-item__error-->
            <udp-form-label
              :content="`${udp.name}`"
              :strWidth="190"
              :showModel="false"
              :showRequired="!!udp.required"
            ></udp-form-label>
            <datablau-input
              v-if="udp.dataType === 'String'"
              type="textarea"
              :autosize="{ minRows: 2 }"
              v-model="additionalPropertiesObj[udp.propertyId]"
              :placeholder="$version.domain.placeholder.property"
              class="udp-form-edit-item"
            ></datablau-input>
            <datablau-select
              v-if="Array.isArray(udp.candidates) && udp.dataType === 'List'"
              v-model="additionalPropertiesObj[udp.propertyId]"
              :placeholder="$version.domain.placeholder.property"
              class="udp-form-edit-item"
            >
              <el-option
                v-for="item in udp.candidates"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </datablau-form>
      </div>
      <template slot="buttons">
        <datablau-button type="primary" @click="handleSubmit">
          确 定
        </datablau-button>
        <datablau-button @click="handleCancel">取 消</datablau-button>
      </template>
    </datablau-form-submit>
    <!--<datablau-dialog-->
    <!--  :visible.sync="dialogVisible"-->
    <!--  custom-class="theme-create-form2"-->
    <!--  :title="editModel ? '编辑对象' : '添加对象'"-->
    <!--  width="640px"-->
    <!--  height="490"-->
    <!--  append-to-body-->
    <!--  :before-close="handleClose"-->
    <!--&gt;-->

    <!--</datablau-dialog>-->
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import udpFormLabel from '@/views/archy/enterpriseLogicalModel/udpFormLabel.vue'
import DatablauSelect from '@components/basic/select/DatablauSelect'

export default {
  name: 'editBusinessObj',
  data () {
    return {
      breadcrumbData: [],
      dialogVisible: false,
      defaultForm: {
        subjectId: '', // category 目录
        subjectTag: '', // 主题标签
        name: '',
        code: '',
        alias: '',
        definition: '',
        purpose: '',
        scope: '',
        include: '',
        exclude: '',
        abbreviation: ''
      },
      createForm: {},
      submitForm: null,
      cascaderProps: {
        checkStrictly: true,
        emitPath: false,
        value: 'id',
        label: 'name',
        disabled: 'disabledCascader',
        children: 'children'
      },
      themeList: [],
      loading: false,
      rules: {
        name: [
          { required: true, message: '请输入对象名称', trigger: 'blur' }
        ],
        subjectId: [
          {
            required: true,
            trigger: 'change',
            validator: this.testCategory
          }
        ]
        // code: [
        //   { required: true, message: '请输入对象编码', trigger: 'blur' }
        // ]
        // subjectId: [
        //   { required: true, message: '请选择主题', trigger: 'blur' }
        // ]
      },
      additionalPropertiesObj: {}, // udp
      categoryMap: {},
      dataInitFinish: false, // 判断初始化是否完成
      valueChange: false, // 初始化完成后， 数据是否有修改
      categoryList: []
    }
  },
  props: {
    editModel: {
      type: Boolean,
      default: true
    },
    currentCategoryId: {
      required: true
    },
    oldData: {
      default () {
        return {}
      }
    },
    udps: {
      type: Array,
      required: true
    }
  },
  components: {
    udpFormLabel
  },
  computed: {
    couldSave () {
      let bool = true
      // 必填项需要填
      let props = ['name', 'code']
      props.forEach(key => {
        if (!this.createForm[key]) {
          bool = false
        }
      })
      let category = this.categoryMap[this.createForm.subjectId]
      if (!category || category.level !== 3) {
        bool = false
      }
      // 自定义属性中的必填项也需要填
      this.udps.forEach(udp => {
        if (udp.required && !this.additionalPropertiesObj[udp.propertyId]) {
          bool = false
        }
      })
      return bool
    }
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.getAllModelTheme()

      this.createForm = _.cloneDeep(this.defaultForm)
      if (this.editModel) {
        Object.keys(this.oldData).forEach(key => {
          this.createForm[key] = this.oldData[key]
        })
      } else {
        this.createForm.subjectId = this.currentCategoryId
      }
      this.getUdpCurrent()

      this.$nextTick(() => {
        this.dataInitFinish = true
      })
    },
    getUdpCurrent () {
      // const propertiesObj = this.createForm.additionalProperties || []
      // this.additionalProperties = []
      // propertiesObj.forEach(e => {
      //   if (this.udps.filter(item => item.propertyId === parseInt(e[0])).length) {
      //     const obj = {
      //       name: this.udps.filter(item => item.propertyId === parseInt(e[0]))[0]
      //         .name,
      //       value: e[1],
      //       catalog: this.udps.filter(item => item.propertyId === parseInt(e[0]))[0]
      //         .catalog
      //     }
      //     this.additionalProperties.push(obj)
      //     console.log(this.additionalProperties, 'additionalProperties')
      //   }
      // })

      this.udps.forEach(e => {
        let additionalProperties = this.oldData?.additionalProperties || []
        this.$set(this.additionalPropertiesObj, e.propertyId, additionalProperties[e.propertyId])
        if (e.required) {
          let validator = (rule, value, callback) => {
            if (!this.additionalPropertiesObj[e.propertyId]) {
              callback(
                new Error(
                  this.$t('domain.common.itemRequiredInput', { name: e.name })
                )
              )
            } else {
              callback()
            }
          }
          this.$set(this.rules, e.propertyId, {
            required: true,
            trigger: 'blur',
            message: this.$t('domain.common.itemRequiredInput', { name: e.name }),
            validator
          })

          // console.log(this.additionalPropertiesObj, 'this.additionalPropertiesObj')
        }
      })
    },
    getPath () {
      if (!this.categoryMap) {
        return
      }
      let category = this.categoryMap[this.createForm.subjectId]
      if (!category) {
        return
      }
      let arr = []
      arr.unshift(category)
      while (category.parentId) {
        category = this.categoryMap[category.parentId]
        arr.unshift(category)
      }
      this.breadcrumbData = arr.map(item => {
        return {
          name: item.name,
          couldClick: false
        }
      })

      this.breadcrumbData.push({
        name: this.oldData ? '编辑' : '新建',
        couldClick: false
      })
    },
    getAllModelTheme () {
      HTTP.getAllSubTagList()
        .then(res => {
          this.themeList = (res || []).filter(item => !!item)
        })
        .catch(err => {
          this.$showFailure(err)
        })
      HTTP.getBusinessObjCategoryTree()
        .then(data => {
          let categoryMap = {}
          let getCategoryMap = (arr, result, level) => {
            arr.forEach(item => {
              item.level = level
              item.disabledCascader = level !== 3
              result[item.id] = item
              if (item.children && item.children.length) {
                getCategoryMap(item.children, result, level + 1)
              } else {
                if (item.children?.length === 0) {
                  delete item.children
                }
              }
            })
          }
          getCategoryMap(data, categoryMap, 1)
          this.categoryList = data
          this.categoryMap = categoryMap

          this.$nextTick(this.getPath)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          this.dataSubmitFormatter()
          if (this.editModel) {
            this.editBussinessObject()
          } else {
            this.createBussinessObject()
          }
        } else {
          return false
        }
      })
    },
    handleCancel () {
      let bool = false // 是否有未保存的数据
      if (this.editModel) {
        // Object.keys(this.oldData).forEach(key => {
        //   this.createForm[key] = this.oldData[key]
        // })
        // bool = this.testChange(this.createForm, this.oldData, { ignoreProps: ['createTime', 'updateTime', 'id'] })
        bool = this.valueChange
      } else {
        bool = true
      }
      if (bool) {
        this.$DatablauCofirm('数据未保存，确认要返回？', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok')
        })
          .then(() => {
            this.$emit('goBack')
          })
          .catch(() => {
            console.log('cancel')
          })
      } else {
        this.$emit('goBack')
      }
    },
    // // 判断 json 是否修改
    // testChange (newVal, oldVal, para = { ignoreProps: [] }) {
    //   function isEqual (obj1, obj2) {
    //     for (let key in obj1) {
    //       if (obj1.hasOwnProperty(key)) {
    //         if (!obj2.hasOwnProperty(key)) return false
    //         if (!obj1[key] || !obj2[key]) {
    //           return false
    //         }
    //         if (typeof obj1[key] === 'object') {
    //           if (!isEqual(obj1[key], obj2[key])) return false
    //         } else if (obj1[key] !== obj2[key]) {
    //           return false
    //         }
    //       }
    //     }
    //     for (let key in obj2) {
    //       if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) return false
    //     }
    //     return true
    //   }
    //
    //   return isEqual(newVal, oldVal)
    // },
    dataSubmitFormatter () {
      let requestBody = _.cloneDeep(this.createForm)
      requestBody.additionalProperties = {}
      Object.keys(this.additionalPropertiesObj).forEach(e => {
        // if (this.additionalPropertiesObj[e]) {
        //   requestBody.additionalProperties.push([
        //     // parseInt(e),
        //     e,
        //     this.additionalPropertiesObj[e]
        //   ])
        // } else {
        //   requestBody.additionalProperties.push([e, ''])
        // }
        requestBody.additionalProperties[e] = this.additionalPropertiesObj[e]
      })
      this.submitForm = requestBody
    },
    createBussinessObject () {
      this.loading = true
      // this.createForm.subjectId = this.currentCategoryId
      HTTP.createBussinessObject(this.submitForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('业务对象创建成功')
          this.$emit('updateSuccess')
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    editBussinessObject () {
      this.loading = true
      HTTP.editBussinessObject(this.submitForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('业务对象修改成功')
          this.$emit('updateSuccess')
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    testCategory (rule, value, callback) {
      // 业务对象必须挂在 主题域 上（第三层目录）
      let category = this.categoryMap[this.createForm.subjectId]
      if (!category) {
        callback(new Error('请选择目录'))
      } else if (category.level !== 3) {
        callback(new Error('请选择主题域'))
      } else {
        callback()
      }
    },

    // showDialog () {
    //   this.createForm = _.cloneDeep(this.defaultForm)
    //   if (this.editModel) {
    //     Object.keys(this.oldData).forEach(key => {
    //       this.createForm[key] = this.oldData[key]
    //     })
    //   } else {
    //     this.createForm.subjectId = this.currentCategoryId
    //   }
    //   this.dialogVisible = true
    // },
    refreshData () {
      this.$emit('updateSuccess')
    }
  },
  watch: {
    createForm: {
      deep: true,
      handler () {
        if (this.dataInitFinish) {
          this.valueChange = true
        }
      }
    },
    additionalPropertiesObj: {
      deep: true,
      handler () {
        if (this.dataInitFinish) {
          this.valueChange = true
        }
      }
    },
    'createForm.subjectId' () {
      this.getPath()
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-business-object {
  .breadcrumb-wrapper {
    position: relative;
    z-index: 1;
    padding: 0 20px;
    height: 34px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #DDD;
  }

  .udp-form-item {
    ///deep/ .el-form-item__label {
    //  overflow: hidden;
    //  text-overflow: ellipsis;
    //  white-space: nowrap;
    //}
    .udp-form-edit-item {
      display: inline-block;
    }

    /deep/ .el-form-item__error {
      left: 190px;
    }
  }

  .edit-business-obj-content {
    top: 40px;
  }

  .content {
    padding: 0 20px;
  }

  .top-hint {
    margin: 20px 0px 30px;
    line-height: 18px;
    border-left: 4px solid #409EFF;
    padding-left: 6px;
    font-size: 16px;
    color: #555;
  }

}
</style>
