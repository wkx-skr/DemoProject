<template>
  <div class="catalogueDetail">
    <choose-tag
      :tagTree="tagTree"
      :tagMap="tagMap"
      ref="chooseTag"
      :oldChoosedIds="formData.TagIds"
      @choosedTagChanged="choosedTagChanged"
    ></choose-tag>
    <datablau-form-submit>
      <datablau-detail-subtitle
        :title="
          type === 'next'
            ? $t('meta.lineageManage.lineageCatalogue.addSubordinate')
            : $t('meta.lineageManage.lineageCatalogue.addPeer')
        "
        mt="20px"
        style="margin-left: 20px"
      ></datablau-detail-subtitle>
      <datablau-form
        :model="formData"
        ref="formData"
        :rules="rules"
        style="margin-top: 30px"
      >
        <el-form-item
          :label="
            $t('meta.lineageManage.lineageCatalogue.detailScan.directoryName')
          "
          prop="folderName"
        >
          <datablau-input
            v-model="formData.folderName"
            show-word-limit
            style="width: 500px"
            class="maxlengthInput"
            maxlength="100"
            :placeholder="
              $t('meta.lineageManage.lineageCatalogue.rules.folderName')
            "
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="
            $t('meta.lineageManage.lineageCatalogue.detailScan.directoryPath')
          "
          prop="path"
        >
          <datablau-cascader
            :key="cascaderId"
            :options="options"
            v-model="formData.path"
            :disabled="true"
            :props="dsCascaderProps"
          ></datablau-cascader>
        </el-form-item>
        <el-form-item
          :label="
            $t('meta.lineageManage.lineageCatalogue.detailScan.itDepartment')
          "
          prop="itDepartmentName"
        >
          <datablau-input
            v-model="formData.itDepartmentName"
            show-word-limit
            style="width: 500px"
            :placeholder="
              $t('meta.lineageManage.lineageCatalogue.rules.itDepartmentName')
            "
            @focus="selectItDepartment"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="
            $t(
              'meta.lineageManage.lineageCatalogue.detailScan.bsDepartmentName'
            )
          "
          prop="bsDepartmentName"
        >
          <datablau-input
            v-model="formData.bsDepartmentName"
            show-word-limit
            style="width: 500px"
            @focus="selectBsDepartment"
            :placeholder="
              $t('meta.lineageManage.lineageCatalogue.rules.bsDepartmentName')
            "
          ></datablau-input>
        </el-form-item>
        <!--        <el-form-item
          :label="$t('meta.lineageManage.lineageCatalogue.detailScan.tag')"
          size="mini"
        >
          <el-select
            v-model="formData.TagIds"
            multiple
            filterable
            @focus="openChooseTag"
            ref="tagSelect"
            style="width: 500px"
          >
            <el-option
              v-for="item in tagMap"
              style="max-width: 460px"
              :label="item.name"
              :value="item.tagId"
              :key="item.tagId"
            ></el-option>
          </el-select>
        </el-form-item>-->
        <el-form-item
          :label="$t('meta.lineageManage.lineageCatalogue.detailScan.owner')"
          prop="owner"
        >
          <datablau-input
            v-model="formData.owner"
            show-word-limit
            style="width: 500px"
            @focus="selectProblemUser"
            :placeholder="$t('meta.lineageManage.lineageCatalogue.rules.owner')"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="
            $t('meta.lineageManage.lineageCatalogue.detailScan.description')
          "
        >
          <datablau-input
            v-model="formData.description"
            show-word-limit
            style="width: 500px"
            :placeholder="
              $t('meta.lineageManage.lineageCatalogue.rules.description')
            "
            type="textarea"
          ></datablau-input>
        </el-form-item>
      </datablau-form>

      <div class="footer-button" slot="buttons">
        <div class="button-box">
          <datablau-button type="important" @click="addOrUpdateFolder">
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button type="secondary" @click="closeUpdateFolder">
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>
  </div>
