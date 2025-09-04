<template>
  <div class="form-con">
    <el-form
      ref="form"
      label-width="110px"
      label-position="right"
      size="small"
      class="cre-virds-form"
      :model="fdsContent"
    >
      <el-form-item label="名称" :rules="{ required: true }">
        <el-input
          size="mini"
          v-model="fdsContent.name"
          placeholder="请输入数据源名称，此名称全局唯一"
        ></el-input>
      </el-form-item>
      <el-form-item label="显示名称" :rules="{ required: true }">
        <el-input
          size="mini"
          v-model="fdsContent.displayName"
          placeholder="输入数据源名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="数据源" :rules="{ required: true }">
        <el-select
          size="mini"
          v-model="fdsContent.modelId"
          placeholder="请选择数据源"
          :disabled="!modelIdChangeable"
        >
          <el-option
            v-for="item in modelsArr"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述" :rules="{ required: true }">
        <el-input
          size="mini"
          type="textarea"
          v-model="fdsContent.description"
          placeholder="输入数据源名称"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleCreateFds">立即创建</el-button>
        <el-button> {{ $t('common.button.cancel') }} </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
/**
 * 创建虚拟数据源
 */
import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      fdsContent: {
        name: '',
        displayName: '',
        modelId: '',
      },
      modelsArr: [],
      modelIdChangeable: true,
    }
  },
  porps: {
    choosedObjectId: {
      type: Number,
      default: '',
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      HTTP.getDataSource({
        succesedCallback: data => {
          // 过滤jdbc
          if (data && Array.isArray(data)) {
            const arr = []
            data.forEach(item => {
              if (
                item.connectionInfo &&
                item.connectionInfo.connectType === 'JDBC'
              ) {
                const obj = {
                  id: item.connectionInfo.modelId,
                  name: item.definition,
                }
                arr.push(obj)
              }
            })
            this.modelsArr = arr
          }
        },
        failureCallback: e => {
          this.$showFailue(e)
        },
      })
      if (this.choosedObjectId) {
        HTTP.getTableDetail({
          succesedCallback: data => {
            if (data.modelId) {
              this.fdsContent.modelId = data.modelId
              this.modelIdChangeable = false
            }
          },
          failureCallback: e => {
            this.$showFailue(e)
          },
          para: {
            objectId: this.choosedObjectId,
          },
        })
      }
    },
    handleCreateFds() {
      HTTP.createFds({
        succesedCallback: data => {
          this.$emit('handleCreated')
        },
        failureCallback: e => {
          this.$showFailue(e)
        },
        postBody: this.fdsContent,
      })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.form-con {
  width: 600px;

  .cre-virds-form {
    input {
      width: 250px;
    }
  }
}
</style>
