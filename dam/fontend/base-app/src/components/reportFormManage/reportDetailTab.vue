<template>
  <div class="report-detail-tab">
    <div class="firstBox">
      <div class="descriptionMessage">
        <div class="descriptionMessage-title">
          <p class="message-title">{{ $t('meta.report.basicInfo') }}</p>
        </div>
        <div class="detail-info-outer">
          <el-form
            class="page-form"
            label-position="right"
            label-width="120px"
            size="small"
            :model="reportFormManage"
            ref="form"
            :inline="!showHeightAuto"
          >
            <el-form-item :label="$t('meta.report.reportType')" prop="type">
              <p class="item-value">
                {{ typeLabel }}
              </p>
            </el-form-item>
            <!--导入来源-->
            <el-form-item :label="$t('meta.report.reportSource')" prop="type">
              <p class="item-value">
                {{ importType }}
              </p>
            </el-form-item>
            <el-form-item
              :label="$t('meta.report.updateFrequency')"
              prop="frequency"
            >
              <p class="item-value">
                {{ reportFormManage.frequency }}
              </p>
            </el-form-item>
            <el-form-item :label="$t('meta.report.owner')" prop="owner">
              <p class="item-value">
                {{ reportFormManage.owner }}
              </p>
            </el-form-item>

            <!--            <el-form-item label="业务部门" prop="owner" v-if="false">
              <p class="item-value">
                {{ reportFormManage.owner }}
              </p>
            </el-form-item>

            <el-form-item label="技术部门" prop="owner" v-if="false">
              <p class="item-value">
                {{ reportFormManage.owner }}
              </p>
            </el-form-item>-->
            <el-form-item :label="$t('meta.report.subDate')" prop="createTime">
              <p class="item-value">
                {{ $timeFormatter(reportFormManage.createTime) }}
              </p>
            </el-form-item>
            <el-form-item
              :label="$t('meta.report.modifyTime')"
              prop="lastImportedModifiedTime"
              v-if="reportFormManage.lastImportedModifiedTime && !startEdit"
            >
              <div class="report-form-manage-input">
                <p class="item-value" style="min-width: auto">
                  {{
                    $dateFormatter(reportFormManage.lastImportedModifiedTime)
                  }}
                </p>
                <datablau-tips
                  style="display: inline-block; margin-left: 10px"
                  :content="$t('meta.report.importDateTips')"
                  icon="icon-tips"
                ></datablau-tips>
              </div>
            </el-form-item>
            <el-form-item :label="$t('meta.report.historyRange')" prop="range">
              <p class="item-value">
                {{ reportFormManage.range }}
              </p>
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('meta.report.reportIntro')"
              prop="description"
              class="report-description"
            >
              <span v-if="reportFormManage.description === '' && !startEdit">
                {{ $t('meta.report.noIntro') }}
              </span>
              <div class="markdown">
                <mavon-editor
                  :language="$i18n.locale === 'en' ? 'en' : 'zh-CN'"
                  :defaultOpen="'preview'"
                  v-if="!startEdit && reportFormManage.description"
                  :toolbarsFlag="false"
                  :editable="false"
                  :scrollStyle="true"
                  :subfield="false"
                  :toolbars="toolbars"
                  style="min-height: 60px; max-height: 300px"
                  v-model="reportFormManage.description"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
              </div>
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('meta.report.reportPath')"
              prop="path"
              class="report-path"
            >
              <p class="item-value">
                <span-with-tooltip
                  :content="reportFormManage.path | pathFormat"
                  :classString="`path-show report-form-manage-input`"
                  :placement="`right`"
                  :displayType="`inline-block`"
                ></span-with-tooltip>
              </p>
            </el-form-item>
            <el-form-item
              :label="$t('meta.report.reportLink')"
              prop="url"
              class="report-link-item"
            >
              <p class="item-value">
                <!--                v-if="
                    hasAuthority &&
                    reportFormManage.url !== $t('meta.report.noPermission')
                  "-->
                <el-tooltip
                  effect="light"
                  :content="reportFormManage.url"
                  placement="top"
                  popper-class="report-url-tooltip"
                >
                  <span
                    class="report-link"
                    @click="skip2Url(reportFormManage.url)"
                  >
                    {{ reportFormManage.url }}
                  </span>
                </el-tooltip>
                <!--                <span v-else>{{ $t('meta.report.noPermission') }}</span>-->
              </p>
            </el-form-item>
            <br />
          </el-form>
        </div>
      </div>
      <div class="descriptionMessage">
        <div class="descriptionMessage-title">
          <p class="message-title">{{ $t('meta.report.reportImg') }}</p>
        </div>
        <div class="detail-info-outer">
          <!-- <image-upload
            :imageList="imageList"
            :isEdit="startEdit"
            ref="imgUpload"
          ></image-upload> -->
          <datablau-upload
            :isEdit="startEdit"
            :show-file-list="false"
            :imageList="imageList"
            list-type="picture-card"
          ></datablau-upload>
        </div>
      </div>
    </div>
    <div class="secondBox" id="secondBox">
      <div class="organization-part">
        <p class="secondBox-title">
          {{ $t('meta.DS.tableDetail.rightBox.peopleAndOrg') }}
        </p>
        <ul>
          <li>
            <div class="title-name">
              <img src="static/images/metadataIcon/dataOwnership.svg" alt="" />
              <span>{{ $t('meta.DS.tableDetail.rightBox.dataOwner') }}</span>
            </div>
            <group-department
              style="width: 60%"
              :typeIds="'82800002'"
            ></group-department>
          </li>
          <!--<li>-->
          <!--  <div class="title-name">-->
          <!--    <img src="static/images/metadataIcon/technicalDepartment.svg" alt="">-->
          <!--    <span>技术部门</span>-->
          <!--  </div>-->
          <!--  <p class="system-value">{{ propArr.itDepartment }}</p>-->
          <!--</li>-->
          <li>
            <div class="title-name">
              <img
                src="static/images/metadataIcon/dataStewardship.svg"
                alt=""
              />
              <span>{{ $t('meta.DS.tableDetail.rightBox.dataSteward') }}</span>
            </div>
            <data-steward
              style="width: 60%"
              :typeIds="'82800002'"
            ></data-steward>
          </li>
          <li>
            <div class="title-name">
              <img src="static/images/metadataIcon/topUser.svg" alt="" />
              <span>{{ $t('meta.DS.tableDetail.rightBox.topUser') }}</span>
            </div>
            <div class="topUser">
              <el-tooltip
                placement="bottom"
                effect="light"
                v-for="(topData, index) in tableDataTop.slice(0, 3)"
                :key="index"
              >
                <div slot="content">
                  <p style="color: #20293b; padding-bottom: 10px">
                    <span
                      style="
                        color: #7d8493;
                        font-size: 12px;
                        width: 50px;
                        display: inline-block;
                      "
                      :style="{
                        width: $i18n.locale === 'en' ? '80px' : '50px',
                      }"
                    >
                      {{ $t('meta.DS.tableDetail.rightBox.username') }}
                    </span>
                    {{ topData.username }}
                  </p>
                  <p style="color: #20293b; padding-bottom: 10px">
                    <span
                      style="
                        color: #7d8493;
                        font-size: 12px;
                        width: 50px;
                        display: inline-block;
                      "
                      :style="{
                        width: $i18n.locale === 'en' ? '80px' : '50px',
                      }"
                    >
                      {{ $t('meta.DS.tableDetail.rightBox.firstName') }}
                    </span>
                    {{ topData.firstName }}
                  </p>
                  <p style="color: #20293b">
                    <span
                      style="
                        color: #7d8493;
                        font-size: 12px;
                        width: 50px;
                        display: inline-block;
                      "
                      :style="{
                        width: $i18n.locale === 'en' ? '80px' : '50px',
                      }"
                    >
                      {{ $t('meta.DS.tableDetail.rightBox.visitCount') }}
                    </span>
                    {{ topData.visitCount }}
                  </p>
                </div>
                <div class="headPortrait">
                  {{ topData.firstName.slice(0, 1) }}
                </div>
              </el-tooltip>
            </div>
          </li>
        </ul>
      </div>
      <!--<div class="label-part">-->
      <!--  <div class="label-part-content" v-for="(tagsTree,key,index) in tagsTreeArr" :key="index">-->
      <!--    <p class="secondBox-title">{{ key }}</p>-->
      <!--    <ul>-->
      <!--      <li v-for="(valueIndex,index) in tagsTree" :key="index">-->
      <!--        <div class="title-name">-->
      <!--          <img v-if="valueIndex.tag === true" src="static/images/metadataIcon/metadataTags.svg" alt="">-->
      <!--          <img v-if="valueIndex.tag === false" src="static/images/metadataIcon/udp.svg" alt="">-->
      <!--          <span>{{ valueIndex.key }}</span>-->
      <!--        </div>-->
      <!--        <div class="tags" style="margin-top: 0;" v-if="valueIndex.tag === true">-->
      <!--          <el-tag :closable="Boolean(contentWritable)"-->
      <!--                  @close="handleClose(valueIndex.value)">{{ valueIndex.value.name }}-->
      <!--          </el-tag>-->
      <!--        </div>-->
      <!--        <div class="udpBox" v-if="valueIndex.tag === false">-->
      <!--          <span v-show="!valueIndex.editMode">{{ valueIndex.value.value }}</span>-->
      <!--          <el-button class="edit-btn" v-if="!valueIndex.editMode && stas!=='false'&&$auth['METADATA_EDIT']"-->
      <!--                     type="text" size="mini" @click="startEdit(valueIndex,index)"><i-->
      <!--            style="font-size:12px;margin-left:1.3em;" class="icon-edit"></i></el-button>-->
      <!--          <el-input v-if="valueIndex.editMode==='STRING' || valueIndex.editMode==='NUM_RANGE'" size="mini"-->
      <!--                    style="width:12em;" v-model="udpValue"></el-input>-->
      <!--          <el-input v-else-if="valueIndex.editMode==='NUM'" size="mini" style="width:12em;"-->
      <!--                    v-model.number="udpValue"></el-input>-->
      <!--          <el-select v-else-if="valueIndex.editMode==='BOOL'" size="mini" style="width:12em;" v-model="udpValue">-->
      <!--            <el-option value="true" label="true"></el-option>-->
      <!--            <el-option value="false" label="false"></el-option>-->
      <!--          </el-select>-->
      <!--          <el-select v-else-if="valueIndex.editMode==='ENUM'" size="mini" style="width:12em;" v-model="udpValue">-->
      <!--            <el-option v-for="o in optionsUdp" :value="o" :label="o" :key="o"></el-option>-->
      <!--          </el-select>-->
      <!--          <div>-->
      <!--            <el-button v-show="valueIndex.editMode" type="text" size="mini" @click="save(valueIndex,i)">-->
      <!--              {{ $t('common.button.save') }}-->
      <!--            </el-button>-->
      <!--            <el-button v-show="valueIndex.editMode" type="text" size="mini" @click="cancel(valueIndex)">-->
      <!--              {{ $t('common.button.cancel') }}-->
      <!--            </el-button>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </li>-->
      <!--    </ul>-->
      <!--  </div>-->
      <!--</div>-->
      <div class="label-part">
        <!--        <div
          class="label-part-content"
          v-for="(udps, key, index) in udpsTree"
          :key="index"
        >
          <p class="secondBox-title">{{ key }}</p>-->
        <ul>
          <li v-for="(valueIndex, index) in udps" :key="index">
            <p class="secondBox-title">{{ valueIndex.catalog }}</p>
            <div class="title-name">
              <img src="static/images/metadataIcon/udp.svg" alt="" />
              <span>{{ valueIndex.name }}</span>
            </div>
            <div class="udpBox">
              <span
                v-show="!valueIndex.editMode"
                class="udp-value-string"
                :title="valueIndex.value"
              >
                {{ valueIndex.value }}
              </span>
              <el-button
                class="edit-btn"
                v-if="
                  false &&
                  !valueIndex.editMode &&
                  stas !== 'false' &&
                  $auth['METADATA_EDIT']
                "
                type="text"
                size="mini"
                @click="startEdit(valueIndex, index)"
              >
                <i
                  style="font-size: 12px; margin-left: 1.3em"
                  class="icon-edit"
                ></i>
              </el-button>
              <el-input
                v-if="
                  valueIndex.editMode === 'STRING' ||
                  valueIndex.editMode === 'NUM_RANGE'
                "
                size="mini"
                style="width: 12em"
                v-model="udpValue"
              ></el-input>
              <el-input
                v-else-if="valueIndex.editMode === 'NUM'"
                size="mini"
                style="width: 12em"
                v-model.number="udpValue"
              ></el-input>
              <el-select
                v-else-if="valueIndex.editMode === 'BOOL'"
                size="mini"
                style="width: 12em"
                v-model="udpValue"
              >
                <el-option value="true" label="true"></el-option>
                <el-option value="false" label="false"></el-option>
              </el-select>
              <el-select
                v-else-if="valueIndex.editMode === 'ENUM'"
                size="mini"
                style="width: 12em"
                v-model="udpValue"
              >
                <el-option
                  v-for="o in optionsUdp"
                  :value="o"
                  :label="o"
                  :key="o"
                ></el-option>
              </el-select>
              <div>
                <el-button
                  v-show="valueIndex.editMode"
                  type="text"
                  size="mini"
                  @click="save(valueIndex, i)"
                >
                  {{ $t('common.button.save') }}
                </el-button>
                <el-button
                  v-show="valueIndex.editMode"
                  type="text"
                  size="mini"
                  @click="cancel(valueIndex)"
                >
                  {{ $t('common.button.cancel') }}
                </el-button>
              </div>
            </div>
          </li>
        </ul>
        <!--        </div>-->
      </div>
      <div class="addtag" style="margin-bottom: 17px; width: 100%" v-if="false">
        <el-button
          v-if="contentWritable && $auth['METADATA_EDIT']"
          @click="beforeAddTag"
          :title="$t('meta.DS.tableDetail.addTagTittle')"
          size="mini"
          style="
            height: 26px;
            color: #7d8493;
            margin: 0 auto;
            width: 200px;
            display: block;
          "
        >
          {{ $t('meta.DS.tableDetail.addTag') }}
          <i
            class="el-icon-plus"
            style="font-weight: bold; margin-left: 14px"
          ></i>
        </el-button>
      </div>
      <div class="system-part" v-if="$route.query.isAssets">
        <p class="secondBox-title">
          {{ $t('meta.DS.tableDetail.rightBox.systemProp') }}
        </p>
        <ul>
          <li v-if="objectType !== 'PACKAGE'">
            <div class="title-name">
              <img src="static/images/metadataIcon/assetstatus.svg" alt="" />
              <span>{{ $t('meta.DS.tableDetail.rightBox.assetState') }}</span>
            </div>
            <p class="system-value">
              <span v-if="propArr.auth === true">
                {{ $t('meta.DS.tableDetail.rightBox.authTrue') }}
              </span>
              <span v-if="propArr.auth === false">
                {{ $t('meta.DS.tableDetail.rightBox.authFalse') }}
              </span>
              <span v-if="propArr.auth === null">
                {{ $t('meta.DS.tableDetail.rightBox.authNull') }}
              </span>
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import HTTP from '@/http/main.js'
import groupDepartment from '@/view/dataProperty/meta/groupDepartment.vue'
import dataSteward from '@/view/dataProperty/meta/dataSteward.vue'
import imageUpload from '@/components/reportFormManage/imageUpload.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import UserDefinedPropertyController from '../../../../base-components/http/baseController/UserDefinedPropertyController'

