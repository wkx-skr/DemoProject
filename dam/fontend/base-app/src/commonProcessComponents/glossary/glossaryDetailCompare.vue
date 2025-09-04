<template>
  <div>
    <el-row :gutter="10" style="padding-top: 10px">
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            background: #f5f5f5;
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.beforeChange') }}
        </div>
        <glossary-detail :id="this.oldGlossary.id" />
      </el-col>
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            color: #66bf16;
            background: rgba(102, 191, 22, 0.1);
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.afterChange') }}
        </div>
        <glossary-detail :id="this.glossary.id" />
      </el-col>
    </el-row>
    <div class="form-outer"></div>
  </div>
</template>

<script>
import GlossaryDetail from '@/commonProcessComponents/glossary/glossaryDetail.vue'

export default {
  name: 'glossaryDetailCompare',
  props: {
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
      oldGlossary: {},
      glossary: {},
    }
  },

  components: { GlossaryDetail },

  computed: {},

  created() {},
  beforeMount() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    initGlossary(id, type) {
      this.$http
        .get(this.glossaryUrl + `ns/getNs/${id}`)
        .then(res => {
          if (type === 'old') {
            this.oldGlossary = res.data
          } else {
            this.glossary = res.data
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
  },
  watch: {
    getDetailData(val) {
      if (val && val.formDtos?.length) {
        const updatingNsIdObj = val.formDtos.find(
          v => v.code === 'updatingNsId'
        )
        if (updatingNsIdObj && updatingNsIdObj.value) {
          this.initGlossary(updatingNsIdObj.value, 'new')
        }
        const nsIdObj = val.formDtos.find(v => v.code === 'nsId')
        if (nsIdObj && nsIdObj.value) {
          this.initGlossary(nsIdObj.value, 'old')
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.glossary-detail-compare {
}
</style>
