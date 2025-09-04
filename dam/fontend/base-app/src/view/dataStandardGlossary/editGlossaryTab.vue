<template>
  <div class="addDataSource tab-page">
    <div class="container">
      <datablau-form-submit>
        <div>
          <el-form
            class="page-form"
            label-position="right"
            label-width="110px"
            size="small"
            :model="glossary"
            :max-height="tableHeight"
            ref="form"
          >
            <el-form-item
              :label="$t('domain.glossary.cName')"
              :rules="{ required: true }"
            >
              <datablau-input
                size="mini"
                v-model="glossary.chName"
                :placeholder="$t('domain.glossary.namePlaceholder')"
                :disabled="!hasAccess"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('domain.glossary.enName')">
              <datablau-input
                size="mini"
                v-model="glossary.enName"
                :placeholder="$t('domain.glossary.enNamePlaceholder')"
                :disabled="!hasAccess"
              ></datablau-input>
              <!-- type="textarea" :autosize="{minRows: 3, maxRows: 18}" class="text-area" -->
            </el-form-item>
            <el-form-item
              :label="$t('domain.glossary.abbr')"
              :rules="{ required: true }"
            >
              <datablau-input
                size="mini"
                v-model="glossary.abbr"
                :placeholder="$t('domain.glossary.abbrPlaceholder')"
                :disabled="!hasAccess"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('domain.glossary.classify')">
              <datablau-input
                size="mini"
                v-model="glossary.category"
                :placeholder="$t('domain.glossary.classifyPlaceholder')"
                :disabled="!hasAccess"
              ></datablau-input>
            </el-form-item>
          </el-form>
        </div>
        <template slot="buttons">
          <datablau-button
            size="small"
            type="important"
            @click="addGlossary"
            :disabled="disableCommitButton"
            v-if="hasAccess"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button size="small" type="secondary" @click="removetab">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  props: ['oldGlossary', 'hasAccess'],

  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      glossaryUrl: glossaryUrl,
      glossary: {},
      tableHeight: undefined,
      // disableCommitButton: false,
      isEdit: false,

      // *********************************
      // userModelCategory: [],
      // dbConnected: false,
      // lastLoadTimeStamp: 0,
      // interval: {},
    }
  },

  components: {},

  computed: {
    disableCommitButton() {
      return !(
        this.glossary &&
        this.glossary.chName &&
        this.glossary.chName.length > 0 &&
        this.glossary.abbr &&
        this.glossary.abbr.length > 0
      )
    },
  },

  mounted() {
    if (this.oldGlossary.nsId === 'add') {
      this.glossary = {}
    } else {
      this.glossary = {
        nsId: this.oldGlossary.nsId,
        chName: this.oldGlossary.chName,
        enName: this.oldGlossary.enName,
        abbr: this.oldGlossary.abbr,
        category: this.oldGlossary.category,
      }
      this.isEdit = true
    }
    // this.tableHeight = $(".table-row")[0].offsetHeight;
    // $(window).resize(this.resizeTable);
  },
  beforeDestroy() {
    // $(window).unbind("resize", this.resizeTable);
  },
  methods: {
    addGlossary() {
      if (!this.isEdit) {
        // this.$http
        //   .post(this.glossaryUrl, this.glossary)
        HTTP.nsCreateNsService(this.glossary)
          .then(res => {
            this.$emit('editFinish')
            this.$message.success(this.$t('domain.common.addSucceed'))
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // this.$http
        //   .put(this.glossaryUrl + this.glossary.nsId, this.glossary)
        HTTP.nsUpdateNsService(this.glossary)
          .then(res => {
            this.$emit('editFinish')
            this.$message.success(this.$t('domain.common.modifySuccessfully'))
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    removetab() {
      this.$emit('editFinish')
    },
  },
}
</script>
<style lang="scss" scoped>
.tab-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .container {
    position: absolute;
    left: 0;
    right: 0;
    top: 20px;
    bottom: 0px;
    // border-bottom: 1px solid #eee;
    overflow: auto;

    .page-form {
      position: absolute;
      top: 0;
      left: 0;
    }
    /deep/.row-buttons {
      text-align: right;
    }
  }
}
</style>
