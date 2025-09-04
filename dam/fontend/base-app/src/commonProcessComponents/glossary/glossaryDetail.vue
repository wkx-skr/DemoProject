<template>
  <div class="tab-page">
    <div class="container">
      <div class="collapse-title">
        <h2>{{ '业务术语' }}</h2>
      </div>
      <el-form
        class="page-form"
        label-position="right"
        label-width="150px"
        size="small"
        :model="glossary"
        ref="glossaryFormDom"
      >
        <el-form-item
          class="message-form-item"
          :label="$t('domain.glossary.standardTheme') + '：'"
          prop="folderId"
        >
          <span>{{ glossary.paths?.join('/') }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.domainCode') + '：'">
          <span>{{ glossary.domainCode }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.cName') + '：'" prop="chName">
          <span>{{ glossary.chName }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('domain.glossary.enName') + '：'"
          prop="enName"
        >
          <span>{{ glossary.enName }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.abbr') + '：'" prop="abbr">
          <span>{{ glossary.abbr }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('domain.glossary.explanationTerms') + '：'"
          prop="explanationTerms"
        >
          <span>{{ glossary.explanationTerms }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.scene') + '：'">
          <span>{{ glossary.scene }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.example') + '：'">
          <span>{{ glossary.example }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.businessTermAliases') + '：'">
          <span>{{ glossary.businessTermAliases }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.relaId') + '：'">
          <span>{{ glossary.relaTerm }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('domain.glossary.managementDepartment') + '：'"
          prop="managementDepartment"
        >
          <span>{{ glossary.managementDepartmentName }}</span>
        </el-form-item>
        <el-form-item :label="$t('domain.glossary.source') + '：'">
          <span>{{ glossary.source }}</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'glossaryDetail',
  props: {
    id: {
      type: String,
      default: '',
    },
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    formDetails: {
      type: Array,
      default: () => {
        return []
      },
    },
    getDetailData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  data() {
    const glossaryUrl = this.$domain_url + '/ns/'
    return {
      glossaryUrl: glossaryUrl,
      glossary: {},
    }
  },

  components: {},

  computed: {},

  created() {},
  beforeMount() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    initGlossary(id) {
      this.$http
        .get(this.glossaryUrl + `ns/getNs/${id}`)
        .then(res => {
          this.glossary = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
  },
  watch: {
    id(val) {
      if (val) {
        this.initGlossary(val)
      }
    },
    getDetailData(val) {
      if (val && val.formDtos?.length) {
        const nsIdObj = val.formDtos.find(v => v.code === 'nsId')
        if (nsIdObj && nsIdObj.value) {
          this.initGlossary(nsIdObj.value)
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.tab-page {
  min-height: 300px;
  margin-top: 10px;
  .container {
    overflow: auto;
    /deep/.form-submit {
      top: 10px;
      left: 20px;
      .page-form {
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .el-form.page-form .el-select,
      .el-form.page-form .el-cascader,
      .el-form.page-form .el-input {
        width: 900px;
      }
    }
    /deep/.row-buttons {
      text-align: left;
    }
  }
}
.collapse-title {
  h2 {
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    position: relative;
    &::after {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -10px;
      width: 4px;
      height: 14px;
      content: '';
      background: #409eff;
      border-radius: 1px;
    }
  }
  i {
    margin: 20px 20px;
    font-size: 12px;
    color: #479eff;
    &:hover {
      /* text-decoration: underline; */
    }
  }
  padding-left: 10px;
}
</style>
