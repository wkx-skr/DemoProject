<template>
  <div class="data-standard-field" v-loading="loadingDetail">
    <datablau-dialog
      :custom-class="'domain-field-edit edit-folder-dialog'"
      :title="`${
        currentCategoryData && currentCategoryData.id !== 'add'
          ? $t('domain.common.edit')
          : $t('domain.common.add')
      }${$t('domain.common.spacing')}${$t('domain.domain.fieldDomainGroup')}`"
      :visible.sync="editCategoryVisible"
      :close-on-click-modal="false"
      size="m"
    >
      <edit-folder
        v-if="editCategoryVisible"
        ref="editFolder"
        @cancel="cancelEdit"
        @saveSuccess="folderSaveSuccess"
        :defaultData="currentCategoryData"
        :folderList="folderList"
      ></edit-folder>
      <span slot="footer">
        <datablau-button type="secondary" @click="editCategoryVisible = false">
          {{ $t('domain.common.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="dialogConfirm">
          {{ $t('domain.common.confirm') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="inner-content">
      <datablau-page-title
        :parent-name="$t('common.page.domain')"
        :name="pageName"
      ></datablau-page-title>
      <div class="list-outer">
        <field-list
          ref="fieldList"
          @rowClick="rowClick"
          @addFolder="addFolder"
          @getAllData="getAllData"
          :hasManageAuth="hasManageAuth"
        ></field-list>
      </div>
    </div>
    <div class="full-cover-dialog" v-if="showDialogType && currentCategoryId">
      <div class="edit-folder-dialog" v-if="showDialogType === 'authority'">
        <user-list
          :categoryId="currentCategoryId"
          :pathData="pathData"
          @backClick="backClick"
        ></user-list>
      </div>
      <div class="edit-folder-dialog" v-if="showDialogType === 'showDomain'">
        <domain-folder-detail
          :categoryId="currentCategoryId"
          @backClick="backClick"
          :hasEditAuth="hasEditAuth"
          :pathData="pathData"
        ></domain-folder-detail>
      </div>
      <div class="edit-folder-dialog" v-if="showDialogType === 'showCode'">
        <code-folder-detail
          :categoryId="currentCategoryId"
          @backClick="backClick"
          :hasEditAuth="hasEditAuth"
          :pathData="pathData"
        ></code-folder-detail>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import fieldList from './fieldList'
import editFolder from './editFolder'
import domainFolderDetail from './domainFolderDetail'
import codeFolderDetail from './codeFolderDetail'
import userList from './userList'

export default {
  data() {
    return {
      pageName: this.$t('common.page.dataStandardField'),
      showDialogType: '',
      currentCategoryId: '',
      currentCategoryData: { id: 'add' },
      editCategoryVisible: false,
      hasEditAuth: false,
      loadingDetail: false,
      pathData: [],
      folderList: null,
      hasManageAuth: true,
    }
  },
  components: {
    fieldList,
    editFolder,
    domainFolderDetail,
    codeFolderDetail,
    userList,
  },
  computed: {},
  created() {
    this.hasManageAuth = HTTP.$appName.toUpperCase() === 'DAM' || !this.$damEnabled
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      // console.log('dataInit')
    },
    rowClick({ type, para }) {
      para = _.cloneDeep(para)
      let pathData = [this.$t('domain.fieldDomain.fieldDomain'), para.data.name]
      if (type === 'editFolder') {
        this.editFolder(para)
      } else if (type === 'deleteFolder') {
        this.deleteFolder(para)
      } else {
        if (type === 'showDomain') {
          pathData.push(this.$t('domain.common.dataStandard'))
        } else if (type === 'showCode') {
          pathData.push(this.$t('domain.common.domainCode'))
        } else {
          pathData.push(this.$t('domain.fieldDomain.permissionManage'))
        }
        // pathData.push()
        this.loadingDetail = true
        HTTP.getFolderAuthService({
          folderId: para.data.id,
          username: this.$user.username,
        })
          .then(res => {
            let data = res.data
            if (data === 'ADMIN' || data === 'WRITE') {
              this.hasEditAuth = true
            }
            if (data !== 'NONE') {
              this.showDialogType = type
              this.currentCategoryId = para.data.id
              this.currentCategoryData = para.data
            } else {
              this.$message.info(this.$t('domain.fieldDomain.needAuditMessage'))
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .finally(() => {
            this.loadingDetail = false
          })
      }

      this.pathData = pathData
    },
    getAllData(folderList) {
      if (this.$route.query.domainId && this.$route.query.categoryId) {
        let data = folderList.filter(
          item => item.id === this.$route.query.categoryId - 0
        )[0]
        let showType =
          this.$route.query.showType === 'code' ? 'showCode' : 'showDomain'
        if (showType === 'showCode') {
          const query = this.$route.query
          query.code = query.domainId
          const newQuery = _.pick(query, 'code', 'showType')
          this.$router.replace({ query: newQuery })
        }
        this.rowClick({
          type: showType,
          para: { data },
        })
      } else {
        this.folderList = folderList
      }
    },
    editFolder(para) {
      // console.log(para, 'para')
      this.currentCategoryData = para.data
      this.currentCategoryId = para.data.id
      this.editCategoryVisible = true
    },
    addFolder() {
      // this.showDialogType = 'editFolder'
      this.currentCategoryData = { id: 'add' }
      this.currentCategoryId = 'add'
      this.editCategoryVisible = true
    },
    cancelEdit() {
      // this.showDialogType = null
      this.editCategoryVisible = false
    },
    folderSaveSuccess() {
      this.showDialogType = null
      this.editCategoryVisible = false
      this.updateList()
    },
    updateList() {
      if (this.$refs.fieldList && this.$refs.fieldList.refreshList) {
        this.$refs.fieldList.refreshList()
      }
    },
    backClick() {
      const query = this.$route.query
      const newQuery = _.omit(query, 'categoryId', 'showType', 'code')
      this.$router.replace({ query: newQuery })
      this.showDialogType = null
    },
    dialogConfirm() {
      if (this.$refs.editFolder && this.$refs.editFolder.addFolder) {
        this.$refs.editFolder.addFolder()
      }
    },
    deleteFolder() {
      this.updateList()
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.data-standard-field {
  @include absPos();
  background-color: #fff;

  .inner-content {
    @include absPos();
    z-index: 3;

    .list-outer {
      @include absPos();
      top: 38px;
      // left: 20px;
      // right: 20px;
      //border: 1px solid red;
    }
  }

  .full-cover-dialog {
    @include absPos();
    background-color: #fff;
    z-index: 5;
  }

  /deep/ .tree-area {
    border-top: none;
  }
}
</style>

<style lang="scss">
//.el-dialog__wrapper[data-v-7e7fa410] .el-dialog .el-dialog__body
.el-dialog.domain-field-edit.edit-folder-dialog {
  .el-dialog__body {
    padding-top: 0;
  }
}
</style>
