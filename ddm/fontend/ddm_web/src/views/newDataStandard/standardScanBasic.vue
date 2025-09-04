<template>
  <div
    style="
      padding: 10px 20px;
      overflow-y: auto;
      overflow-x: hidden;
      height: 100%;
    "
    v-if="details"
  >
    <slot></slot>
    <div class="text-title">
      <div class="title">{{ $t('domain.domain.baseInfo') }}</div>
      <div class="line"></div>
    </div>
    <div class="description-line">
      <div class="details-box">
        <div class="detail" data-id="domainChName">
          <span class="label">{{ $version.domain.property.domainChName }}</span>
          <span class="value">{{ details.chineseName }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ labelText.domainCode }}</span>
          <span class="value">{{ details.domainCode }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.domainEnName }}</span>
          <span class="value">{{ details.englishName }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.domainAbbr }}</span>
          <span class="value">{{ details.abbreviation }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.theme }}</span>
          <span class="value">
            <i class="iconfont icon-file" style="color: #409eff;margin-right: 4px;">
            </i>
            {{ details.path ? details.path.join('/') : '' }}
          </span>
        </div>
        <div
          class="detail"
          v-for="(udp, index) in additionalProperties.filter(
            e => e.catalog === $t('domain.domain.standardProp')
          )"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <datablau-tooltip
            :open-delay="500"
            :disabled="!udp.value.length"
            :content="udp.value"
            style="display: inline-block"
            class="value"
          >
            <span >{{ udp.value }}</span>
          </datablau-tooltip>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line">
      <div class="title">{{ $version.domain.propertyType.business }}</div>
      <div class="line"></div>
      <div class="details-box">
        <div
          class="detail"
          v-if="categoryTypeId !== 2"
          style="min-height: 27px"
        >
          <span class="label">
            {{ $version.domain.property.referenceCode }}
          </span>
          <span
            class="value"
            @click="viewCode(details.referenceCode)"
            style="margin-left: 0.1em; color: #479eff"
          >
            {{ details.referenceCode }}
          </span>
        </div>
        <div class="detail broader">
          <span class="label">{{ $version.domain.property.description }}</span>
          <span class="value" v-html="nl2br(details.description)"></span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.businessRule }}</span>
          <span class="value" v-html="nl2br(details.businessRule)"></span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.source }}</span>
          <span class="value" v-html="nl2br(details.source)"></span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.synonym }}</span>
          <span class="value" v-html="nl2br(details.synonym)"></span>
        </div>
        <div class="detail" v-if="appName.toUpperCase() !== 'DDM'">
          <span class="label">
            {{ $version.domain.property.authCategoryId }}
          </span>
          <span class="value" v-html="nl2br(details.authCategoryName)"></span>
        </div>
        <div class="detail" v-if="categoryTypeId === 2">
          <span class="label">{{ $version.domain.property.function }}</span>
          <span class="value" v-html="nl2br(details.function)"></span>
        </div>
        <div class="detail" v-if="categoryTypeId === 2">
          <span class="label">{{ $version.domain.property.measureUnit }}</span>
          <span class="value" v-html="nl2br(details.measureUnit)"></span>
        </div>
        <div class="detail" v-if="categoryTypeId === 2">
          <span class="label">
            {{ $version.domain.property.monitorObjects }}
          </span>
          <span class="value" v-html="nl2br(details.monitorObjects)"></span>
        </div>
        <div
          class="detail"
          v-for="(udp, index) in additionalProperties.filter(
            e => e.catalog === $t('domain.domain.businessProp')
          )"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <datablau-tooltip
            :open-delay="500"
            :disabled="!udp.value.length"
            :content="udp.value"
            style="display: inline-block"
            class="value"
          >
            <span>{{ udp.value }}</span>
          </datablau-tooltip>
        </div>
        <br v-if="categoryTypeId === 2"/>
        <div class="detail" v-if="categoryTypeId === 2">
          <span class="label">{{ $version.domain.property.dim }}</span>
          <span class="value" v-html="dimCodeStr"></span>
          <span class="value" v-if="false">
            <span class="list-outer" style="max-width: 80%">
              <span
                v-for="d in details.dimCodes"
                v-if="d.catalog.dimensionType === 'NORMAL'"
              >
                {{ d.catalog.catalog }} / {{ d.value }}
                <br/>
              </span>
            </span>
          </span>
        </div>
        <br/>
      </div>
    </div>
    <div class="prop-line alg-line">
      <div class="title">{{ $version.domain.propertyType.management }}</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">
            {{ $version.domain.property.descriptionDepartment }}
          </span>
          <span class="value">{{ details.descriptionDepartmentName }}</span>
        </div>
        <div class="detail" v-if="categoryTypeId === 2">
          <span class="label">{{ $version.domain.property.parentCode }}</span>
          <span class="value">{{ details.parentCode }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.ownerOrg }}</span>
          <span class="value">{{ details.ownerOrgName }}</span>
        </div>

        <div
          class="detail"
          v-for="(udp, index) in additionalProperties.filter(
            e => e.catalog === $t('domain.domain.manageProp')
          )"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <datablau-tooltip
            :open-delay="500"
            :disabled="!udp.value.length"
            :content="udp.value"
            style="display: inline-block"
            class="value"
          >
            <span>{{ udp.value }}</span>
          </datablau-tooltip>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line">
      <div class="title">{{ $version.domain.propertyType.technology }}</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">{{ $version.domain.property.rangeType }}</span>
          <span class="value">{{ details.rangeType }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.dataType }}</span>
          <span class="value">{{ details.dataType }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.dataScale }}</span>
          <span class="value">{{ details.dataScale }}</span>
        </div>
        <div class="detail">
          <span class="label">
            {{ $version.domain.property.dataPrecision }}
          </span>
          <span class="value">{{ details.dataPrecision }}</span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.notNull }}</span>
          <span class="value">
            {{
              details.notNull
                ? $t('domain.common.true')
                : $t('domain.common.false')
            }}
          </span>
        </div>
        <div class="detail">
          <span class="label">{{ $version.domain.property.dataFormat }}</span>
          <span class="value">{{ details.dataFormat }}</span>
        </div>
        <!-- <div class="detail">
          <span class="label">{{ $version.domain.property.ownerOrg }}</span>
          <span class="value">{{ details.ownerOrgName }}</span>
        </div> -->
        <div
          class="detail"
          v-for="(udp, index) in additionalProperties.filter(
            e => e.catalog === $t('domain.domain.techProp')
          )"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <datablau-tooltip
            :open-delay="500"
            :disabled="!udp.value.length"
            :content="udp.value"
            style="display: inline-block"
            class="value"
          >
            <span>{{ udp.value }}</span>
          </datablau-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import scan from './standardScanBasic.js'

export default scan
</script>
<style lang="scss" scoped>
@import './standardScan';

.detail {
  min-height: 27.33px;
  width: 450px !important;
  margin-right: 0 !important;
}

.details-box .detail.broader .value {
  width: initial;
  max-width: initial;
}
</style>
