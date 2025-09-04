<template>
  <div>
    <datablau-dialog
      :visible.sync="addStructure"
      :title="title || $t('assets.directoryStructure.newAsset')"
      width="560px"
      height="320px"
      :before-close="handleClose"
    >
      <datablau-form
        :model="formContent"
        ref="demoForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item
          :label="$t('assets.directoryStructure.assetCatalogName')"
          prop="name"
        >
          <datablau-input
            v-model="formContent.name"
            clearable
            maxlength="10"
            @input="keyup(formContent)"
            :placeholder="$t('assets.directoryStructure.placeholder')"
            style="width: 383px"
            :class="{ nameSelect: nameSelect }"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('assets.directoryStructure.catalogHierarchy')"
          prop="num"
        >
          <!--          :disabled="formContent.inUse"-->
          <datablau-select
            clearable
            v-model="formContent.num"
            @focus="setoptionDis(formContent)"
            @change="disChange"
            :ceholder="$t('assets.directoryStructure.pleaseChoose')"
            style="width: 200px"
            :class="{ tipRed: tipRed }"
          >
            <el-option
              v-for="item in propertyNew"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('assets.directoryStructure.describe')"
          prop="description"
        >
          <datablau-input
            style="width: 383px"
            v-model="formContent.description"
            :placeholder="$t('assets.directoryStructure.keyIn')"
            type="textarea"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer">
        <datablau-button @click="handleClose">
          {{ $t('assets.permissionSettings.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('assets.permissionSettings.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../utils/api'
export default {
  // props: ['addStructure'],
  props: {
    addStructure: {
      type: Boolean,
    },
    cataItem: {
      type: Object,
      default: () => {
        return { id: '' }
      },
    },
    title: {
      type: String,
      default: () => '',
    },
    structureList: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    addStructure(val) {
      // console.log(this.cataItem, 'this.cataItem')
      if (this.cataItem && this.cataItem.name) {
        let filterAry = this.cataItem.detailDtos.filter(item => {
          return !item.delete
        })
        let submitDtos = this.cataItem.detailDtos.filter(item => {
          return item.id
        })
        this.num = submitDtos.length
        this.formContent = {
          name: this.cataItem.name,
          num: filterAry.length,
          inUse: this.cataItem.inUse,
          description: this.cataItem.description,
        }
        return
      }
      this.formContent = { name: '', num: '', inUse: false, description: '' }
    },
  },
  data() {
    return {
      formContent: { name: '', num: '', description: '' },
      rules: {
        name: {
          required: true,
          trigger: 'blur',
          message: this.$t('assets.directoryStructure.nameIsRequired'),
        },
        num: {
          required: true,
          trigger: 'blur',
          message: this.$t('assets.directoryStructure.levelRequired'),
        },
      },
      propertyNew: [
        {
          value: 1,
          label: this.$t('assets.directoryStructure.firstLevel'),
          disabled: false,
        },
        {
          value: 2,
          label: this.$t('assets.directoryStructure.twoLevel'),
          disabled: false,
        },
        {
          value: 3,
          label: this.$t('assets.directoryStructure.threeLevel'),
          disabled: false,
        },
        {
          value: 4,
          label: this.$t('assets.directoryStructure.fourLevel'),
          disabled: false,
        },
        {
          value: 5,
          label: this.$t('assets.directoryStructure.fiveLevel'),
          disabled: false,
        },
      ],
      nameSelect: false,
      // description: '', // 描述，可删除，占位
      num: 0, // 已提交的目录的最高级
      tipRed: false,
    }
  },
  computed: {
    nameList() {
      return this.structureList.filter(item => {
        return item.name && item.id !== this.cataItem.id
      })
    },
  },
  methods: {
    disChange(val) {
      // console.log(this.cataItem, val)
      this.tipRed = false
      if (this.cataItem.detailDtos.length > val) {
        return
      }
      if (
        this.cataItem.detailDtos[
          this.cataItem.detailDtos.length - 1
        ].typeAsset.indexOf('目录') === -1 &&
        this.formContent.num !== this.cataItem.detailDtos.length
      ) {
        this.tipRed = true
      } else {
        this.tipRed = false
      }
    },
    primary() {
      if (this.tipRed) return
      this.nameSelect = false
      this.tipRed = false
      this.$refs.demoForm.validate(valid => {
        if (valid) {
          let flag = this.nameList.some(item => {
            return item.name === this.formContent.name
          })
          if (flag) {
            this.nameSelect = true
          } else {
            this.$emit('primary', { ...this.cataItem, ...this.formContent })
            this.nameSelect = false
          }
        }
      })
    },
    handleClose() {
      this.$emit('handleClose')
      this.$refs.demoForm && this.$refs.demoForm.clearValidate()
      this.nameSelect = false
      this.tipRed = false
    },
    keyup(item) {
      // item.name = item.name.replace(/[^\u4e00-\u9fa5]/g, '')
    },
    setoptionDis(item) {
      if (item.inUse) {
        this.propertyNew.forEach(k => {
          if (k.value < this.num) {
            k.disabled = true
          }
        })
      }
    },
  },
  mounted() {
    this.$refs.demoForm && this.$refs.demoForm.clearValidate()
    this.nameSelect = false
    this.tipRed = false
  },
}
</script>

<style scoped lang="scss">
/deep/.el-select .el-input.is-disabled .el-input__inner {
  border-color: #ddd;
  background-color: #f5f5f5;
  cursor: not-allowed !important;
}
/deep/ .nameSelect .el-input__inner,
/deep/.tipRed .el-input__inner {
  border-color: #ff4b53;
}
.nameSelect {
  position: relative;
  &::after {
    content: '目录名称重名';
    position: absolute;
    bottom: -24px;
    font-size: 12px;
    color: #ff4b53;
    left: 0;
  }
}
/deep/.el-form.db-form .el-textarea {
  width: 100%;
}
.tipRed {
  position: relative;
  &::after {
    content: '末级目录类型不包含‘目录’不能增加目录层级';
    position: absolute;
    bottom: -24px;
    font-size: 12px;
    color: #ff4b53;
    left: 0;
    white-space: nowrap;
  }
}
</style>
