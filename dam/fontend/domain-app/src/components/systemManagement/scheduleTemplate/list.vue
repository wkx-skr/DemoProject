<template>
  <div class="container" v-loading="isLoading">
    <datablau-list-search>
      <datablau-input
        v-model="keyword"
        :placeholder="$t('system.systemSetting.fillKeyword')"
        clearable
      ></datablau-input>
      <template slot="buttons">
        <datablau-button
          type="important"
          @click="addItem"
          style=""
          class="iconfont icon-tianjia tab-tianjia-btn"
        >
          {{ $t('system.systemSetting.createTimeTemp') }}
        </datablau-button>
      </template>
    </datablau-list-search>
    <div class="box-container">
      <div
        class="box"
        v-for="(b, idx) in boxsDisplay"
        :key="idx"
        :class="{ disabled: b.state === 0 }"
      >
        <div
          class="title oneline-eclipse"
          :title="b.name && b.name.length > 14 ? b.name : null"
        >
          {{ b.name }}
        </div>
        <div
          class="description two-line-eclipse"
          :title="
            b.description && b.description.length > 72 ? b.description : null
          "
        >
          {{ b.description }}
        </div>
        <div class="btn-line">
          <datablau-button type="text" @click.stop="editAccess(b)">
            <span v-if="b.state === 1">{{ $t('common.button.disable') }}</span>
            <span v-else>{{ $t('system.systemSetting.enable') }}</span>
          </datablau-button>
          <datablau-button type="text" @click.stop="handleEdit(b)">
            {{ $t('common.button.edit') }}
          </datablau-button>
          <datablau-button type="text" @click.stop="handleExport(b)">
            {{ $t('common.button.export') }}
          </datablau-button>
          <datablau-button type="text" @click.stop="preDelete(b)">
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
      </div>
      <empty-page v-show="showEmptyPage" :keyword="keyword"></empty-page>
    </div>
    <edit-item
      v-if="showEditItem"
      class="edit-item"
      :current-data="currentData"
      @close="handleCloseEditItem"
      @reload="getTemplateList"
    ></edit-item>
  </div>
</template>

<script>
import EditItem from './editItem.vue'
import EmptyPage from './emptyPage.vue'
export default {
  components: {
    EditItem,
    EmptyPage,
  },
  data() {
    return {
      keyword: '',
      boxs: [],
      showEditItem: false,
      currentData: null,
      isLoading: true,
    }
  },
  beforeMount() {
    this.getTemplateList()
  },
  methods: {
    getTemplateList() {
      this.isLoading = true
      this.$http
        .post(this.$job_url + `/dateTemplate/list`)
        .then(res => {
          this.boxs = res.data
          this.isLoading = false
        })
        .catch(e => {
          this.isLoading = false
          this.$showFailure(e)
        })
    },
    addItem() {
      this.currentData = null
      this.showEditItem = true
    },
    editItem(item) {
      this.currentData = _.cloneDeep(item)
      this.showEditItem = true
    },
    editAccess(item) {
      const requestUrl = this.$url + `/service/dateTemplate/update`
      const requestBody = item
      requestBody.state = requestBody.state ? 0 : 1
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEdit(item) {
      this.editItem(item)
    },
    handleExport(item) {
      this.$downloadFilePost(
        this.$url + '/service/dateTemplate/exportDates?id=' + item.id
      )
    },
    preDelete(item) {
      this.$DatablauCofirm(
        this.$t('system.systemSetting.delTempConfirm', { name: item.name }),
        ''
      ).then(() => {
        this.deleteTemplate(item)
      })
    },
    deleteTemplate(item) {
      this.$http
        .post(this.$url + `/service/dateTemplate/delete?id=${item.id}`)
        .then(() => {
          this.getTemplateList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCloseEditItem() {
      this.currentData = null
      this.showEditItem = false
    },
  },
  computed: {
    boxsDisplay() {
      const keyword = _.trim(_.lowerCase(this.keyword))
      return this.boxs.filter(i => {
        return (
          _.lowerCase(i.name).includes(keyword) ||
          _.lowerCase(i.description).includes(keyword)
        )
      })
    },
    showEmptyPage() {
      return (
        !this.isLoading && this.boxsDisplay.length === 0 && !this.showEditItem
      )
    },
  },
}
</script>

<style scoped lang="scss">
@import './list';
</style>
