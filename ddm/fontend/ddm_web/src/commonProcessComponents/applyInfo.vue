<template>
  <div>
    <el-form
      label-position="right"
      label-width="110px"
      style="padding-top: 18px"
    >
      <el-form-item label="申请原因: ">
        <div>{{ techRule.applyReason }}</div>
      </el-form-item>
      <el-form-item label="附件: ">
        <div class="doc">
          <span class="docName">{{ techRule.applyFileName }}</span>
          <datablau-button
            v-show="techRule.applyFile"
            size="small"
            @click.stop="downloadFile"
            style="position: relative; top: 1px; margin-left: 10px"
          >
            <i class="iconfont icon-download"></i>
            下载附件
          </datablau-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      techRule: {
        applyReason: '暂无原因',
        applyFile: '',
        applyFileName: '暂无附件',
      },
    }
  },
  props: {
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    ruleType() {
      return this.commonData.processType
    },
  },
  mounted() {},
  watch: {
    getDetailData: {
      handler(val) {
        if (val) {
          this.techRule.applyReason =
            val.formDtos.filter(item => item.code === 'applyReason')[0]
              ?.value || '暂无原因'
          this.techRule.applyFile =
            val.formDtos.filter(item => item.code === 'applyFile')[0]?.value ||
            ''
          if (this.techRule.applyFile) {
            this.$http
              .post(
                this.$url +
                  `/files/getFilesInfo?fileIds=${this.techRule.applyFile}`
              )
              .then(res => {
                this.$nextTick(() => {
                  this.techRule.applyFileName =
                    res.data[0]?.fileName || '暂无附件'
                })
              })
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 下载附件
    downloadFile() {
      try {
        const url =
          this.$url + '/files/download?fileId=' + this.techRule.applyFile
        this.$downloadFilePost(url)
      } catch (e) {
        this.$showFailure(e)
      }
    },
  },
}
</script>
