<template>
  <div>
    <datablau-form-submit>
      <el-form
        class="page-form"
        label-position="right"
        label-width="120px"
        size="small"
        :model="category"
        ref="form"
        :rules="rules"
        :disabled="currentType === 'show'"
      >
        <el-form-item label="父系统" prop="parentId">
          <!-- 级联选择器 -->
          <datablau-cascader
            :options="folderTree"
            :props="{
              checkStrictly: true,
              value: 'folderId',
              label: 'name',
              children: 'nodes',
            }"
            @change="handleChange"
            v-model="category.parentId"
          ></datablau-cascader>
        </el-form-item>

        <el-form-item label="名称" prop="categoryName">
          <datablau-input
            v-model="category.categoryName"
            placeholder="请输入名称"
          ></datablau-input>
        </el-form-item>

        <el-form-item label="简写" prop="categoryAbbreviation">
          <datablau-input
            v-model="category.categoryAbbreviation"
            placeholder="请输入简写"
          ></datablau-input>
        </el-form-item>

        <el-form-item label="描述">
          <datablau-input
            type="textarea"
            v-model="category.description"
            placeholder="请输入描述"
          ></datablau-input>
        </el-form-item>

        <el-form-item label="资产目录定义">
          <el-autocomplete
            v-model="category.zone"
            placeholder="请输入资产目录定义"
            clearable
            ref="cautocomplete"
            @clear="clearAutocomplete"
            :fetch-suggestions="
              (queryString, cb) => {
                cb($getSuggettionInputValue(queryString, cb, zoneArr, 'name'))
              }
            "
          ></el-autocomplete>
        </el-form-item>

        <el-form-item label="IT部门" prop="itDepartment">
          <datablau-input
            v-model="owers"
            @focus="addBm"
            readonly
          ></datablau-input>
        </el-form-item>

        <el-form-item label="业务部门" prop="businessDepartment">
          <datablau-input
            v-model="ower"
            @focus="addBms"
            readonly
          ></datablau-input>
        </el-form-item>

        <el-form-item label="重要程度">
          <datablau-select
            v-model="category.importance"
            placeholder="请选择重要程度"
            clearable
          >
            <el-option label="高" value="高"></el-option>
            <el-option label="中" value="中"></el-option>
            <el-option label="低" value="低"></el-option>
          </datablau-select>
        </el-form-item>

        <el-form-item label="系统负责人" prop="owner">
          <datablau-input
            @focus="addUsers"
            v-model="oversd"
            readonly
          ></datablau-input>
        </el-form-item>
        <!-- <el-form-item label="部署地">
          <datablau-input
            placeholder="请输入部署地"
            v-model="category.deployment"
          ></datablau-input>
        </el-form-item> -->

        <!-- 添加扩展属性表单项 -->
        <el-form-item v-for="u in udps" :key="u.id" :label="u.name">
          <datablau-input
            v-if="u.type === 'STRING' || u.type === 'NUM_RANGE'"
            v-model="u.value"
          ></datablau-input>
          <datablau-input
            v-else-if="u.type === 'NUM'"
            v-model="u.value"
            oninput="value=value.replace(/[^\d]/g, '')"
          ></datablau-input>
          <datablau-switch
            v-else-if="u.type === 'BOOL'"
            v-model="u.value"
            :active-value="true"
            :inactive-value="false"
          ></datablau-switch>
          <datablau-select
            v-else-if="u.type === 'ENUM'"
            v-model="u.value"
            filterable
            clearable
            :popper-append-to-body="false"
          >
            <el-option
              v-for="o in u.typeData ? u.typeData.split(';') : []"
              :key="o"
              :label="o"
              :value="o"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </el-form>

      <div slot="buttons" v-if="currentType !== 'show'">
        <datablau-button type="secondary" @click="cancel">取消</datablau-button>
        <datablau-button
          type="important"
          @click="onSubmit"
          :disabled="submitDisabled"
        >
          确定
        </datablau-button>
      </div>
      <div slot="buttons" v-else>
        <datablau-button type="secondary" @click="cancel">返回</datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  name: 'CategoryDetails',

  props: {
    folderTree: {}, // 目录树
    currentType: {}, // 当前操作类型
    currentCategory: {}, // 系统属性信息
    currentFolder: {}, // 目录结构信息，包含 folderId, parentId, name
    zoneArr: {},
    udpList: {},
  },

  data() {
    return {
      category: {},
      writable: true,
      submitDisabled: false,
      ower: '',
      owers: '',
      oversd: '',
      udps: [], // 添加扩展属性数组
      rules: {
        categoryName: {
          required: true,
          trigger: 'blur',
          message: '请输入分类名称',
        },
        categoryAbbreviation: {
          required: true,
          trigger: 'blur',
          message: '请输入简写',
        },
        itDepartment: {
          required: true,
          trigger: 'change',
          message: '请选择IT部门',
        },
        businessDepartment: {
          required: true,
          trigger: 'change',
          message: '请选择业务部门',
        },
        owner: {
          required: true,
          trigger: 'change',
          message: '请选择负责人',
        },
      },
    }
  },
  watch: {
    // 监听 udpList 变化
    udpList: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.initUdps()
        }
      },
      immediate: true,
    },
    currentCategory: {
      handler(newVal) {
        if (newVal) {
          this.category = { ...newVal, parentId: this.currentFolder.parentId }
          this.ower = this.category.businessDepartmentName || ''
          this.owers = this.category.itDepartmentName || ''
          this.oversd = this.category.owner || ''
          // 加载扩展属性
          this.initUdps()
        } else {
          this.category = {
            parentId: this.currentFolder.folderId,
          }
          this.ower = ''
          this.owers = ''
          this.oversd = ''
          // 新增时也需要加载扩展属性
          this.initUdps()
        }
      },
      immediate: true,
    },
  },

  methods: {
    handleChange() {},
    // 替换原来的 getUdp 方法，使用传入的 udpList 初始化扩展属性
    initUdps() {
      // 复制 udpList 到本地 udps
      let udps = _.cloneDeep(this.udpList || [])

      // 如果是编辑模式，获取当前分类的扩展属性值
      if (this.currentCategory && this.currentCategory.categoryId) {
        const udpsValues = this.currentCategory.udps
        udps.forEach(item => {
          if (Array.isArray(udpsValues) && udpsValues.length) {
            udpsValues.forEach(val => {
              if (item.id === val.id) {
                if (item.type === 'BOOL') {
                  item.value = val.value === 'true'
                } else {
                  item.value = val.value
                }
              }
            })
          }
        })
        this.udps = udps
      } else {
        // 新增模式，初始化扩展属性值
        udps.forEach(udp => {
          if (udp.type === 'BOOL') {
            udp.value = false
          } else {
            udp.value = ''
          }
        })
      }
      this.udps = udps
    },
    clearAutocomplete() {
      this.$refs.cautocomplete.activated = true
    },

    addBm() {
      this.$utils.branchSelect.open().then(res => {
        this.$set(this.category, 'itDepartment', res.bm)
        this.owers = res.fullName
      })
    },

    addBms() {
      this.$utils.branchSelect.open().then(res => {
        this.$set(this.category, 'businessDepartment', res.bm)
        this.ower = res.fullName
      })
    },

    addUsers() {
      this.$utils.staffSelect.open([], true).then(data => {
        const user = data[0]
        console.log(user)
        this.$set(this.category, 'owner', user.username)
        // this.category.owner = user.username
        this.oversd = user.fullUserName
      })
    },

    cancel() {
      this.$emit('refresh')
    },

    onSubmit() {
      // 如果是查看模式，不允许提交
      if (this.currentType === 'show') {
        return
      }

      this.$refs.form.validate(valid => {
        if (!valid) return false

        this.submitDisabled = true

        // 准备扩展属性数据
        let udpValues = []
        this.udps.forEach(udp => {
          if (udp.value !== undefined && udp.value !== '') {
            let obj = { id: udp.id, value: udp.value.toString() }
            udpValues.push(obj)
          }
        })

        const url = this.currentCategory
          ? '/base/modelCategory/updateModelCategoryNew'
          : '/base/modelCategory/createModelCategoryNew'
        const findParentId = parentId => {
          return parentId === 'root' ? 0 : parentId
        }
        let parentId = Array.isArray(this.category.parentId)
          ? this.category.parentId?.[this.category.parentId?.length - 1]
          : this.category.parentId
        const params = {
          folderId:
            this.currentType === 'edit'
              ? this.currentFolder?.folderId
              : undefined,
          categoryName: this.category.categoryName,
          categoryAbbreviation: this.category.categoryAbbreviation,
          deployment: this.category.deployment,
          itDepartment: this.category.itDepartment,
          businessDepartment: this.category.businessDepartment,
          owner: this.category.owner,
          description: this.category.description,
          zone: this.category.zone,
          importance: this.category.importance,
          udps: udpValues, // 直接将扩展属性值包含在参数中
          parentId: findParentId(parentId) || 0,
        }

        if (this.currentCategory) {
          params.categoryId = this.currentCategory.categoryId
        }

        this.$http
          .post(url, params)
          .then(() => {
            this.$message.success(
              this.currentCategory ? '修改成功' : '新增成功'
            )
            this.submitDisabled = false
            this.$emit('refresh')
          })
          .catch(err => {
            this.$showFailure(err)
            this.submitDisabled = false
          })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-form {
  padding: 10px 20px;
  /deep/ .el-input {
    width: 500px !important;
  }
  ::v-deep textarea {
    width: 500px !important;
  }
}
</style>
