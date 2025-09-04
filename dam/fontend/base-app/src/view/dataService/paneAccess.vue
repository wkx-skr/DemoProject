<template>
  <div class="citic-form">
    <el-dialog
      title="选择权限组"
      :visible.sync="departmentVisible"
      width="800px"
      append-to-body
      class="depart-dialog"
      :close-on-click-modal="false"
    >
      <department-select
        ref="departmentSelect"
        @confirmChoose="confirmChoose"
        :choosedDepartments="choosedDepartments"
      ></department-select>
    </el-dialog>
    <div class="title">权属属性</div>
    <el-form size="mini" label-width="10em" label-position="right">
      <!-- <el-form-item
        label="本租户是否可见"
        required
      >
        <el-switch
          v-model="isVisibleInside"
          active-color="#D20A10"
        ></el-switch>
      </el-form-item> -->
      <!-- <el-form-item
        label="跨租户是否可见"
        required
      >
        <el-switch
          v-model="isVisibleOutside"
          active-color="#D20A10"
        ></el-switch>
      </el-form-item> -->
      <el-form-item label="可见权限">
        <el-radio
          :value="showWhiteList"
          @change="handleRadioClick(true)"
          :label="true"
        >
          可见权限组
        </el-radio>
        <el-radio
          :value="showWhiteList"
          @change="handleRadioClick(false)"
          :label="false"
        >
          不可见权限组
        </el-radio>
      </el-form-item>
      <el-form-item>
        <div class="department department-list">
          <el-tag
            type="info"
            v-for="item in tagArr"
            closable
            :key="item.id"
            @close="handlerRemoveTag(item.id)"
          >
            {{ item.name }}
          </el-tag>
          <span class="text" @click="chooseDemp">
            添加{{ showWhiteList ? '' : '不' }}可见权限组
          </span>
        </div>
      </el-form-item>
      <el-form-item label="">
        <el-button type="primary" @click="submitWhiteList">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import departmentSelect from '../department/departmentSelect.vue'
export default {
  data() {
    return {
      isVisibleInside: true,
      isVisibleOutside: false,
      showWhiteList: true,
      tagArr: [],
      whiteList: [],
      blackList: [],
      typeId: '',
      itemId: '',

      /* department dialog */
      departmentVisible: false,
      choosedDepartments: [],
    }
  },
  components: { departmentSelect },
  props: {
    itemData: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      if (!this.itemData) return
      // console.log(this.itemData, 'this.itemData')
      if (this.itemData.dataServiceId) {
        this.itemId = this.itemData.dataServiceId
        this.typeId = '82800005'
      } else if (this.itemData.domainId) {
        this.itemId = this.itemData.domainId
        this.typeId = '80010066'
      } else if (this.itemData.type === 'catalog') {
        this.itemId = this.itemData.id
        this.typeId = 'catalog'
      } else if (this.itemData.sharePath) {
        this.itemId = this.itemData.id
        this.typeId = this.$commentPreCode.ShareFile
      }

      this.getDepartList()
    },
    getDepartList() {
      const typeId = this.typeId
      const itemId = this.itemId
      const catalogId = this.itemData.id
      let url = ''
      if (typeId === 'catalog') {
        url = `${this.$url}/service/branches/catalogs/${catalogId}`
      } else {
        url = `${this.$url}/service/branches/types/${typeId}/items/${itemId}`
      }
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          // console.log(data, 'data')
          const branches = data.branches || []
          const arr = [...branches]
          this.showWhiteList = data.whiteList
          this.tagArr = arr

          this.$nextTick(() => {
            if (arr && Array.isArray(arr)) {
              this.tagArr = arr.map(item => {
                const obj = {
                  id: item.id,
                  name: item.name,
                }
                return obj
              })
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /* department dialog */
    chooseDemp() {
      this.choosedDepartments = this.tagArr
      this.departmentVisible = true
      if (
        this.$refs.departmentSelect &&
        this.$refs.departmentSelect.setCheckedNodes
      ) {
        this.$refs.departmentSelect.setCheckedNodes(
          this.tagArr.map(item => item.id)
        )
      }
    },
    confirmChoose(para) {
      const tagArr = []
      const selections = para.selections
      // console.log(selections, 'selections')
      if (selections && Array.isArray(selections)) {
        selections.forEach(item => {
          const obj = {
            id: item.id,
            name: item.name,
          }
          tagArr.push(obj)
        })
        this.tagArr = tagArr
      }
      this.departmentVisible = false
    },
    submitWhiteList() {
      const whiteList = this.showWhiteList
      const typeId = this.typeId
      const itemId = this.itemId
      const para = this.tagArr
      const catalogId = this.itemData.id
      let url = ''
      if (typeId === 'catalog') {
        url = `${this.$url}/service/branches/catalogs/${catalogId}?whiteList=${whiteList}`
      } else {
        url = `${this.$url}/service/branches/types/${typeId}/items/${itemId}?whiteList=${whiteList}`
      }
      this.$http
        .post(url, para)
        .then(res => {
          this.$message.success('设置成功')
          this.$emit('submitSuccess')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlerRemoveTag(id) {
      const arr = this.tagArr.filter(item => item.id !== id)
      this.tagArr = arr
    },
    handleRadioClick(target) {
      let text = `确定要将"可见权限"切换到"${target ? '' : '不'}可见权限组"吗？`
      if (this.tagArr && this.tagArr.length > 0) {
        text += `${!target ? '' : '不'}可见权限组列表中包含${
          this.tagArr.length
        }个权限组，将被不可逆的清空。`
      }
      this.$confirm(text, '', {
        type: 'warning',
      })
        .then(() => {
          this.showWhiteList = target
        })
        .catch(() => {})
    },
  },
  computed: {},
  watch: {
    showWhiteList(newVal) {
      this.tagArr = newVal ? this.whiteList : this.blackList
      this.tagArr = []
    },
  },
}
</script>
<style lang="scss" scoped>
.department-list {
  width: 380px;

  padding: 0.8em;
  border: 1px solid #dddddd;
  .text {
    display: inline-block;
    width: 100%;
    font-size: 12px;
    text-align: center;
    color: #898989;
    margin-top: 0.9em;
    cursor: pointer;
    &:hover {
      color: #494850;
    }
  }
  .el-tag {
    height: 30px;
    background: #efefef;
    border-radius: 3px;
    font-size: 12px;
    margin-right: 15px;
    margin-bottom: 10px;
  }
}
</style>
<style lang="scss">
.depart-dialog {
  .el-dialog__body {
    position: relative;
    // border: 1px solid red;
    min-height: 500px;
    height: 40vh;
    .tree-search-box {
      padding-top: 15px;
    }

    .tree-box {
      // border: 1px solid red;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 60px;
      overflow: auto;
    }

    .bottom-line {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      // border: 1px solid red;
      padding: 12px 20px 0;
      box-sizing: border-box;
      text-align: right;
    }
  }
}
</style>