export default {
  data() {
    return {
      moment: moment,
      definitionEditing: false,
      // contentWritable: false,
      definitionSaving: false,
      tableDataTop: [],
      tagsTreeArr: [],
      showHeightAuto: false,
      isEdit: false,
      startEdit: false,
      imageList: [],
      typeLabel: '',
      importTypeArr: this.$globalData && this.$globalData.$importTypeArr,
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      },
      reportFormManage: {},
      udps: [],
      udpsTree: {},
      hasAuthority: false,
    }
  },
  props: {
    reportData: {
      required: true,
    },
    propArr: {
      return: true,
    },
    objectType: {
      type: String,
      default: 'REPORT',
    },
    typeMap: {
      default() {
        return {}
      },
    },
    appTypes: {
      required: true,
    },
    reportDetailPro: {
      type: Promise,
      required: true,
    },
    reportUdpPro: {
      type: Promise,
      required: true,
    },
    updSeparator: {
      type: String,
      default: ',',
    },
  },
  components: {
    groupDepartment,
    dataSteward,
    imageUpload,
    spanWithTooltip,
  },
  computed: {
    summary() {
      const obj = {
        definition: '',
      }
      return obj
    },
    importType() {
      const type = this.reportFormManage.biReportType
      const obj =
        this.importTypeArr &&
        this.importTypeArr.find(item => item.value === type)
      return obj ? obj.label : this.$t('meta.report.manualAdd')
    },
    contentWritable() {
      return this.$auth.ROLE_DATA_CATALOG_ADMIN && this.$auth.METADATA_EDIT
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      let type = this.appTypes.find(type => type.value === this.reportData.type)
      if (type) {
        type = type.label
      } else {
        type = ''
      }
      this.typeLabel = type

      if (this.reportData.id === 'add') {
        this.startEdit = true
      } else {
        this.reportFormManage = _.cloneDeep(this.reportData)
        if (this.$authServerEnabled) {
          this.getAuthority()
        } else {
          this.hasAuthority = true
        }
        this.getDetails()
        this.getResourceStatistics()

        this.getDataTop()
      }
    },
    getAuthority() {
      this.$http
        .get(`${this.$url}/service/auth/check/${this.reportData.id}/82800002`)
        .then(res => {
          this.hasAuthority = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUdp() {
      this.$http
        .post(`${this.$meta_url}/udps/getUdpsOfType?typeId=82800002`)
        .then(res => {
          let result = res.data
          let tempData = []
          result.forEach(item => {
            const obj = {
              name: item.name,
              udpId: item.id,
              type: item.type,
              typeData: item.typeData,
              order: item.order,
              shareFileId: this.summary.id,
              value: '',
              editMode: false,
            }
            tempData.push(obj)
          })
          this.udps = tempData
          this.$utils.sort.sort(this.udps, 'order')
          this.setUdpVal()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setUdpVal() {
      this.$http
        .post(
          `${this.$meta_url}/udps/getItemUdps?itemId=${this.reportData.id}&typeId=82800002`
        )
        .then(res => {
          let result = res.data
          result.forEach(r => {
            this.udps.forEach(udp => {
              if (udp.udpId === r.id) {
                udp.value = r.value
              }
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshData() {
      this.dataInit()
    },

    // fillUdp () {
    //   const category = this.reportFormManage
    //   category.udps = []
    //   this.udps.forEach(u => {
    //     category.udps.push({
    //       id: u.id,
    //       value: u.value
    //     })
    //   })
    // },
    handleDefinitionEdit() {},
    saveDefinition() {},
    handleTypeChange() {},
    beforeAddTag() {},

    getDetails() {
      // get data with bottom table array
      // this.$http.get(this.reportFormManageUrl + this.reportFormManage.id)
      // HTTP.getReportDetail({reportId: this.reportFormManage.id})
      this.reportDetailPro
        .then(res => {
          for (const key in res.data) {
            this.reportFormManage[key] = res.data[key]
          }
          const str = this.reportFormManage.thumbnailFileIds || ''
          const imageList = str.split(',')
          this.imageList = imageList.filter(item => {
            return !!item
          })
          this.getUdp()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getResourceStatistics() {
      HTTP.getReportStatistics({ reportId: this.reportFormManage.id })
        .then(res => {
          if (res.data && Array.isArray(res.data.content)) {
            this.bottomDataSourceCount = res.data.content
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataTop() {
      // this.$http.get(this.$url + `/service/browse/query/topuser/${this.dataAmount}/${this.objectId}/${this.summary.typeId}`)
      this.$http
        .post(this.$url + '/objectVisit/getTopUser', {
          topNumber: 20,
          objectId: this.reportData.id,
          typeId: this.$commentPreCode.Report,
        })
        /* HTTP.getTopUsers({
        dataAmount: 3,
        objectId: this.reportData.id,
        typeId: this.$commentPreCode.Report,
      }) */
        .then(res => {
          this.tableDataTop = res.data.sort(
            (a, b) => b.visitCount - a.visitCount
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    skip2Url(url) {
      const index = url.indexOf('http')
      if (index === -1) {
        url = 'http://' + url
      }
      window.open(url)
    },
    // 获取当前标签
    getTagsTreeArr() {
      this.$http
        // .get(this.$url + `/service/tags/tree/${this.objectId}/summary`)
        .post(
          this.$meta_url + `/service/tag/tree/summary?objectId=${this.objectId}`
        )
        .then(res => {
          this.tagsTreeArr = res.data
          for (const key in this.tagsTreeArr) {
            for (const arr in this.tagsTreeArr[key]) {
              if (this.tagsTreeArr[key][arr].tag === false) {
                this.$set(this.tagsTreeArr[key][arr], 'editMode', false)
                // this.tagsTreeArr[key][arr].editMode = false
              }
            }
          }
          this.loadedTags = this.loadedTagsBefore
          setTimeout(() => {
            if (document.getElementById('secondBox')) {
              this.secondBoxHeight =
                document.getElementById('secondBox').offsetHeight + 60
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {},
  filters: {
    formatDaI: ({ row, cellValue }) => {
      let result = ''
      if (row.type === 'Lat') {
        // 维度
        result = self.dimMap[cellValue] ? self.dimMap[cellValue].catalog : ''
      } else if (row.type === 'Index') {
        // 指标
        result = self.indexMap[cellValue] ? self.indexMap[cellValue].name : ''
      } else if (row.type === 'Other') {
        // 普通
        result = cellValue
      }
      return result
    },
    formatDim({ row, cellValue }) {
      let name = ''
      if (self.dimMap[cellValue]) {
        name = self.dimMap[cellValue].catalog || self.dimMap[cellValue].value
      }
      if (!name) {
        name = cellValue
      }
      return name
    },
    indexFormat({ row, cellValue }) {
      if (self.indexMap[cellValue]) {
        return self.indexMap[cellValue].name
      }
    },
    pathFormat(para) {
      para = para || []
      let result = ''
      if (para && Array.isArray(para) && para.length > 0) {
        result = para.join(' / ')
      } else {
        result = '/'
      }
      return result
    },
  },
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

.report-detail-tab {
  height: 100%;
  overflow-y: auto;
  // @include absPos();

  //border: 1px solid red;
  .report-link {
    // margin-left: 12px;
    color: #409eff;
    cursor: pointer;
    word-break: break-all;
  }
}

.firstBox {
  width: 60%;
  //border: 1px solid red;

  .message-title {
    display: inline-block;
    // padding: 12px 0;
    font-size: 14px;
    font-weight: 500;
    color: #555555;
    position: relative;
    padding-left: 10px;
    &:before {
      position: absolute;
      content: '';
      left: 0;
      top: 4px;
      width: 4px;
      height: 14px;
      background: #409eff;
      border-radius: 1px;
    }
  }

  .detail-info-outer {
    //border: 1px solid red;
    //padding: 10px 0;
    .page-form {
      padding: 10px 0;

      .item-value {
        min-width: 300px;
        display: inline-block;
        //border: 1px solid red;
      }
    }
  }
}

.secondBox {
  width: 30%;
  min-width: 300px;
  min-height: 650px;
  height: auto;
  position: absolute;
  top: 20px;
  right: 10px;
  box-shadow: 0px 0px 10px rgba(46, 105, 240, 0.1);
  border-radius: 10px;
  background: #fff;
  padding: 16px 14px;

  .secondBox-title {
    font-size: 12px;
    color: #7d8493;
    font-weight: 500;
  }

  .organization-part {
    padding-bottom: 23px;
  }

  .label-part {
    padding-bottom: 10px;

    .label-part-content {
      padding-bottom: 23px;

      &:last-child {
        padding: 0;
      }
    }

    .udpBox {
      width: 60%;
      word-break: break-all;
    }

    .udp-value-string {
      display: inline-block;
      //border: 1px solid red;
      width: 100%;
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  ul {
    li {
      line-height: 34px;
      display: flex;
      align-items: flex-start;
      .title-name {
        display: flex;
        align-items: center;
        width: 40%;

        img {
          width: 24px;
          height: auto;
        }

        span {
          font-size: 13px;
          color: #333333;
          font-weight: 400;
          padding-left: 6px;
          word-break: break-word;
        }
      }

      .system-value {
        font-size: 13px;
        color: #333333;
      }

      .topUser {
        display: flex;
        align-items: center;

        .headPortrait {
          width: 32px;
          height: 32px;
          border-radius: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          &:nth-of-type(1) {
            background: #e0d5da;
          }

          &:nth-of-type(2) {
            background: #fff0f7;
            margin: 0 10px;
          }

          &:nth-of-type(3) {
            background: #d0e4ef;
          }
        }
      }

      .edit-btn {
        display: none;
      }

      &:hover {
        .edit-btn {
          display: inline-block;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.report-detail-tab {
  .el-tab-pane {
    height: 100%;
    position: relative;
  }
}
.el-form-item.report-link-item {
  width: 100%;
  .el-form-item__content {
    width: 80%;
    span.report-link {
      display: -webkit-box;
      //-webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    span.report-link {
      -webkit-line-clamp: 1;
    }
  }
}
.el-tooltip__popper.report-url-tooltip {
  word-break: break-all;
  max-width: 80%;
}
.detail-info-outer {
  padding-top: 20px;
}
</style>
