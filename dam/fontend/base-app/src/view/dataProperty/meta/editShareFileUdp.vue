<template>
  <div style="height: 150px">
    <el-form
      size="mini"
      :model="body"
      :label-width="$i18n.locale === 'zh' ? '5em' : '10em'"
      :rules="editRules"
    >
      <!-- <el-form-item label="属性类型">
        <el-select v-model="body.category" filterable allow-create>
          <el-option
            v-for="(label) in $shareFileUdpData.typeArr"
            :key="label"
            :value="label"
            :label="label"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item :label="$t('meta.DS.udp.name')" prop="name">
        <datablau-input
          v-model="body.name"
          style="width: 100%"
          maxlength="100"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="$t('meta.DS.udp.valRangeType')">
        <el-select v-model="body.type" style="width: 100%">
          <el-option
            value="STRING"
            :label="$t('meta.DS.udp.valueType.string')"
          ></el-option>
          <el-option
            value="NUM"
            :label="$t('meta.DS.udp.valueType.num')"
          ></el-option>
          <el-option
            value="NUM_RANGE"
            :label="$t('meta.DS.udp.valueType.numRange')"
          ></el-option>
          <el-option
            value="BOOL"
            :label="$t('meta.DS.udp.valueType.boolean')"
          ></el-option>
          <el-option
            value="ENUM"
            :label="$t('meta.DS.udp.valueType.enum')"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('meta.DS.udp.enumOption')"
        v-if="body.type === 'ENUM'"
        prop="typeData"
      >
        <datablau-input
          type="textarea"
          :row="4"
          v-model="body.typeData"
          :placeholder="$t('meta.DS.udp.enumPlaceholder')"
          style="width: 100%"
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div class="dialog-bottom">
      <datablau-button type="secondary" @click="close">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="important"
        @click="beforeSave"
        :disabled="disabledSave"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['typeId', 'currentRow', 'maxOrder', 'dupUdpNamMap'],
  data() {
    const nameValidate = (rule, value, callback) => {
      value = _.trim(value)
      if (!value) {
        callback(new Error(this.$t('meta.DS.udp.validate.nameRequired')))
      } else if (this.dupUdpNamMap[value] && this.oldName !== value) {
        callback(
          new Error(
            this.$t('meta.DS.udp.validate.nameDuplicateTips', { name: value })
          )
        )
      } else {
        callback()
      }
    }
    return {
      body: {
        name: '',
        order: this.maxOrder + 1,
        // desc:'',
        category: '',
        type: 'STRING', // STRING, NUM, NUM_RANGE, ENUM, BOOL
        typeData: '',
        // builtIn:false
      },
      oldName: '',
      editRules: {
        name: {
          validator: nameValidate,
          required: true,
          trigger: 'blur',
        },
        typeData: {
          required: true,
          trigger: 'blur',
          message: '请输入备选值',
        },
      },
    }
  },
  mounted() {
    if (this.currentRow) {
      this.oldName = this.currentRow.name
      if (this.currentRow.typeData) {
        this.currentRow.typeData = this.currentRow.typeData.replace(/\n/g, ';')
      }
      this.body = _.clone(this.currentRow)
    }
  },
  computed: {
    disabledSave() {
      const name = _.trim(this.body.name)
      return (
        !name ||
        (!!this.dupUdpNamMap[name] && this.oldName !== name) ||
        (this.body.type === 'ENUM' && !this.body.typeData)
      )
    },
  },
  methods: {
    beforeSave() {
      if (!this.body.name) {
        this.$message.error(this.$t('meta.DS.message.nameRequired'))
        return
      }
      if (this.body.name.length > 127) {
        this.$message.error(this.$t('meta.DS.message.nameLenTooLong'))
        return
      }
      this.createOrUpdateUdp()
    },
    createOrUpdateUdp() {
      const requestBody = _.cloneDeep(this.body)
      if (requestBody.type !== 'ENUM') {
        delete requestBody.typeData
      } else {
        requestBody.typeData = requestBody.typeData.replace(/;/g, '\n')
        requestBody.typeData = requestBody.typeData.replace(/；/g, '\n')
      }
      this.$http
        .post(
          `${this.$meta_url}/udps/updateUdpOfType?typeId=82800008`,
          requestBody
        )
        .then(res => {
          this.$emit('refresh')
          this.$emit('close')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped lang="scss">
/deep/ .el-form {
  padding-top: 10px;
  .el-form-item {
    margin-bottom: 14px;
    .el-form-item__label {
      line-height: 34px;
    }
    .el-form-item__error {
      line-height: 12px;
    }
  }
}
</style>
