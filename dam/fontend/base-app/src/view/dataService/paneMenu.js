import chooseTag from '@/view/dataProperty/meta/chooseTag.vue'

export default {
  data() {
    return {
      options: null,
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'children',
      },
      dataDomainCatalog: [],
      menus: [],
      preRemoveId: null,
      catalogArr: [],
      tagsBefore: [],
      choosedTags: [],
    }
  },
  components: {
    chooseTag,
  },
  props: ['typeId', 'itemId', 'path'],
  beforeCreate() {},
  beforeMount() {
    this.getTagsBefore()
  },
  mounted() {
    this.$getCatAndTags(() => {
      this.createOptions()
      this.$http
        .get(
          this.$url +
            `/service/catalogs/types/${this.typeId}/items/${this.itemId}/path`
        )
        .then(res => {
          const menus = []
          res.data.forEach(m => {
            const menu = []
            m.forEach(item => {
              if (item.id) {
                menu.push(item.id)
              }
            })
            if (menu.length > 0) {
              menus.push(menu)
            } else {
              menus.push([])
            }
          })
          if (!res.data || res.data.length === 0) {
            menus.push([])
          }
          this.menus = menus
        })
        .catch(e => {
          this.dataDomainCatalog = this.path
          this.$showFailure(e)
        })
    })
  },
  methods: {
    handleAddTag(tagId) {
      this.addTag([tagId])
    },
    editTags() {
      this.$nextTick(() => {
        this.choosedTags = this.tagsBefore.map(item => item.tagId)
        if (this.$refs.addTag && this.$refs.addTag.showDialog) {
          this.$refs.addTag.showDialog()
        }
      })
    },
    createOptions() {
      const options = []
      this.$globalData.catalogs.children.forEach(item => {
        if (item.name !== '主题域目录') {
          options.push(item)
        }
      })
      this.options = options
    },
    api() {
      // delete
      // post /service/catalogs/10/0ddda450e73144b4849317444414f60b?typeId=80010066
    },
    getCId(index) {
      if (this.menus[index]) {
        return this.menus[index][this.menus[index].length - 1]
      } else {
        return null
      }
    },
    handleFocus(index) {
      this.preRemoveId = this.getCId(index)
    },
    unbind(cId, index, callback) {
      if (cId) {
        this.$http
          .delete(
            `${this.$url}/service/catalogs/unbind/${cId}/objects/${this.itemId}?typeId=${this.typeId}`
          )
          .then(res => {
            if (callback) {
              this.preRemoveId = this.getCId(index)
              callback(this.getCId(index))
            } else {
              this.$message.success(this.$version.common.operationSucceed)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        if (callback) {
          callback(this.getCId(index))
        }
      }
    },
    bind(cId) {
      if (cId) {
        this.$http
          .post(
            `${this.$url}/service/catalogs/${cId}/${this.itemId}?typeId=${this.typeId}`
          )
          .then(res => {
            this.$message.success(this.$version.common.operationSucceed)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleChange(index) {
      this.unbind(this.preRemoveId, index, index => {
        this.bind(index)
      })
    },
    appendMenu() {
      this.menus.push([])
    },
    removeMenu(index) {
      if (this.menus[index].length > 0) {
        this.$confirm('确定要删除该目录吗？', '', {
          type: 'warning',
        })
          .then(() => {
            this.unbind(this.getCId(index), index)
            this.menus.splice(index, 1)
          })
          .catch(() => {})
      } else {
        this.menus.splice(index, 1)
      }
    },
    callTagSelector() {
      this.$bus.$off('tagSelected')
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        this.currentTag = keys || []
        this.tagNames = names || []
        this.bindTags()
      })
      this.tagsBefore = this.tagsBefore || []
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        single: true,
        tagsBefore: this.tagsBefore.map(item => item.tagId),
      })
    },
    getTagsBefore() {
      const url =
        this.$url +
        `/service/tags/getTagsOfItem?itemId=${this.itemId}&withoutCategory=true&type=${this.typeId}`
      this.$http
        .get(url)
        .then(res => {
          this.tagsBefore = res.data
          this.$emit('updateTags', this.tagsBefore)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bindTags() {
      const plus = _.difference(
        this.currentTag,
        this.tagsBefore.map(item => item.tagId)
      )
      const diff = _.difference(
        this.tagsBefore.map(item => item.tagId),
        this.currentTag
      )
      if (plus.length > 0 && diff.length > 0) {
        this.removeTag(diff, () => {
          this.addTag(plus)
        })
      } else if (plus.length > 0) {
        this.addTag(plus)
      } else if (diff.length > 0) {
        this.removeTag(diff)
      }
    },
    addTag(list, callback) {
      list.forEach((item, index, arr) => {
        arr[index] = String(item)
      })
      const url = this.$url + '/tags/addTagRelations'
      this.$http
        .post(url, {
          tagIds: list,
          itemIds: [this.itemId],
          type: this.typeId, // Domain
          recursive: true,
        })
        .then(res => {
          if (callback) {
            callback()
          } else {
            this.$message.success(this.$version.common.operationSucceed)
            this.getTagsBefore()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeTag(list, callback) {
      const url = this.$url + '/service/tags/removeTagsToItems'
      this.$http
        .post(url, {
          tagIds: list,
          itemIds: [this.itemId],
          type: this.typeId,
        })
        .then(res => {
          if (callback) {
            setTimeout(() => {
              callback()
            }, 0)
          } else {
            this.$message.success(this.$version.common.operationSucceed)
            this.getTagsBefore()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  computed: {},
  watch: {},
}
