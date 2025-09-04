<template>
  <div :class="{ en: $i18n.locale === 'en' }">
    <div class="descriptionMessage-title">
      <p class="message-title">{{ $t('domain.domain.baseInfo') }}</p>
    </div>
    <div class="description-line">
      <div class="details-box">
        <div class="detail">
          <span class="label">{{ $t('system.systemSetting.dir') }}</span>
          <span class="value">
            <i class="iconfont icon-file"></i>
            {{ details.path ? details.path.join('/') : '' }}
          </span>
        </div>
        <div class="detail">
          <span class="label">{{ $t('indicator.definition.type') }}</span>
          <span class="value">
            {{ IndexTypeLabel[details.metricType] }}
          </span>
        </div>
        <br />
        <div class="detail">
          <span class="label">{{ $t('indicator.definition.domainCode') }}</span>
          <span class="value">{{ details.domainCode }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $t('indicator.dimension.requirement') }}</span>
          <span class="value">
            {{
              requirementOption &&
              details.requirementId &&
              requirementOption.filter(i => i.id === details.requirementId)[0]
                ? requirementOption.filter(
                    i => i.id === details.requirementId
                  )[0].name
                : ''
            }}
          </span>
        </div>
        <br />
        <div class="detail" data-id="domainChName">
          <span class="label">
            {{ $t('indicator.definition.chineseName') }}
          </span>
          <span class="value">{{ details.chineseName }}</span>
        </div>
        <div class="detail">
          <span class="label">
            {{ $t('indicator.definition.englishName') }}
          </span>
          <span class="value">{{ details.englishName }}</span>
        </div>
        <br />
        <div class="detail">
          <span class="label">
            {{ $t('indicator.definition.abbreviation') }}
          </span>
          <span class="value">{{ details.abbreviation }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $t('indicator.definition.validRange') }}</span>
          <span class="value">
            <span v-if="details.takeEffectDate">
              {{ $dateFormatter(details.takeEffectDate) }} ~
              {{ $dateFormatter(details.expireDate) }}
            </span>
          </span>
        </div>
        <!--        <div class="detail">
          <span class="label">安全等级</span>
          <span class="value">{{ SafeLevelLabel[details.safeLevel] }}</span>
        </div>-->
        <div
          class="detail"
          v-for="(udp, index) in additionalProperties.filter(
            e => e.catalog === '标准属性'
          )"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <span class="value" v-html="htmlValue(udp.value)"></span>
        </div>
      </div>
      <div class="descriptionMessage-title" style="margin-top: 10px">
        <p class="message-title">{{ $t('domain.domain.businessInfo') }}</p>
      </div>
      <div class="description-line">
        <div class="details-box">
          <div class="detail broader">
            <span class="label">
              {{ $t('indicator.definition.description') }}
            </span>
            <span class="value" v-html="htmlValue(details.description)"></span>
          </div>
          <div class="detail">
            <span class="label">{{ $t('domain.domain.measureUnit') }}</span>
            <span class="value">{{ details.measureUnit }}</span>
          </div>
          <!--          <div class="detail broader">
            <span class="label">指标公式</span>
            <span class="value">{{ details.function }}</span>
          </div>-->
          <!--<div class="detail">
            <span class="label">{{ $t('domain.domain.authCategoryId') }}</span>
            <span class="value">{{ details.authCategoryName }}</span>
          </div>
          <div class="detail" data-id="domainChName">
            <span class="label">{{ $t('domain.domain.synonym') }}</span>
            <span class="value">{{ details.synonym }}</span>
          </div>-->
          <div
            class="detail"
            v-for="(udp, index) in additionalProperties.filter(
              e => e.catalog === '业务属性'
            )"
            :key="index"
          >
            <span class="label">{{ udp.name }}</span>
            <span class="value" v-html="htmlValue(udp.value)"></span>
          </div>
          <!--<div
            class="detail detail_xsc"
            style="width: 1200px !important"
            v-if="`${details.metricType}` === '1'"
          >
            <div class="detail_xsc_i">
              <span class="label label_xsc">{{ $t('domain.domain.dim') }}</span>
              <div class="value_xsc">
                <div
                  class="value_xsc_i"
                  v-for="item in details.relationDimensionValues"
                >
                  <datablau-tooltip
                    class="value_xsc_i_desc"
                    :content="item.description"
                    placement="bottom-start"
                    style="margin-right: 6px"
                    :open-delay="500"
                  >
                    <span class="value_xsc_i_desc">{{ item.description }}</span>
                  </datablau-tooltip>
                  <el-tag
                    v-for="(dim, i) in item.dimensionValues"
                    :key="`${dim.codeId}${dim.parentId}`"
                    style="margin-right: 10px; margin-bottom: 6px"
                  >
                    {{ dim.chineseName }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>-->
        </div>
      </div>
      <div
        class="descriptionMessage-title"
        v-if="[IndexType.DERIVE, IndexType.FORK].includes(formData.metricType)"
      >
        <p class="message-title">指标构成</p>
      </div>
      <div
        class="description-line"
        v-if="[IndexType.DERIVE, IndexType.FORK].includes(formData.metricType)"
      >
        <div class="details-box">
          <div class="detail broader">
            <span class="label">原子/衍生指标</span>
            <span class="value">
              <relation-domain-list
                :domainCodes="details.relationDomain"
                :categoryTypeId="5"
              ></relation-domain-list>
            </span>
          </div>
        </div>
      </div>
      <div
        class="description-line"
        v-if="[IndexType.FORK].includes(formData.metricType)"
      >
        <div class="details-box">
          <div class="detail broader">
            <span class="label">时间周期</span>
            <span
              class="value"
              v-if="formData.timeModifierRefs && formData.timeModifierRefs[0]"
            >
              时间周期类型：{{
                formData.timeModifierRefs[0].modifierType
              }}
              &nbsp;时间周期代码：{{
                formData.timeModifierRefs[0].code
              }}
              &nbsp;时间周期：{{ formData.timeModifierRefs[0].name }}
            </span>
          </div>
          <div class="detail broader">
            <span class="label">修饰词</span>
            <span class="value">
              <datablau-table
                style="width: 800px"
                :data="formData.modifierRefs"
              >
                <el-table-column
                  label="修饰类型"
                  prop="modifierType"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="修饰词代码"
                  prop="code"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="修饰词"
                  prop="name"
                  show-overflow-tooltip
                ></el-table-column>
              </datablau-table>
            </span>
          </div>
        </div>
      </div>
      <div class="descriptionMessage-title">
        <p class="message-title">{{ $t('domain.domain.techInfo') }}</p>
      </div>
      <div class="description-line">
        <div class="details-box">
          <div class="detail">
            <span class="label">
              {{ $version.domain.property.rangeType }}
            </span>
            <span class="value">{{ details.rangeType }}</span>
          </div>
          <div class="detail">
            <span class="label">
              {{ $version.domain.property.dataType }}
            </span>
            <span class="value">{{ details.dataType }}</span>
          </div>
          <div class="detail">
            <span class="label">
              {{ $version.domain.property.dataScale }}
            </span>
            <span class="value">{{ details.dataScale }}</span>
          </div>
          <div class="detail">
            <span class="label">
              {{ $version.domain.property.dataPrecision }}
            </span>
            <span class="value">{{ details.dataPrecision }}</span>
          </div>
          <div class="detail">
            <span class="label">{{ $t('domain.domain.dataFormat') }}</span>
            <span class="value">{{ details.dataFormat }}</span>
          </div>
          <div
            class="detail"
            v-for="(udp, index) in additionalProperties.filter(
              e => e.catalog === '技术属性'
            )"
            :key="index"
          >
            <span class="label">{{ udp.name }}</span>
            <span class="value" v-html="htmlValue(udp.value)"></span>
          </div>
        </div>
      </div>
      <div class="descriptionMessage-title" style="margin-top: 20px">
        <p class="message-title">{{ $t('domain.domain.manageInfo') }}</p>
      </div>
      <div class="description-line">
        <div class="details-box">
          <div class="detail">
            <span class="label">
              {{ $t('domain.domain.tecDefinitionDep') }}
            </span>
            <span class="value">{{ details.ownerOrgName }}</span>
          </div>
          <div class="detail">
            <span class="label">
              {{ $t('domain.domain.busDefinitionDep') }}
            </span>
            <span class="value">{{ details.descriptionDepartmentName }}</span>
          </div>
          <br />
          <div class="detail">
            <span class="label">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.edges.techLeader') }}
            </span>
            <span class="value">{{ userMap[details.techOwner] }}</span>
          </div>
          <div class="detail">
            <span class="label">
              {{ $t('meta.DS.tableDetail.knowledgeGraph.edges.busiLeader') }}
            </span>
            <span class="value">{{ userMap[details.businessOwner] }}</span>
          </div>
          <br />
          <!--<div class="detail">
            <span class="label">资产负责人</span>
            <span class="value">{{ userMap[details.managementOwner] }}</span>
          </div>-->
          <div
            class="detail"
            v-for="(udp, index) in additionalProperties.filter(
              e => e.catalog === '管理属性'
            )"
            :key="index"
          >
            <span class="label">{{ udp.name }}</span>
            <span class="value" v-html="htmlValue(udp.value)"></span>
          </div>
        </div>
      </div>
    </div>
    <!--    {{ formData }}-->
  </div>
