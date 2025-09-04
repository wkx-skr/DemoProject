import list from './list.vue'
import tabPane from './tabPane.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import emptyPage from './emptyPage.vue'
export default {
  components: {
    list,
    tabPane,
    emptyPage,
  },
  data() {
    return {
      dialogVisible: false,
      form: {
        groupName: null,
        note: null,
        creator: null,
        createTime: null,
        updater: null,
        updateTime: null,
      },
      groupTitle: '',
      rules: {
        groupName: {
          required: 'true',
          trigger: 'blur',
          message: '请填入用户组名',
        },
      },
      showEmptyPage: false,
    }
  },
  mounted() {
    this.initResizeHorizontal()
  },
  methods: {
    showTreeData(val) {
      this.showEmptyPage = !(val.length > 0)
    },
    showAdd() {
      this.groupTitle = this.$t('system.userGroup.addGroup')
      this.dialogVisible = true
      this.form.groupName = null
      this.form.note = null
    },
    editGroup(val) {
      const _tmp = JSON.stringify(val)
      this.form = JSON.parse(_tmp)
      this.dialogVisible = true
      this.groupTitle = this.$t('system.userGroup.editGroup')
    },
    addGroup() {
      const nowDate = new Date().getTime()
      const requestBody = {
        groupName: this.form.groupName,
        note: this.form.note,
        creator:
          this.groupTitle === this.$t('system.userGroup.addGroup')
            ? this.$user.username
            : this.form.creator,
        createTime:
          this.groupTitle === this.$t('system.userGroup.addGroup')
            ? nowDate
            : this.form.createTime,
        updater:
          this.groupTitle === this.$t('system.userGroup.addGroup')
            ? ''
            : this.$user.username,
        updateTime:
          this.groupTitle === this.$t('system.userGroup.addGroup')
            ? ''
            : nowDate,
      }
      if (this.groupTitle === this.$t('system.userGroup.addGroup')) {
        if (
          this.form.groupName === null ||
          this.form.groupName.replace(/\s+/g, '') === ''
        ) {
          this.$message.warning(this.$t('system.userGroup.fillGroupName'))
        } else {
          this.$http
            .post(this.$user_url + '/org/groups', requestBody)
            .then(res => {
              // this.$refs.listTree.getAllGroup();
              this.$bus.$emit('getTreeData', this.form.groupName)
              this.$message.success(this.$t('system.userGroup.addSucceed'))
              this.dialogVisible = false
              this.showEmptyPage = false
            })
            .catch(e => {
              if (e !== undefined) {
                this.$message.error(this.$t('system.userGroup.reFill'))
              }
            })
        }
      } else {
        requestBody.id = this.form.id
        if (
          this.form.groupName.replace(/\s+/g, '') === null ||
          this.form.groupName.replace(/\s+/g, '') === ''
        ) {
          this.$message.warning(this.$t('system.userGroup.fillGroupName'))
        } else {
          this.$http
            .put(this.$user_url + '/org/groups', requestBody)
            .then(res => {
              // this.$refs.listTree.getAllGroup();
              this.$bus.$emit('getTreeData', this.form.groupName)
              this.$message.success(this.$t('system.userGroup.editSucceed'))
              this.dialogVisible = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    cancel() {
      this.dialogVisible = false
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.left-tree'),
          middleDom: $('.user-group-line'),
          rightDom: $('.right-table'),
          noCrack: true,
          minWith: { leftMinWidth: 240 },
        })
      }, 1000)
    },
  },
}