</template>
<script>
import chooseTag from '@/components/dataSource/chooseTag.vue'
export default {
  components: {
    chooseTag,
  },
  data() {
    return {
      activeName: '目录信息',
      formData: {
        folderName: '',
        path: [],
        itDepartment: '',
        itDepartmentName: '',
        bsDepartment: '',
        bsDepartmentName: '',
        description: '',
        // TagIds: null,
        owner: '',
      },
      rules: {
        folderName: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.folderName'
            ),
            trigger: 'blur',
          },
        ],
        path: [
          {
            required: true,
            message: this.$t('meta.lineageManage.lineageCatalogue.rules.path'),
            trigger: 'blur',
          },
        ],
        itDepartmentName: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.itDepartmentName'
            ),
            trigger: 'blur',
          },
        ],
        bsDepartmentName: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.bsDepartmentName'
            ),
            trigger: 'blur',
          },
        ],
        TagIds: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.TagIds'
            ),
            trigger: 'blur',
          },
        ],
        owner: [
          {
            required: true,
            message: this.$t('meta.lineageManage.lineageCatalogue.rules.owner'),
            trigger: 'blur',
          },
        ],
      },
      options: [],
      dsCascaderProps: {
        value: 'id',
        label: 'name',
        children: 'subSets',
        checkStrictly: true,
      },
      cascaderId: 0,
      dataZoneTags: [],
      tagMap: {},
      tagTree: [],
    }
  },
  props: ['dataDetail', 'type'],

  beforeMount() {},
  mounted() {
    this.getTreeData()
    this.getTags()
  },
  methods: {
    closeUpdateFolder() {
      this.$emit('fatherMethod', this.dataDetail.id)
    },
    addOrUpdateFolder() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          let obj = {
            // folderId:
            parentFolderId:
              this.dataDetail.folderDto.parentFolderId === null
                ? null
                : this.dataDetail.folderDto.parentFolderId,
            // inheritModelFolderId: （继承数据源的起始folderId, 可为空）
            // inheritScriptFolderId: （继承脚本的起始folderId, 可为空）

            folderName: this.formData.folderName,
            itDepartment: this.formData.itDepartment,
            bsDepartment: this.formData.bsDepartment,
            owner: this.formData.owner,
            // tagIds: this.formData.TagIds.join(','),
            description: this.formData.description,
            // jobId:
          }
          if (this.formData.path.join('/') === '0') {
            obj.pathsId = null
          } else {
            this.formData.path.shift()
            obj.pathsId = this.formData.path.join('/')
          }
          if (this.type === 'peer') {
            obj.parentFolderId =
              `${this.dataDetail.folderDto.parentFolderId}` === 'null' ||
              `${this.dataDetail.folderDto.parentFolderId}` === '0'
                ? null
                : this.dataDetail.folderDto.parentFolderId
          } else {
            obj.parentFolderId = this.dataDetail.folderDto.folderId
          }
          this.$http
            .post(
              this.$meta_url + '/service/lineage/folder/addOrUpdateFolder',
              obj
            )
            .then(res => {
              this.$blauShowSuccess(
                this.$t('meta.lineageManage.lineageCatalogue.successfullyAdd')
              )
              this.$emit('fatherMethod')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.formData.owner = res[0].username
        this.$refs.formData.validateField('owner')
      })
    },
    // 关于 tag
    getTags(callback) {
      this.$http
        .post(this.$url + '/tags/getAllTags')
        .then(res => {
          const tagTree = []
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                tagTree.push(item)
              }
            })
            this.tagMap = map
            this.tagTree = tagTree
          }
          this.dataZoneTags = datazoneTag.children || []
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback()
        })
    },
    choosedTagChanged(tagIds) {
      this.formData.TagIds = tagIds
    },
    openChooseTag() {
      this.$refs.tagSelect.blur()
      this.handleAddTag()
    },
    handleAddTag() {
      this.$refs.chooseTag && this.$refs.chooseTag.showDialog()
    },
    selectItDepartment() {
      this.$utils.branchSelect.open(false).then(res => {
        this.$set(this.formData, 'itDepartment', res.bm)
        this.$set(this.formData, 'itDepartmentName', res.fullName)
        this.$refs.formData.validateField('itDepartmentName')
      })
    },
    selectBsDepartment() {
      this.$utils.branchSelect.open(false).then(res => {
        this.$set(this.formData, 'bsDepartment', res.bm)
        this.$set(this.formData, 'bsDepartmentName', res.fullName)
        this.$refs.formData.validateField('bsDepartmentName')
      })
    },
    handleChange() {
      console.log(this.formData.path, 'this.formData.path')
    },
    handleClick() {},
    getTreeData() {
      this.options = []
      this.formData.path = []
      this.$http
        .post(this.$meta_url + '/service/lineage/folder/tree')
        .then(res => {
          this.options.push(res.data)

          // console.log(this.options, 'this.options')
          if (this.type === 'peer') {
            if (this.dataDetail.folderDto.pathsId === null) {
              this.formData.path = [0]
            } else {
              let arr = this.dataDetail.folderDto.pathsId.split('/')
              // arr.unshift('0')
              arr.pop()
              this.formData.path = arr.map(Number)
              //   this.$set(this.formData, 'path', arr.map(Number))
            }
          } else {
            if (
              this.dataDetail.folderDto.pathsId === null ||
              this.dataDetail.folderDto.pathsId === 'null'
            ) {
              this.formData.path = [0]
              if (this.dataDetail.folderDto.folderId !== 0) {
                this.formData.path.push(this.dataDetail.folderDto.folderId)
              }
            } else {
              let arr = this.dataDetail.folderDto.pathsId.split('/')
              // arr.unshift('0')
              arr.pop()
              this.formData.path = arr.map(Number)
              this.formData.path.push(this.dataDetail.folderDto.folderId)
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {
    options: {
      handler() {
        this.cascaderId++
      },
      deep: true,
    },
  },
}
</script>

<style scoped lang="scss">
.catalogueDetail {
  margin: 20px;
}
</style>
<style lang="scss"></style>
