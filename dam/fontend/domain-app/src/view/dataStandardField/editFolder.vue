<template>
  <div class="edit-folder">
    <div class="container">
      <div class="form-outer">
        <datablau-form
          :label-width="($i18n.locale === 'en' ? 120 : 80) + 'px'"
          :model="folderData"
          ref="form"
          :rules="rules"
        >
          <el-form-item :label="$t('domain.fieldDomain.groupName')" prop="name">
            <datablau-input
              size="mini"
              :maxlength="200"
              v-model="folderData.name"
              :placeholder="
                $t('domain.common.inputPlaceholder', {
                  name: $t('domain.fieldDomain.groupName'),
                })
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('domain.common.description')"
            prop="description"
          >
            <datablau-input
              size="mini"
              type="textarea"
              v-model="folderData.description"
              :placeholder="
                $t('domain.common.inputPlaceholder', {
                  name: $t('domain.common.description'),
                })
              "
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
    </div>
    <div class="confirm-line" v-if="false">
      <el-button size="small" type="primary" @click="addFolder">
        {{ $t('common.button.ok') }}
      </el-button>
      <el-button size="small" @click="cancel">
        {{ $t('common.button.cancel') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'editFolder',
  data() {
    const valiDupName = (rule, value, callback) => {
      if (!value) {
        callback(
          new Error(
            this.$t('domain.common.itemRequiredInput', {
              name: this.$t('domain.dataFind.name'),
            })
          )
        )
        return
      }
      const index = this.folderList.findIndex(item => {
        return item.name == value
      })
      if (
        index === -1 ||
        (this.isEdit && this.folderList[index].id == this.defaultData.id)
      ) {
        callback()
      } else {
        callback(new Error(this.$t('meta.DS.message.nameDuplicate')))
      }
    }
    return {
      folderData: {
        name: '',
        description: '',
      },
      rules: {
        name: { required: true, validator: valiDupName, trigger: 'blur' },
      },
    }
  },
  props: {
    defaultData: {
      type: Object,
      default() {
        return {
          id: 'add',
        }
      },
    },
    folderList: {
      type: Array,
      required: true,
    },
  },
  components: {},
  computed: {
    isEdit() {
      return this.defaultData && this.defaultData.id !== 'add'
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      if (this.defaultData && this.defaultData.id !== 'add') {
        this.folderData = this.defaultData
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    addFolder() {
      this.$refs.form.validate(vaild => {
        if (vaild) {
          if (this.defaultData.id === 'add') {
            let para = {
              parentId: 0,
              name: this.folderData.name,
              description: this.folderData.description,
            }
            HTTP.addCatalog(para)
              .then(res => {
                this.$message.success(this.$t('domain.common.saveSucceed'))
                this.$emit('saveSuccess')
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            HTTP.updateCatalog(this.folderData)
              .then(res => {
                this.$message.success(this.$t('domain.common.saveSucceed'))
                this.$emit('saveSuccess')
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        } else {
          this.$datablauMessage({
            message: this.$t('domain.fieldDomain.nameErrorMessage'),
            type: 'info',
          })
        }
      })
      // return
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.edit-folder {
  .top-line {
    padding: 8px 0 10px 20px;
  }

  .container {
    padding: 20px;

    .form-outer {
      margin-bottom: 20px;

      /deep/ .el-form.db-form {
        .datablau-input, .datablau-input[type='textarea'] {
          width: 400px;
        }
      }
    }
  }

  .confirm-line {
    padding-left: 20px;
  }
}
</style>
