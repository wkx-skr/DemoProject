<template>
  <div class="drawerCon" v-loading="loading">
    <datablau-form
      class="add-form"
      label-position="right"
      label-width="0"
      :model="formData"
    >
      <!--安全属性-->
      <datablau-detail-subtitle
        title="安全属性"
        mb="5px"
      ></datablau-detail-subtitle>
      <div class="security">
        <checkboxCom
          :list="securityAttributesList"
          :oldNameList="oldNameList"
          @checkChange="checkChange1"
          ref="security"
        ></checkboxCom>
      </div>
      <!--数据标签-->
      <datablau-detail-subtitle
        title="数据标签"
        mb="5px"
      ></datablau-detail-subtitle>
      <div class="dataLabel">
        <checkboxCom
          :list="dataTag"
          :oldNameList="oldNameList"
          @checkChange="checkChange2"
          ref="dataLabel"
        ></checkboxCom>
      </div>
      <!--扩展属性-->
      <datablau-detail-subtitle
        title="扩展属性"
        mb="5px"
      ></datablau-detail-subtitle>
      <div class="properties">
        <checkboxCom
          :list="udpsAry"
          @checkChange="checkChange3"
          :oldNameList="oldNameList"
          ref="properties"
        ></checkboxCom>
      </div>
    </datablau-form>
  </div>
</template>

<script>
import checkboxCom from '@/view/dataSecurity/accessStrategy/components/checkboxCom'
import HTTP from '../../util/api'
export default {
  components: { checkboxCom },
  props: {
    drawer: {
      type: Boolean,
      default: false,
    },
    surfaceId: {
      type: Number,
    },
    oldNameList: {
      type: Array,
    },
  },
  watch: {
    surfaceId: {
      handler(val) {
        this.getUdpsList()
      },
      immediate: true,
      deep: true,
    },
    // oldNameList: {
    //   handler(val) {
    //     if (!val.length) {
    //       // this.getTagTree()
    //     }
    //   },
    //   immediate: true,
    //   deep: true,
    // },
  },
  data() {
    return {
      formData: {},
      allList: [],
      allsecurity: false,
      time: null,
      loading: false,
      // safety: false, // 安全等级的详情
      // safetyShow: false, // 安全等级的更多按钮
      // safetyCheckBoxHeight: 'auto',
      securityAttributes: [
        '安全等级',
        '重要程度',
        '影响对象',
        '影响范围',
        '影响程度',
      ],
      securityAttributesList: [], // 安全属性
      dataTag: [], // 标签
      udpsAry: [],
      objJson1: { nameList: [], tagIdAry: [] },
      objJson2: { nameList: [], tagIdAry: [] },
      objJson3: { nameList: [], tagIdAry: [] },
    }
  },
  methods: {
    checkChange1(obj) {
      this.objJson1 = obj
      this.emitChange()
    },
    checkChange2(obj) {
      this.objJson2 = obj
      this.emitChange()
    },
    checkChange3(obj) {
      this.objJson3 = obj
      this.emitChange()
    },
    emitChange() {
      this.$emit('drawerSelect', {
        nameList: [
          ...this.objJson1.nameList,
          ...this.objJson2.nameList,
          ...this.objJson3.nameList,
        ],
        tagIdAry: [
          ...this.objJson1.tagIdAry,
          ...this.objJson2.tagIdAry,
          ...this.objJson3.tagIdAry,
        ],
      })
    },
    // 获取属性
    getUdpsList() {
      this.loading = true
      HTTP.customAttr(this.surfaceId)
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            let ary = res.data.filter(item => item.type !== 'NUM_RANGE')
            ary.forEach(item => {
              item.content = {
                tagId: item.id,
              }
              item.refName = 'tagName' + item.content.tagId
              item['tagName' + item.content.tagId + 'Show'] = false
              item['tagName' + item.content.tagId + 'Type'] = false // 判断按钮样式和文字
              item['tagName' + item.content.tagId + 'Height'] = 'auto'
              if (item.type === 'ENUM') {
                item.children = item.typeData.split(/\n|,/g)
              } else if (item.type === 'BOOL') {
                item.children = ['true', 'false']
              }
            })
            this.udpsAry = ary
            this.refsEach()
          }
          this.loading = false
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 获取标签树
    getTagTree() {
      this.loading = true
      this.$http
        .get(this.$url + '/service/tags/tree')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            let ary = []
            res.data.forEach(item => {
              ary.push(...item.children)
            })
            ary.forEach(item => {
              item.refName = 'tagName' + item.content.tagId // 判断高度 是否要显示更多按钮的ref名
              item['tagName' + item.content.tagId + 'Show'] = false // 按钮是否显示
              item['tagName' + item.content.tagId + 'Type'] = false // 判断按钮样式和文字
              item['tagName' + item.content.tagId + 'Height'] = 'auto' // 详情的高度
              if (item.name === '数据安全等级') {
                item.name = '安全等级'
              }
              if (this.securityAttributes.indexOf(item.name) !== -1) {
                this.securityAttributesList.push(item)
              } else {
                this.dataTag.push(item)
              }
            })
            this.allList = [...this.securityAttributesList, ...this.dataTag]
            this.refsEach()
            this.loading = false
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    refsEach() {
      this.$nextTick(() => {
        let ary = []
        let heightElse = []
        for (let key in this.$refs) {
          for (let k in this.$refs[key].$refs) {
            if (
              this.$refs[key].$refs[k][0] &&
              this.$refs[key].$refs[k][0].scrollHeight > 65
            ) {
              ary.push(k)
            }
          }
        }
        this.allList.forEach(item => {
          if (ary.indexOf(item.refName) !== -1) {
            item[item.refName + 'Height'] = '65px'
            item[item.refName + 'Show'] = 'true'
          }
        })
      })
    },
  },
  mounted() {
    this.getTagTree()
  },
}
</script>

<style scoped lang="scss">
.drawerCon {
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: scroll;
  padding: 20px 0;
}
</style>