</template>
<script>
import {
  IndexType,
  IndexTypeLabel,
  IndexTypeLabelEn,
  SafeLevelLabel
} from './class/Enum.ts'
import UserInformationService from '@service/UserInformationService'
import relationDomainList from '@/dataWarehouse/views/dataIndex/damComponents/newDataStandard/relationDomainList.vue'
import { IndexPage } from './entrance/Constant'
import $version from '@/resource/version.json'
export default {
  props: {
    indexPage: IndexPage,
    formData: {},
    requirementOption: {},
    udps: {}
  },
  components: {
    relationDomainList
  },
  data () {
    return {
      IndexType: IndexType,
      userMap: {},
      additionalProperties: [],
      $version: $version
    }
  },
  beforeCreate () {
    this.$version = $version
  },
  methods: {
    htmlValue (value) {
      if (value && typeof value === 'string') {
        return value.replace(/\n/g, '<br>').replace(/<script>/g, '')
      } else {
        return ''
      }
    },
    getNameByUserName () {
      const users = [
        this.details.techOwner,
        this.details.businessOwner,
        this.details.managementOwner
      ]
      UserInformationService.getUsernames(users).then(map => {
        map.forEach((item, index) => {
          this.$set(this.userMap, index, item)
        })
      })
    },
    getUdpCurrent () {
      const propertiesObj = this.formData.additionalProperties || []
      this.additionalProperties = []
      propertiesObj.forEach(e => {
        if (this.udps.filter(item => item.udpId === parseInt(e[0])).length) {
          const obj = {
            name: this.udps.filter(item => item.udpId === parseInt(e[0]))[0]
              .name,
            value: e[1],
            catalog: this.udps.filter(item => item.udpId === parseInt(e[0]))[0]
              .catalog
          }
          this.additionalProperties.push(obj)
        }
      })
    }
  },
  beforeMount () {},
  mounted () {
    this.getNameByUserName()
    this.getUdpCurrent()
  },
  computed: {
    details () {
      return this.formData
    },
    IndexTypeLabel () {
      if (this.$i18n.locale === 'en') {
        return IndexTypeLabelEn
      } else {
        return IndexTypeLabel
      }
    },
    SafeLevelLabel () {
      return SafeLevelLabel
    }
  }
}
</script>
<style lang="scss" scoped>
/*@import '~@/view/newDataStandard/standardScan.scss';*/
@import "~@/views/newDataStandard/standardScan.scss";
.details-box {
  .detail .label {
  }
  max-width: 1200px;
  .detail:nth-of-type(odd) {
    width: 480px !important;
  }
  .detail:nth-of-type(even) {
    width: 480px !important;
    margin-right: 50px;
  }
  .detail.broader {
    width: 1230px !important;
  }
  .detail_xsc {
    .detail_xsc_i {
      display: flex !important;
    }
    .label_xsc {
      width: 120px;
      min-width: 120px;
    }
    .value_xsc {
      //flex: 1;
      max-width: 1060px;
      .value_xsc_i {
        display: flex;
        margin-bottom: 10px;
        //height: 40px;
        .value_xsc_i_desc {
          margin-right: 10px;
          max-width: 160px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-top: 1.5px;
        }
      }
    }
  }
}
</style>
