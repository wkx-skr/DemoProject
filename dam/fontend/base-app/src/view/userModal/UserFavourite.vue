<template>
  <div>
    <div class="user-favourite">
      <div class="tab-topLine">
        <p class="tab-title">{{ $t('userPane.title.myFavorites') }}</p>
        <div class="vertical-middle top-line-inner">
          <el-radio-group
            class="screen-switch-radio"
            v-model="displayType"
            size="mini"
            @change="displayTypeChange"
            style="margin-right: 10px"
          >
            <el-radio-button label="1">
              <img
                style="width: 16px; height: auto"
                :src="displayTypeImg"
                alt=""
              />
            </el-radio-button>
            <el-radio-button label="2">
              <img
                style="width: 16px; height: auto"
                :src="displayTypeImg2"
                alt=""
              />
            </el-radio-button>
          </el-radio-group>
          <datablau-input
            :iconfont-state="true"
            placeholder=""
            prefix-icon="el-icon-search"
            v-model="keyword"
            :clearable="true"
          ></datablau-input>
        </div>
      </div>
      <div class="table-box">
        <datablau-form-submit v-if="displayType === '1'" class="table-row">
          <datablau-table
            ref="deTable"
            :data="items"
            v-loading="tableLoading"
            height="100%"
          >
            <el-table-column
              :label="$t('userPane.favourites.item')"
              min-width="600"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <datablau-icon
                  :data-type="$fileTypeFormatter(scope.row.objectName)"
                  :key="scope.row.objectId"
                  :size="18"
                  v-if="scope.row.typeId === 82800008"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="scope.row.logical ? 'logicaltable' : 'table'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80000004"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'report'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 82800002"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="scope.row.logical ? 'logicalcolumn' : 'column'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80000005"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <!-- 82800008 -->
                <datablau-icon
                  :data-type="'function'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80010119"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'view'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80500008"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'storedProcedure'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80010118"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'package'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 82800024"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'folder'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80010076"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <datablau-icon
                  :data-type="'index'"
                  :key="scope.row.objectId"
                  :size="18"
                  v-else-if="scope.row.typeId === 80010066"
                  style="position: relative; top: 3px"
                ></datablau-icon>
                <img
                  class="tableIcon-img"
                  v-else-if="imgSrcMap[scope.row.typeId]"
                  :src="imgSrcMap[scope.row.typeId]"
                  alt=""
                />
                <span style="padding-left: 10px">
                  {{ scope.row.objectName }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('userPane.favourites.addingDate')"
              fixed="right"
              min-width="250"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ $timeFormatter(scope.row.createTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('userPane.userPane.operation')"
              :width="$i18n.locale === 'en' ? 180 : 150"
              fixed="right"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="mini"
                  @click="jumpToDdc(scope.row)"
                  style="margin-right: 10px"
                >
                  {{ $t('domain.common.check') }}
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="deleteFavor(scope.row)"
                >
                  {{ $t('meta.DS.message.cancelCollect') }}
                </el-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <datablau-pagination
              @size-change="changePageSize"
              @current-change="changeCurrentPage"
              :current-page.sync="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
        <div class="styleBlock clearfix" v-if="displayType === '2'">
          <div
            class="styleBlock-box"
            v-for="(valueIndex, index) in items"
            :key="index"
          >
            <div class="styleBlock-boxTop" @click="jumpToDdc(valueIndex)">
              <div class="styleBlock-boxTop-title">
                <div class="titleIcon">
                  <datablau-icon
                    :data-type="$fileTypeFormatter(valueIndex.objectName)"
                    :key="valueIndex.objectId"
                    :size="32"
                    v-if="valueIndex.typeId === 82800008"
                    style="position: relative; top: 3px"
                  ></datablau-icon>
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80000004"
                    :src="imgUrl(valueIndex)"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 82800002"
                    src="../../assets/images/search/report.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80000005"
                    :src="imgUrl(valueIndex)"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80010119"
                    src="../../assets/images/search/function.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80500008"
                    src="../../assets/images/search/view.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80010118"
                    src="../../assets/images/search/storedProcedure.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 82800024"
                    src="../../assets/images/search/package.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80010076"
                    src="../../assets/images/search/folder.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-if="valueIndex.typeId === 80010066"
                    src="../../assets/images/search/index.svg"
                    alt=""
                  />
                  <img
                    class="tableIcon-img"
                    v-else-if="imgSrcMap[valueIndex.typeId]"
                    :src="imgSrcMap[valueIndex.typeId]"
                    alt=""
                  />
                  <span style="padding-left: 10px">
                    {{ valueIndex.objectName }}
                  </span>
                </div>
                <p>{{ $timeFormatter(valueIndex.createTime) }}</p>
              </div>
            </div>
            <div class="styleBlock-boxBottom">
              <p @click="deleteFavor(valueIndex)">
                {{ $t('meta.DS.message.cancelCollect') }}
              </p>
            </div>
          </div>
        </div>
        <div class="tab-bottom-line" v-if="displayType === '2'">
          <datablau-pagination
            class="page"
            @size-change="changePageSize"
            @current-change="changeCurrentPage"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>
      </div>
    </div>
    <!-- <div style="position:absolute;top:20px;left:170px;bottom:20px;width:700px;">
      <ag-table-component
        ref="modelTable"
        @grid-ready="onGridReady"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="items"
        :loading="tableLoading"
        :frameworkComponents="frameworkComponents"
      ></ag-table-component>
    </div>

           <el-table
              class="plain-table"
      style="max-width:600px;"
      v-if="items && false"
              :data="items"
            > -->
    <!--<el-table-column prop="typeId" :formatter="typeFormatter" label="类型" width="80"></el-table-column>-->
    <!-- <el-table-column prop="objectName" label="名称" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="fa fa-table"></i>
                <span style="margin-left:0.5em;">{{scope.row.objectName}}</span>
              </template>
            </el-table-column>
      <el-table-column label="操作" width="120">
              <template slot-scope="scope">
          <el-button type="text" size="mini" @click="jumpToDdc(scope.row)">查看</el-button>
          <el-button type="text" size="mini" @click="deleteFavor(scope.row)">取消收藏</el-button>
              </template>
            </el-table-column>
          </el-table> -->
  </div>
</template>

<script>
import agTableComponent from '@/components/common/agTableComponent'
import MyScanRenderer from './favouriteScanRenderer.js'
import api from '@/view/dataAsset/utils/api'
import HTTP from '@/http/main.js'
import HTTP2 from '@/http/main'
import metaModelIcon from '@/assets/images/search/metamodel.png'

export default {
  components: { agTableComponent },
  data() {
    return {
      items: null,
      imgSrcMap: {},
      meteModelTypeMap: {},
      gridApi: null,
      columnApi: null,
      gridOptions: {
        rowSelection: false,
      },
      // tableLoading: false,
      tableData: null,
      frameworkComponents: null,
      keyword: '',
      displayType: '1',
      displayTypeImg: 'static/userCenter/list2.png',
      displayTypeImg2: 'static/userCenter/card.png',
      tableLoading: true,
      currentPage: 1,
      pageSize: 20,
      total: 0,
    }
  },
  beforeMount() {
    this.frameworkComponents = {
      MyScanRenderer: MyScanRenderer,
    }
  },
  mounted() {
    this.getMetaModelTypes()
      .then(res => {
        this.getData()
      })
      .catch(e => {
        this.$showFailure(e)
      })
  },
  methods: {
    async getMetaModelTypes() {
      let metaModelTypes = []
      try {
        metaModelTypes = await HTTP.getMetaModelTypes()
        metaModelTypes = metaModelTypes.data || []
      } catch (e) {
        this.$showFailure(e)
      }

      let meteModelTypeMap = {}
      metaModelTypes.forEach(item => {
        meteModelTypeMap[item.id] = item
      })
      this.meteModelTypeMap = meteModelTypeMap
    },
    async getMetaModelIcon(typeId) {
      try {
        let url = ''
        // const reqUrl = `/metadata/mm/${typeId}`
        let resImg = await HTTP.getMetaModelIconNew(typeId)
        if (resImg.data && resImg.data.size > 0) {
          // 检查返回的blob是否有内容
          const blob = new Blob([resImg.data], { type: 'image/png' })
          url = URL.createObjectURL(blob)
        } else {
          url = metaModelIcon // 设置默认图标
        }
        this.$set(this.imgSrcMap, typeId, url)
      } catch (e) {
        console.log(e)
      }
    },
    imgUrl(data) {
      if (data.typeId === 80000004) {
        if (data.logical) {
          return require('@/assets/images/search/logicaltable.svg')
        } else {
          return require('@/assets/images/search/table.svg')
        }
      } else {
        if (data.logical) {
          return require('@/assets/images/search/logicalcolumn.svg')
        } else {
          return require('@/assets/images/search/column.svg')
        }
      }
    },
    displayTypeChange(value) {
      if (this.displayType === '1') {
        this.displayTypeImg = 'static/userCenter/list2.png'
        this.displayTypeImg2 = 'static/userCenter/card.png'
      } else if (this.displayType === '2') {
        this.displayTypeImg = 'static/userCenter/list.png'
        this.displayTypeImg2 = 'static/userCenter/card2.png'
      }
    },
    getData() {
      let param = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        desc: false,
      }
      this.$http
        .post(this.$url + '/favor/page', param)
        .then(res => {
          let logicalInfoArr = []
          res.data.content.forEach(item => {
            if (item.typeId === 80000004 || item.typeId === 80000005) {
              logicalInfoArr.push(item.objId.match(/\d+$/)[0])
            }
            if (this.meteModelTypeMap[item.typeId]) {
              this.getMetaModelIcon(item.typeId)
            }
          })
          this.getLogicalInfo(logicalInfoArr)
          this.total = res.data.totalItems
          this.items = res.data.content
          this.tableLoading = false
          if (
            (res.data.content.length === 0 || !res.data.content) &&
            this.currentPage > 1
          ) {
            this.currentPage -= 1
            this.getData()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post(this.$meta_url + '/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.items.forEach(element => {
            this.$set(
              element,
              'logical',
              res.data[Number(element.objId.match(/\d+$/)[0])]
            )
          })
          // console.log(this.items, 'this.items')
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    changePageSize(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getData()
    },
    changeCurrentPage(val) {
      this.currentPage = val
      this.getData()
    },
    typeFormatter(row) {
      switch (row.typeId) {
        case 1:
        case '1':
          return '表'
        default:
          break
      }
    },
    jumpToDdc(row) {
      const objectId = row.objId
      // const type = row.typeId===80000004 ? 'TABLE' : 'VIEW';
      let type
      switch (row.typeId) {
        case 80000004:
          type = 'TABLE'
          break
        case 80000005:
          type = 'COLUMN'
          break
        case 82800002:
          type = 'REPORT'
          break
        case 80500008:
          type = 'VIEW'
          break
        case 82800008:
          type = 'FILE'
          break
        case 80010076:
          type = 'catalogue' // 目录
          break
      }
      if (this.meteModelTypeMap[row.typeId]) {
        type = 'metaModel'
      }
      if (type === 'metaModel') {
        // const url = this.BaseUtils.RouterUtils.getFullUrl('metaModelDetails', {
        //   objectId: data.itemId,
        //   catalogId: data.catalogId,
        //   id: data.assetsId,
        //   type: 'metaModel',
        //   blank: true,
        // })
        const url = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
          objectId: objectId,
          type: 'META_MODEL',
          blank: true,
        })
        window.open(url)
        return
      }
      if (objectId) {
        // objectId 如果包含/，暂时说明是从数据超市收藏进入的
        if (objectId.indexOf('/') !== -1) {
          let url
          const idArr = objectId.split('/')
          if (type === 'TABLE') {
            url = this.BaseUtils.RouterUtils.getFullUrl('tableDetails', {
              objectId: idArr[2],
              catalogId: idArr[0],
              id: idArr[1],
              blank: true,
            })
          }
          if (type === 'VIEW') {
            url = this.BaseUtils.RouterUtils.getFullUrl('viewDetails', {
              objectId: idArr[2],
              catalogId: idArr[0],
              id: idArr[1],
              blank: true,
            })
          }
          if (type === 'COLUMN') {
            url = this.BaseUtils.RouterUtils.getFullUrl('columnDetails', {
              objectId: idArr[2],
              catalogId: idArr[0],
              id: idArr[1],
              blank: true,
            })
          }
          if (type === 'FILE') {
            url = this.BaseUtils.RouterUtils.getFullUrl('fileDetails', {
              objectId: idArr[2],
              catalogId: idArr[0],
              id: idArr[1],
              blank: true,
            })
          }
          if (type === 'REPORT') {
            url = this.BaseUtils.RouterUtils.getFullUrl('reportDetails', {
              objectId: idArr[2],
              catalogId: idArr[0],
              id: idArr[1],
              blank: true,
            })
          }
          // console.log(type, url)
          window.open(url)
          return
        }
        let pos = location.href.indexOf('#/')
        let baseUrl = location.href.slice(0, pos + 2)
        if (row.typeId === 82800002) {
          window.open(
            this.BaseUtils.RouterUtils.getFullUrl('reportFormManage', {
              objectId: objectId,
              blank: true,
            })
          )
        } else if (row.typeId === 82800008) {
          window.open(
            `${baseUrl}main/metaFolder?objectId=${objectId}&type=file&blank=true`
          )
        } else if (
          row.typeId === 80000004 ||
          row.typeId === 80000005 ||
          row.typeId === 80500008 ||
          row.typeId === 80010118 ||
          row.typeId === 80010119 ||
          row.typeId === 82800024
        ) {
          window.open(
            this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
              objectId: objectId,
              blank: true,
            })
          )
        } else if (row.typeId === 80010076) {
          // console.log(objectId)
          window.open(
            this.BaseUtils.RouterUtils.getFullUrl('catalogDetails', {
              id: objectId,
              blank: true,
            })
          )
          // window.open(
          //   `${location.protocol}//${location.host}/ddc-app/#/main/dataAsset/overview?id=${objectId}&type=${type}`
          // )
        } else if (row.typeId === 80010066) {
          this.$skip2Domain(objectId)
        } else {
          if (
            location.pathname.includes('ddc.html') ||
            location.href.includes(':8081')
          ) {
            // from ddc
            window.open(
              `${location.origin}${location.pathname}#/myItem?objectId=${objectId}&type=${type}`
            )
          } else {
            // from dam
            window.open(
              `${location.origin}${location.pathname}#/myItem?objectId=${objectId}&type=${type}`
            )
          }
        }
      }
    },
    deleteFavor(row) {
      this.$DatablauCofirm(this.$t('meta.DS.message.sureToUncollect'))
        .then(() => {
          if (row.typeId === 80010076) {
            api
              .discollectCatalog({
                catalogId: row.objId,
              })
              .then(res => {
                if (res.status === 200) {
                  this.getData()
                } else {
                  this.$showFailure(res.errorMessage)
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            const id = row.id
            this.$http
              .post(this.$url + '/favor/delete?favId=' + id)
              .then(() => {
                this.getData()
              })
          }
        })
        .catch(() => {})
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      //        this.$refs.modelTable.sizeColumnsToFit();
    },
  },
  watch: {
    keyword(newVal) {
      this.getData()
    },
  },
}
</script>

<style scoped lang="scss">
@import './_main';
</style>
<style lang="scss">
.user-favourite {
  position: absolute;
  top: 0;
  left: 160px;
  right: 0;
  bottom: 0;
  .tab-topLine {
    padding: 0 20px;
    .tab-title {
      height: 40px;
      line-height: 40px;
      font-weight: 600;
      font-size: 16px;
      color: #555;
    }
  }
  .table-box {
    position: absolute;
    top: 85px;
    left: 0;
    right: 0;
    bottom: 0;
    .styleBlock {
      margin-top: 20px;
      padding: 0 20px;
      position: absolute;
      top: 0;
      bottom: 50px;
      padding-bottom: 0;
      overflow: auto;
      margin-bottom: 0;
    }
    .tab-bottom-line {
      margin-left: 0;
    }
  }
  tbody tr:last-of-type td {
    border-bottom: 1px solid #dddddd;
  }
}
</style>
