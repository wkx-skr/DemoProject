<!--目录空间设置-->
<template>
  <div style="width: 100%; height: 100%; background: #fff">
    <div class="structure">
      <div v-if="listShow">
        <div class="title flex spaceBetween">
          <div>{{ $t('assets.directoryStructure.structureSettings') }}</div>
        </div>
        <div class="">
          <div class="spaceBetween flex tabChang">
            <datablau-tabs
              v-model="activeName"
              type="card"
              @tab-click="activeNameClick"
            >
              <el-tab-pane
                :label="
                  $t('assets.directoryStructure.all') + '(' + totalNum + ')'
                "
                name="first"
              ></el-tab-pane>
              <el-tab-pane
                :label="
                  $t('assets.directoryStructure.activated') +
                  '(' +
                  enableNum +
                  ')'
                "
                name="second"
              ></el-tab-pane>
              <el-tab-pane
                :label="
                  $t('assets.directoryStructure.notActivated') +
                  '(' +
                  unenableNum +
                  ')'
                "
                name="third"
              ></el-tab-pane>
            </datablau-tabs>
            <div class="newDirectory">
              <datablau-button
                type="important"
                class="iconfont icon-tianjia"
                @click="primary"
              >
                {{ $t('assets.directoryStructure.newDirectoryStructure') }}
              </datablau-button>
            </div>
          </div>
          <div class="tables">
            <datablau-form-submit class="table-row" ref="tableOuter">
              <datablau-table
                height="100%"
                class="el-table datablau-table"
                ref="deTable"
                :data="structureList"
                row-key="id"
                v-loading="loading"
                tooltip-effect="dark"
                :showColumnSelection="false"
                border
              >
                <el-table-column width="20px">
                  <template>
                    <i class="iconfont icon-drag dragIcon"></i>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="name"
                  :label="$t('assets.directoryStructure.assetName')"
                  show-overflow-tooltip
                  width="200px"
                >
                  <template scope="{row}">
                    <datablau-tooltip
                      placement="bottom"
                      effect="dark"
                      popper-class="tooltipBox"
                      :content="$t('assets.directoryStructure.inuse')"
                      v-if="row.openStatus"
                    >
                      <img
                        class="useIcon"
                        src="/static/images/dataAssets/inuse.svg"
                        alt=""
                      />
                    </datablau-tooltip>
                    <datablau-tooltip
                      placement="bottom"
                      effect="dark"
                      popper-class="tooltipBox"
                      :content="$t('assets.directoryStructure.uninuse')"
                      v-else
                    >
                      <img
                        class="useIcon"
                        src="/static/images/dataAssets/uninuse.svg"
                        alt=""
                      />
                    </datablau-tooltip>
                    {{ row.name }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="processName"
                  :label="$t('assets.directoryStructure.assetCatalogs')"
                  show-overflow-tooltip
                  width="100px"
                >
                  <template scope="{row}">
                    <span class="level">{{ row.detailDtos.length }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="structureManagerDto"
                  :label="$t('assets.directoryStructure.directoryManager')"
                  show-overflow-tooltip
                >
                  <template scope="{row}">
                    {{ row.manager && row.manager.join('，') }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="approver"
                  :label="$t('assets.directoryStructure.approvers')"
                  show-overflow-tooltip
                >
                  <template scope="{row}">
                    {{ row.approverDto && formatApprover(row.approverDto) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="openStatus"
                  :label="$t('assets.directoryStructure.structureStatus')"
                  show-overflow-tooltip
                  width="100px"
                >
                  <template scope="{row}">
                    <span v-if="row.openStatus" class="openStatus">
                      {{ $t('assets.directoryStructure.enable') }}
                    </span>
                    <span v-else class="noStatus">
                      {{ $t('assets.directoryStructure.disableds') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="catalogStraightPublish"
                  :label="$t('assets.directoryStructure.approvalProcess')"
                  show-overflow-tooltip
                  width="100px"
                >
                  <template scope="{row}">
                    <span v-if="row.catalogStraightPublish" class="openStatus">
                      {{ $t('assets.directoryStructure.enable') }}
                    </span>
                    <span v-else class="noStatus">
                      {{ $t('assets.directoryStructure.disableds') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="assetsStraightPublish"
                  :label="$t('assets.directoryStructure.dataAsset')"
                  show-overflow-tooltip
                  width="100px"
                >
                  <template scope="{row}">
                    <span v-if="row.assetsStraightPublish" class="openStatus">
                      {{ $t('assets.directoryStructure.enable') }}
                    </span>
                    <span v-else class="noStatus">
                      {{ $t('assets.directoryStructure.disableds') }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="processName"
                  :label="$t('assets.directoryStructure.operate')"
                  show-overflow-tooltip
                  width="80"
                >
                  <template scope="{row}">
                    <div class="iconBox">
                      <datablau-button type="icon">
                        <datablau-tooltip
                          placement="bottom"
                          effect="dark"
                          popper-class="tooltipBox"
                          :content="$t('assets.directoryStructure.edit')"
                        >
                          <i
                            class="iconfont icon-bianji"
                            @click="edit(row)"
                          ></i>
                        </datablau-tooltip>
                      </datablau-button>
                      <datablau-button type="icon" v-if="!row.openStatus">
                        <datablau-tooltip
                          placement="bottom"
                          effect="dark"
                          popper-class="tooltipBox"
                          v-if="!row.openStatus"
                          :content="$t('assets.directoryStructure.delete')"
                        >
                          <i
                            :class="[
                              'iconfont',
                              'icon-delete',
                              { green: row.openStatus },
                            ]"
                            @click="delet({ item: row })"
                          ></i>
                        </datablau-tooltip>
                      </datablau-button>
                      <datablau-tooltip
                        placement="bottom"
                        effect="dark"
                        popper-class="tooltipBox"
                        v-else
                        :content="$t('assets.directoryStructure.noDel')"
                      >
                        <i
                          :class="[
                            'iconfont',
                            'icon-delete',
                            { green: row.openStatus },
                          ]"
                          @click="delet({ item: row })"
                        ></i>
                      </datablau-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </datablau-table>
            </datablau-form-submit>
          </div>
        </div>
      </div>
      <div v-if="!listShow">
        <datablau-breadcrumb
          class="title borderBtm"
          :node-data="nodeData1"
          :separator="'/'"
          @back="returnList"
        ></datablau-breadcrumb>
        <div class="con">
          <!--        目录空间-->
          <structureDetail
            :structure="structureComData"
            :options="options"
            :user="user"
            :oldStructure="oldStructure"
            :structureList="structureList"
            @getAllUserPage="getAllUserPage"
            @settingClose="settingClose"
            @saveItem="saveItem"
            @cancelbtn="returnList"
            @setOptions="setOptions"
            @setOld="setOld"
          ></structureDetail>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import structureDetail from '../components/structureDetailItem'
import Sortable from 'sortablejs'
import HTTP from '../utils/api'
export default {
  components: { structureDetail },
  data() {
    return {
      activeName: 'first',
      allPutAway: false, // 全部收起
      addStructure: false,
      options: [],
      structuresList: [],
      upDown: this.$t('assets.directoryStructure.collapseAll'),
      from: {}, // 新建目录空间返回的表单
      structureList: null, // 目录列表
      allStrctureList: null,
      loading: false,
      oldRevise: [], // 旧数据
      structureComData: {}, // 列表目录空间
      openStatus: false, // 需要删除 占位
      listShow: true, // 显示列表或者详情
      title: '',
      totalNum: 0,
      enableNum: 0,
      unenableNum: 0,
      user: [],
      oldStructure: {},
      apiObjDrag: [],
    }
  },
  computed: {
    nodeData1() {
      return {
        name: this.$t('assets.directoryStructure.structureSettings'),
        icon: '',
        children: [
          {
            name: this.$t('assets.directoryStructure.structureSettings'),
            couldClick: false,
            children: [
              {
                name:
                  this.title || this.$t('assets.directoryStructure.newAsset'),
                couldClick: false,
              },
            ],
          },
        ],
      }
    },
  },
  methods: {
    // 格式化审批人 姓名（用户名）
    formatApprover(approver) {
      return `${approver.fullUserName}（${approver.username}）`
    },
    // 删除目录管理员
    settingClose(obj) {
      obj.structure.structureManagerDto.forEach((item, index) => {
        if (item === obj.name) {
          obj.structure.structureManagerDto.splice(index, 1)
        }
      })
      this.$set(this.structureList, obj.index, obj.structure)
    },
    // 删除目录类型
    delet(obj) {
      if (obj.item.openStatus) {
        return
      }
      let text = ''
      // 要判断有没有被使用，现在缺字段
      if (obj.item.inUse) {
        // 走接口
        text = `“${obj.item.name}”${this.$t(
          'assets.directoryStructure.confirmText'
        )}`
      } else {
        // 走h5
        text = `“${obj.item.name}”${this.$t(
          'assets.directoryStructure.noExist'
        )}`
      }
      this.$DatablauCofirm(text, this.$t('assets.generalSettings.hint'), {
        cancelButtonText: this.$t('assets.generalSettings.cancelButton'),
        confirmButtonText: this.$t('assets.generalSettings.confirmButton'),
      })
        .then(() => {
          if (obj.item.id) {
            // 走接口
            HTTP.delStructure(obj.item.id)
              .then(res => {
                this.$message.success(
                  this.$t('assets.directoryStructure.successfully')
                )
                this.getStruc()
                this.listShow = true
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            // 走h5
            this.structureList.splice(obj.index, 1)
            this.listShow = true
            this.getStruc()
          }
        })
        .catch(() => {})
    },
    // 保存目录
    saveItem(obj) {
      let { item, openStatus } = obj

      if (!item.name && !openStatus) {
        // this.$datablauMessage({
        //   message: this.$t('assets.directoryStructure.saveItemMes'),
        //   type: 'warning',
        // })
        return
      } else if (!item.approver && !openStatus) {
        // this.$datablauMessage({
        //   message: this.$t('assets.directoryStructure.save'),
        //   type: 'warning',
        // })
        return
      } else if (item.structureManagerDto.length == 0 && !openStatus) {
        // this.$datablauMessage({
        //   message: this.$t('assets.directoryStructure.saveAgain'),
        //   type: 'warning',
        // })
        return
      } else if (item.publicShow === undefined && !openStatus) {
        // this.$datablauMessage({
        //   message: this.$t('assets.directoryStructure.publicShow'),
        //   type: 'warning',
        // })
        return
      } else if (!openStatus) {
        let flag = true
        item.detailDtos.forEach(item => {
          if (!item.catalogTypeId) {
            flag = false
          }
        })
        if (!flag) {
          // this.$datablauMessage({
          //   message: this.$t('assets.directoryStructure.selectAdirectory'),
          //   type: 'warning',
          // })
          return
        }
      }
      let ary = []
      item.structureManagerDto.forEach(k => {
        k && ary.push(k.username || k)
      })
      item.structureManager = ary
      item.detailDtos.forEach(k => {
        let nameObj = this.options.find(v => {
          return v.id === k.catalogTypeId
        })
        !k.catalogTypeName && (k.catalogTypeName = nameObj.name)
      })
      // this.$datablauLoading.loading({ color: '#409EFF' })
      this.loading = true
      // this.$datablauLoading.loading({ color: '#409EFF' })
      !item.id && (item.order = this.structureList.length + 1)
      HTTP.addStructure(item)
        .then(res => {
          // if (!openStatus) {
          this.$blauShowSuccess(
            this.$t('assets.directoryStructure.saveSuccess')
          )
          // this.$datablauLoading.close()
          this.loading = false
          this.listShow = true
          this.getStruc()
          // }
        })
        .catch(e => {
          this.$showFailure(e)
          // this.listShow = false
          // this.$datablauLoading.close()
          this.loading = false
        })
    },
    // 返回目录类型设置
    returnType() {
      this.$router.push('/main/dataAsset/generalSetting')
    },
    returnList() {
      if (
        JSON.stringify(this.structureComData) !==
        JSON.stringify(this.oldStructure)
      ) {
        this.$DatablauCofirm(
          this.$t('assets.directoryStructure.returnCon'),
          this.$t('assets.generalSettings.hint'),
          {
            confirmButtonText: this.$t('assets.generalSettings.confrim'),
            cancelButtonText: this.$t('assets.generalSettings.Leave'),
            cancelButtonClass: 'cancel',
            confirmButtonClass: 'confirm',
          }
        )
          .then(() => {
            this.listShow = true
            this.getStruc()
          })
          .catch(e => {})
        return
      }
      this.listShow = true
      this.getStruc()
    },
    // 列表编辑
    async edit(row) {
      // this.$datablauLoading.loading({ color: '#409EFF' })
      this.loading = true
      // await row.detailDtos.forEach(item => {
      for (let item of row.detailDtos) {
        await HTTP.getTypeDet(item.catalogTypeId)
          .then(res => {
            item.udps = res.data.udps
            let textMula = ''
            let ary = [
              ...res.data.algorithms.staticProperties,
              ...(res.data.algorithms.udpDtoList || []),
            ]
            ary.forEach(item => {
              item.attribute &&
                (textMula += `${this.propertyCorrespond(item.attribute)}(${
                  item.weight
                }%)+`)
            })
            textMula = textMula.substring(0, textMula.length - 1)
            item.textMula = textMula
          })
          .catch(e => {
            this.$showFailure(e)
          })
        // })
      }
      this.listShow = false
      // this.$datablauLoading.close()
      this.loading = false
      this.title = row.name
      this.structureComData = row
      this.oldStructure = _.cloneDeep(row)
      // console.log(row, ' ---==-=')
    },
    // 完成度下拉框
    propertyCorrespond(val) {
      switch (val) {
        case 'DEPT':
          return this.$t('assets.generalSettings.dept')
        case 'DATA_BUTLER':
          return this.$t('assets.generalSettings.butler')
        case 'ASSETS_LIST':
          return this.$t('assets.generalSettings.assetList')
        case 'KEYWORDS':
          return this.$t('assets.generalSettings.keywords')
        case 'DESCRIPTION':
          return this.$t('assets.generalSettings.description')
        case 'ENGLISH_ABBREVIATION':
          return this.$t('assets.generalSettings.english')
        default:
          return val
      }
    },
    setOld(obj) {
      this.oldStructure[obj.key] = obj.val
    },
    // 全部，以启用，未启用tab切换
    activeNameClick() {
      const activeName = this.activeName
      if (activeName === 'second') {
        this.structureList = this.allStrctureList.filter(
          structure => structure.openStatus
        )
      } else if (activeName === 'third') {
        this.structureList = this.allStrctureList.filter(
          structure => !structure.openStatus
        )
      } else {
        this.structureList = this.allStrctureList
      }
      this.rowDrop()
    },
    setOptions(ary) {
      this.options = ary
    },
    getStruc() {
      let val = ''
      this.upDown = this.$t('assets.directoryStructure.collapseAll')
      this.allPutAway = false
      // this.$datablauLoading.loading({ color: '#409EFF' })
      this.loading = true
      HTTP.getStruc({ openStatus: '' })
        .then(res => {
          this.setAllPutAway(res.data, false)
          res.data.forEach(item => {
            item.structureManagerDto.forEach(items => {
              items.id = items.userId
              items.tagName = items.firstName
            })
          })
          res.data.forEach(item => {
            let manager = []
            item.structureManagerDto.forEach(k => {
              manager.push(k.firstName)
            })
            item.manager = manager
          })
          this.allStrctureList = res.data
          this.totalNum = this.allStrctureList.length
          this.enableNum = this.allStrctureList.filter(
            item => item.openStatus
          ).length
          this.unenableNum = this.allStrctureList.filter(
            item => !item.openStatus
          ).length
          // this.oldRevise = JSON.parse(
          //   JSON.stringify(this.setRevise(this.allStrctureList))
          // )
          this.activeNameClick()
          // this.$datablauLoading.close()
          this.loading = false
        })
        .catch(e => {
          // this.$datablauLoading.close()
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 行-拖拽
    rowDrop() {
      // console.log(this.$refs.deTable.$el)
      const tbody = this.$refs.deTable.$el.querySelector(
        '.el-table__body-wrapper tbody'
      )
      // console.log(tbody, Sortable, this.structureList)
      const _this = this
      Sortable.create(tbody, {
        disabled: false, // 是否开启拖拽
        ghostClass: 'sortable-ghost', // 拖拽样式
        animation: 150, // 拖拽延时，效果更好看
        group: {
          // 是否开启跨表拖拽
          pull: false,
          put: false,
        },
        handle: '.dragIcon',
        onEnd({ newIndex, oldIndex }) {
          // console.log(newIndex, oldIndex)
          const currRow = _this.structureList.splice(oldIndex, 1)[0]
          _this.structureList.splice(newIndex, 0, currRow)
          //   拖动后获取newIdex
          let arr = Array.from(_this.structureList)
          _this.apiObjDrag = arr.map((item, index) => {
            return {
              structureId: item.id,
              order: index,
              structureType: 'DATA_ASSETS',
            }
          })
          // console.log(arr, _this.apiObjDrag, '_this.apiObjDrag不包含删除的')
          HTTP.strucOrder(_this.apiObjDrag)
            .then(res => {
              _this.$blauShowSuccess(
                this.$t('assets.directoryStructure.sortingStructure')
              )
              _this.getStruc()
            })
            .catch(e => {
              _this.$showFailure(e)
            })
        },
      })
    },
    setAllPutAway(ary, val) {
      ary.forEach(item => {
        item.allPutAway = val
        item.upDown = !val
          ? this.$t('assets.directoryStructure.putAway')
          : this.$t('assets.directoryStructure.expand')
      })
    },
    // 添加新的目录
    primary() {
      this.listShow = false
      this.title = ''
      let detailDtos = []

      for (let i = 0; i < 5; i++) {
        detailDtos.push({
          level: i + 1,
          delete: false,
          inUse: false,
          typeAsset: '',
        })
      }

      let json = {
        name: '',
        newLevel: true,
        detailDtos,
        inUse: false,
        openStatus: false,
        structureManagerDto: [],
        approver: '',
        description: '',
        assetsStraightPublish: false,
        catalogStraightPublish: false,
      }
      this.structureComData = json
      this.oldStructure = _.cloneDeep(json)
    },
    getDirectoryType() {
      HTTP.getDirectoryType(0)
        .then(res => {
          let data = res.data.catalogTypes
          data.map(item => {
            item.assetsType = item.assetsType.split(',')
          })
          this.options = data
          this.getStruc()
        })
        .catch(e => {
          this.$blauShowFailure(e)
          // this.$datablauLoading.close()
          this.loading = false
        })
    },

    getAllUserPage(obj) {
      if (obj.page === 1) this.user = []
      let requestBody = {
        currentPage: obj.page,
        pageSize: 20,
        username: obj.keywords,
        fullUserName: obj.keywords,
        enabled: true,
      }
      HTTP.getAllUserPage(requestBody)
        .then(res => {
          const data = res.data.content
          let ary = []
          for (const key in data) {
            const item = data[key]
            const obj = {
              id: item.id,
              name: item.fullUserName,
              username: item.username,
              emailAddress: item.emailAddress,
            }
            ary.push(obj)
          }
          obj.page === 1 ? (this.user = ary) : this.user.push(...ary)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  mounted() {
    this.getDirectoryType()
    this.$nextTick(() => {
      // this.rowDrop()
    })
  },
}
</script>

<style scoped lang="scss">
.structure {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  overflow: auto;
  padding: 0 20px 20px;
  .datablau-table::before {
    height: 0;
  }
}
.flex,
.flexs {
  /*display: flex;*/
  overflow: auto;
  & > div {
    float: left;
  }
}
.tabChang .newDirectory {
  float: right;
}
.blue {
  color: #409eff;
  cursor: pointer;
}
i {
  cursor: pointer;
}
.marginL15 {
  margin-left: 15px;
}
.spaceBetween {
  justify-content: space-between;
}
.alignItems {
  align-items: center;
}
.title {
  line-height: 20px;
  padding-top: 10px;
  font-size: 16px;
  padding-bottom: 10px;
  /*border-bottom: 1px solid #dddddd;*/
  color: #555;
  font-weight: 600;
  align-items: center;

  .returnType {
    color: #777;
    font-size: 12px;
    margin-right: 6px;
    padding-right: 10px;
    border-right: 1px solid #ddd;
    cursor: pointer;
  }
  .previous {
    cursor: pointer;
    color: #409eff;
  }
}
.borderBtm {
  border-bottom: 1px solid #dddddd;
}
.con {
  width: 1100px;
}
.allPutAway {
  margin-left: 18px;
  margin-top: 7px;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
.noresult {
  margin: 50px auto 0;
  text-align: center;
  p {
    display: inline-block;
  }
}
.table-row {
  margin-top: 82px;
  margin-bottom: 20px;
}
/deep/.el-table .cell {
  line-height: 28px;
}
.iconBox {
  color: #409eff;
  i {
    /*margin-right: 16px;*/
  }
  .green {
    color: #999;
    cursor: no-drop;
    margin-left: 10px;
  }
}
.path {
  color: #777777;
  font-size: 12px;
  line-height: 14px;
}
.level {
  display: block;
  width: 20px;
  height: 20px;
  background: #efefef;
  border-radius: 10px;
  line-height: 20px;
  text-align: center;
}
/deep/ .el-table.datablau-table.datablau-table-5dot9 th .cell {
  white-space: nowrap;
}
.useIcon {
  margin-right: 10px;
}
.noStatus {
  color: #777777;
  font-size: 12px;
  position: relative;
  padding-left: 14px;
  &:after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 6px;
    background: #999999;
    position: absolute;
    top: 7px;
    left: 2px;
  }
}
.openStatus {
  color: #66bf15;
  font-size: 12px;
  position: relative;
  padding-left: 14px;
  &:after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 6px;
    background: #66bf15;
    position: absolute;
    top: 7px;
    left: 2px;
  }
}
.dragIcon {
  margin-top: 1px;
  color: #409eff;
  font-size: 22px;
  position: relative;
  top: 2px;
  display: none;
  cursor: move;
  margin-left: -2px;
}
.el-table--enable-row-hover .el-table__body tr:hover > td .dragIcon {
  display: block;
}
</style>
