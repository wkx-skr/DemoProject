<template>
  <div
    id="standard-scan"
    style="overflow-y: auto; overflow-x: hidden; height: 100%"
    v-if="getData"
    class="standard-scan-page"
  >
    <slot></slot>
    <datablau-dialog
      title="$version.domain.viewCode"
      width="850px"
      append-to-body
      :visible.sync="codeDialogVisible"
    >
      <div class="content">
        <view-code
          :code="code"
          :key="code"
          :categoryId="details.categoryId"
        ></view-code>
      </div>
      <span slot="footer">
        <datablau-button @click="codeDialogVisible = false">
          {{ $t('domain.common.cancel') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('version.map')"
      fullscreen
      :visible.sync="mapVisible"
      v-if="mapVisible"
    >
      <div style="position: absolute; top: 50px; left: 0; bottom: 0; right: 0">
        <datablau-property-map
          data-type="domain"
          :data-id="details.domainId"
          :data-name="details.chineseName"
        ></datablau-property-map>
      </div>
    </datablau-dialog>
    <div class="datablau-breadcrumb-header" v-if="!hideHeader">
      <div>
        <datablau-breadcrumb
          @back="goBack"
          :node-data="nodeData"
          :couldClick="false"
        ></datablau-breadcrumb>
      </div>
    </div>
    <div class="detail-box" style="padding-bottom: 20px">
      <div class="title-line clearfix">
        <div class="text-box">
          <div class="left-box">
            <datablau-icon
              v-if="details && details.categoryId === 2"
              data-type="index"
              key="index"
              :isIcon="true"
              :size="42"
            ></datablau-icon>
            <datablau-icon
              v-if="details && details.categoryId !== 2"
              data-type="dataStandard"
              key="dataStandard"
              :size="42"
            ></datablau-icon>
          </div>
          <div class="right-box">
            <div class="top-box">
              <h2>{{ details.chineseName }}</h2>
              <datablau-button
                v-if="
                  $auth['DATA_STANDARD_EDIT'] &&
                  categoryTypeId === 2 &&
                  !hideDerive &&
                  details.state !== 'C'
                "
                :title="$t('domain.domain.derive')"
                size="mini"
                icon="fa fa-link"
                type="text"
                @click="handleDerive"
                style="margin-left: 20px"
              >
                {{ $t('domain.domain.derive') }}
              </datablau-button>
            </div>
            <div class="text-row">
              <p>{{ details.domainCode }}</p>
              <!-- <div class="img">
              <datablau-icon  data-type="table" :size="15" ></datablau-icon>
            </div> -->
            </div>
          </div>
        </div>
        <datablau-button
          v-if="
            showUpdate &&
            writable &&
            $auth['DATA_STANDARD_EDIT'] &&
            stas !== 'false' &&
            hasEditAuth
          "
          type="primary"
          class="btn-right"
          :title="$t('common.button.edit')"
          size="mini"
          @click="handleEdit"
        >
          {{ $t('common.button.edit') }}
        </datablau-button>
        <div class="sub-button" v-if="isShow">
          <datablau-subscribe
            v-if="
              details.state === 'A' &&
              details.path &&
              stas !== 'false' &&
              useDam
            "
            style="margin: 1px 2em; vertical-align: top"
            type-id="80010066"
            display-type="buttonWithIcon"
            :object-name="details.path.join('/') + '/' + details.chineseName"
            :object-id="details.domainId"
            :domainFolderId="details.categoryId"
          ></datablau-subscribe>
        </div>
        <white-list
          style="float: right; margin-right: 10px"
          :isSecurity="isAnquan"
          v-if="dataSecurity && data && data.domainId"
          :itemId="data.domainId"
          :itemType="80010066"
        ></white-list>
        <div
          class="right-button-box"
          :style="{
            'min-width': $versionFeature['domain_Comments'] ? '150px' : '80px',
          }"
          v-if="useDam || useWorkflow"
          v-show="isShow"
        >
          <div class="status-box" v-if="useWorkflow">
            <div class="title">{{ $t('domain.common.publishStatus') }}</div>
            <div class="status">
              <span
                :style="`background-color:${getStatusColor}`"
                class="circle"
              ></span>
              <span :style="`color:${getStatusColor}`">
                {{ getStatusText }}
              </span>
            </div>
          </div>
          <div class="vote" v-if="$versionFeature['domain_Comments'] && useDam">
            <div class="title" style="display: inline-block; width: 100%">
              {{ $t('domain.common.score') }}
            </div>
            <el-rate disabled v-model="vote"></el-rate>
          </div>
          <div class="visit-box" v-if="useDam">
            <div class="title change">{{ $t('domain.domain.visitCount') }}</div>
            <p>{{ this.visit }}</p>
          </div>
        </div>
        <div
          class="sup-name"
          v-if="
            categoryTypeId === 2 &&
            this.parentDomain &&
            this.parentDomain.chineseName
          "
          :title="this.parentDomain.chineseName"
        >
          <i class="fa fa-link"></i>
          <datablau-tooltip
            :content="parentDomain.state === 'X' ? '已废弃' : ''"
            placement="bottom-start"
            :disabled="!(parentDomain.state === 'X')"
          >
            <span
              :style="{
                'text-decoration':
                  parentDomain.state === 'X' ? 'line-through' : 'auto',
              }"
            >
              {{ this.parentDomain.chineseName }}
            </span>
          </datablau-tooltip>
        </div>
        <el-alert
          v-if="domainHasComment.has(details.domainId)"
          style="margin-top: 1em"
          type="error"
          show-icon
          :title="$t('domain.common.applyDeny')"
          :description="
            domainHasComment.get(details.domainId)
              ? $t('domain.domain.reason') +
                $t('domain.common.colon') +
                domainHasComment.get(details.domainId)
              : ''
          "
        ></el-alert>
      </div>
      <datablau-tabs
        v-if="!dataSecurity"
        v-model="activeName"
        @tab-click="handleClick"
        class="standardtabs-table-details"
        style="
          clear: both;
          position: absolute;
          bottom: 0;
          left: 20px;
          right: 20px;
          top: 70px;
        "
      >
        <el-tab-pane :label="$t('domain.domain.infoShow')" name="first">
          <div class="descriptionMessage-title">
            <p class="message-title">{{ $t('domain.domain.symbolInfo') }}</p>
          </div>
          <div class="description-line">
            <div class="details-box">
              <div class="detail">
                <span class="label">{{ labelText.domainCode }}</span>
                <span class="value">{{ details.domainCode }}</span>
              </div>
              <div class="detail" data-id="domainChName">
                <span class="label">
                  {{ $version.domain.property.domainChName }}
                </span>
                <span class="value">{{ details.chineseName }}</span>
              </div>
              <div class="detail">
                <span class="label">
                  {{ $version.domain.property.domainEnName }}
                </span>
                <span class="value">{{ details.englishName }}</span>
              </div>
              <div id="long-text" class="detail">
                <span class="label">
                  {{ $version.domain.property.synonym }}
                </span>
                <span class="value" v-html="nl2br(details.synonym)"></span>
              </div>
              <div
                id="long-text"
                class="detail"
                v-for="(udp, index) in additionalProperties.filter(
                  e => e.catalog === $t('domain.domain.symbolProp')
                )"
                :key="index"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <div style="display: inline-block">
                  <span style="white-space: pre-wrap">{{ udp.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="prop-line alg-line">
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('domain.domain.defineInfo') }}
              </p>
            </div>
            <div class="details-box">
              <div class="detail broader">
                <span class="label">
                  {{ $version.domain.property.description }}
                </span>
                <span class="value" v-html="nl2br(details.description)"></span>
              </div>
              <div class="detail broader" style="display: none"></div>
              <div id="long-text" class="detail">
                <span class="label">
                  {{ $version.domain.property.businessRule }}
                </span>
                <span class="value" v-html="nl2br(details.businessRule)"></span>
              </div>
              <div
                id="long-text"
                class="detail"
                v-for="(udp, index) in additionalProperties.filter(
                  e => e.catalog === $t('domain.domain.defineProp')
                )"
                :key="index"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <div style="display: inline-block">
                  <span style="white-space: pre-wrap">{{ udp.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="prop-line alg-line">
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('domain.domain.relaInfo') }}
              </p>
            </div>
            <div class="details-box">
              <!-- 关联业务术语 -->
              <div class="detail" v-if="useDam">
                <span class="label">关联业务术语</span>
                <span
                  class="value"
                  v-html="nl2br(details.referenceTermName)"
                ></span>
              </div>
              <!-- 关联旧标准 s -->
              <div class="detail2">
                <span class="label">
                  {{ $t('domain.domain.referenceOldDomain') }}
                </span>
              </div>
              <div class="list-outer">
                <relation-domain-list
                  :domainCodes="details.relationDomain"
                  :relationDomainState="details.relationDomainState"
                  :categoryTypeId="categoryTypeId"
                ></relation-domain-list>
              </div>
              <!-- 关联旧标准 e -->
              <div
                id="long-text"
                class="detail"
                v-for="(udp, index) in additionalProperties.filter(
                  e => e.catalog === $t('domain.domain.relaProp')
                )"
                :key="index"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <div style="display: inline-block">
                  <span style="white-space: pre-wrap">{{ udp.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 表示类属性 start -->
          <div class="prop-line alg-line">
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('domain.domain.expressInfo') }}
              </p>
            </div>
            <div class="details-box">
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
              <div class="detail" v-if="details.unit">
                <span class="label">
                  数据单位
                </span>
                <span class="value">{{ details.unit }}</span>
              </div>
              <div class="detail">
                <span class="label">
                  {{ $version.domain.property.dataPrecision }}
                </span>
                <span class="value">{{ details.dataPrecision }}</span>
              </div>
              <div class="detail broader" v-if="categoryTypeId !== 2">
                <span class="label">
                  {{ this.$t('domain.domain.referenceCode') }}
                </span>
                <span class="value" style="margin-left: 0.1em; color: #479eff">
                  <datablau-tooltip
                    :content="
                      details.referenceCodeState === 'X' ? '已废弃' : ''
                    "
                    placement="bottom-start"
                    :disabled="details.referenceCodeState !== 'X'"
                  >
                    <span
                      style="cursor: pointer"
                      :class="{
                        XStyle: details.referenceCodeState === 'X',
                      }"
                      @click="viewCode(details.referenceCode)"
                    >
                      {{ details.referenceName }}
                    </span>
                  </datablau-tooltip>
                </span>
              </div>
              <div id="long-text" class="detail">
                <span class="label">取值范围</span>
                <span class="value">
                  {{
                    details.minValue ||
                    details.minValue === 0 ||
                    details.maxValue ||
                    details.maxValue === 0
                      ? `${
                          details.minValue || details.minValue === 0
                            ? details.minValue
                            : ''
                        } 至 ${
                          details.maxValue || details.maxValue === 0
                            ? details.maxValue
                            : ''
                        }`
                      : ''
                  }}
                </span>
              </div>
              <div id="long-text" class="detail">
                <span class="label">
                  {{ $version.domain.property.dataFormat }}
                </span>
                <span class="value">{{ details.dataFormat }}</span>
              </div>
              <div
                id="long-text"
                class="detail"
                v-for="(udp, index) in additionalProperties.filter(
                  e => e.catalog === $t('domain.domain.expressProp')
                )"
                :key="index"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <div style="display: inline-block">
                  <span style="white-space: pre-wrap">{{ udp.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 表示类属性 end -->

          <!-- 管理类属性 start -->
          <div class="prop-line alg-line">
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('domain.domain.newManageInfo') }}
              </p>
            </div>
            <div class="details-box">
              <div class="detail" style="width: 1000px">
                <span class="label">{{ '业务域' }}</span>
                <span class="value" style="width: 500px">
                  <!-- <span class="icon-i-folder">
                    <span class="path1"></span>
                    <span class="path3"></span>
                  </span> -->
                  <i class="iconfont icon-file"></i>
                  {{ detailPath }}
                </span>
              </div>
              <div class="detail" v-if="useDam">
                <span class="label">
                  {{ $version.domain.property.authCategoryId }}
                </span>
                <span
                  class="value"
                  v-html="nl2br(details.authCategoryName)"
                ></span>
              </div>
              <div
                id="long-text"
                class="detail"
                v-for="(udp, index) in additionalProperties.filter(
                  e => e.catalog === $t('domain.domain.newManageProp')
                )"
                :key="index"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <div style="display: inline-block">
                  <span style="white-space: pre-wrap">{{ udp.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 管理类属性 end -->

          <!-- 附加类属性 start -->
          <div class="prop-line alg-line">
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('domain.domain.additionInfo') }}
              </p>
            </div>
            <div class="details-box">
              <!-- <div class="detail">
                <span class="label">
                  {{ $version.domain.property.domainAbbr }}
                </span>
                <span class="value">{{ details.abbreviation }}</span>
              </div> -->
              <div id="long-text" class="detail">
                <span class="label">{{ $version.domain.property.source }}</span>
                <span class="value" v-html="nl2br(details.source)"></span>
              </div>
              <div
                id="long-text"
                class="detail"
                v-for="(udp, index) in additionalProperties.filter(
                  e => e.catalog === $t('domain.domain.additionProp')
                )"
                :key="index"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="190"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <div style="display: inline-block">
                  <span style="white-space: pre-wrap">{{ udp.value }}</span>
                </div>
              </div>
              <div class="detail">
                <span class="label">{{ $t('domain.common.creator') }}</span>
                <span class="value">{{ details.submitter }}</span>
              </div>
              <div class="detail">
                <span class="label">{{ $t('domain.domain.createTime') }}</span>
                <span class="value">
                  {{ $timeFormatter(details.createTime) }}
                </span>
              </div>
              <div class="detail">
                <span class="label">
                  {{ $version.tableHeader.publishTime }}
                </span>
                <span class="value">
                  {{ $timeFormatter(details.firstPublish) }}
                </span>
              </div>
              <div class="detail">
                <span class="label">
                  {{ $t('domain.domain.lastUpdateTime') }}
                </span>
                <span class="value">
                  {{ $timeFormatter(details.lastModification) }}
                </span>
              </div>
            </div>
          </div>
          <!-- 附加类属性 end -->

          <div
            class="prop-line alg-line"
            v-if="
              (typeIds === 1 || typeIds === 2) &&
              headerProduction.toUpperCase() === 'DAM'
            "
            v-show="isShow"
          >
            <div class="descriptionMessage-title">
              <p class="message-title">
                {{ $t('domain.domain.labelInformation') }}
              </p>
            </div>
            <div class="details-box">
              <div
                style="margin-top: 10px"
                v-if="!Boolean($route.query.isAssets)"
              >
                <datablau-button
                  type="normal"
                  @click="beforeAddTag"
                  :title="$t('meta.DS.tableDetail.addTagTittle')"
                >
                  {{ $t('meta.DS.tableDetail.addTag') }}
                  <i class="el-icon-plus" style="font-weight: bold"></i>
                </datablau-button>
              </div>
              <div
                class="detail"
                v-for="(tagsTree, key, index) in tagsTreeArr"
                :key="index"
              >
                <span class="label">
                  <img
                    src="/static/images/metadataIcon/metadataTags.svg"
                    alt=""
                  />
                  {{ tagsTree.parentName }}
                </span>
                <span class="value">
                  <div class="tags" style="margin-top: 0">
                    <el-tag
                      :closable="!Boolean($route.query.isAssets)"
                      @close="handleClose(tagsTree)"
                    >
                      {{ tagsTree.name }}
                    </el-tag>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <!--        <el-tab-pane :label="$t('domain.domain.quoteInfo')" name="second">
          <div style="padding: 0" class="prop-line alg-line">
            <div class="descriptionMessage-title" style="margin-bottom: 20px">
              <p class="message-title">
                {{ $t('domain.domain.dataDomainReference') }}
              </p>
            </div>
            <quoto
              v-if="activeName === 'second'"
              :domainId="details.domainId"
              :domainCode="details.domainCode"
              :key="details.domainId"
              :categoryTypeId="categoryTypeId"
            ></quoto>
            <div
              class="descriptionMessage-title"
              style="margin-bottom: 20px; padding-top: 20px"
            >
              <p class="message-title">
                {{ $t('domain.domain.relationDocuments') }}
              </p>
            </div>
            <relation-doc
              :hideEdit="true"
              :documentsIds="details.documentIds"
              :useDam="false"
            ></relation-doc>
          </div>
        </el-tab-pane>-->
        <el-tab-pane
          label="数据规则"
          name="sixth"
          style="position: absolute; top: 2px; left: 0; right: 0; bottom: 0"
          v-if="
            details.categoryId === 1 &&
            $appName !== 'DDM' &&
            $auth['DOMAIN_RULE_MANAGE'] &&
            $versionFeature['domain_DataRule']
          "
        >
          <data-rule
            @openManage="openManage"
            v-if="activeName === 'sixth'"
            ref="dataRule"
            :isAssets="isAssets"
            :domainCode="details.domainCode"
            @openDialogDomainRule="openDialogDomainRule"
          ></data-rule>
        </el-tab-pane>
        <el-tab-pane
          v-if="
            false &&
            $versionFeature['graph_KnowledgeGraph'] &&
            useDam &&
            $knowledgeGraphEnabled &&
            details.categoryId !== 3
          "
          :label="$t('domain.domain.relationship')"
          name="third"
        >
          <knowledgeGraph
            v-if="activeName === 'third'"
            ref="knowledgeGraph"
            :summary="{ properties: { Id: data.domainId, TypeId: '80010066' } }"
          ></knowledgeGraph>
          <!-- :summary="{ properties: { Id: data.domainId, TypeId: '80010066' } }" -->
        </el-tab-pane>
        <el-tab-pane v-if="isShow" :label="$t('domain.domain.changeHistory')" name="fourth">
          <div style="padding-top: 0" class="prop-line alg-line">
            <!--<div class="title">{{ $version.domain.propertyType.version }}</div>-->
            <!-- <div class="line"></div> -->
            <version
              v-if="activeName === 'fourth'"
              :typeIds="typeIds"
              :domainId="details.domainId"
              :key="details.domainId"
              :udps="udps"
            ></version>
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('domain.domain.questionAndAnswer')"
          name="fifth"
          v-if="false && $versionFeature['domain_Comments'] && useDam"
        >
          <comment
            v-if="activeName === 'fifth'"
            :objectId="data.domainId"
            :showRate="true"
            :typeId="80010066"
            :typeCategoryId="details.categoryId === 1 ? 80010066 : 82800003"
            @rateSubmitSuccess="updateRate"
          ></comment>
        </el-tab-pane>
      </datablau-tabs>
      <div v-else style="padding: 0 20px">
        <div class="descriptionMessage-title" style="margin-top: 20px">
          <p class="message-title">{{ $t('domain.domain.baseInfo') }}</p>
        </div>
        <div class="description-line">
          <!-- <div class="description" v-html="details.description"></div> -->
          <div class="details-box">
            <div class="detail" data-id="domainChName">
              <span class="label">
                {{ $version.domain.property.domainChName }}
              </span>
              <span class="value">{{ details.chineseName }}</span>
            </div>
            <div class="detail">
              <span class="label">{{ labelText.domainCode }}</span>
              <span class="value">{{ details.domainCode }}</span>
            </div>
            <div class="detail">
              <span class="label">
                {{ $version.domain.property.domainEnName }}
              </span>
              <span class="value">{{ details.englishName }}</span>
            </div>
            <div class="detail">
              <span class="label">
                {{ $version.domain.property.domainAbbr }}
              </span>
              <span class="value">{{ details.abbreviation }}</span>
            </div>
            <div class="detail" v-if="categoryTypeId !== 2">
              <span class="label">
                {{ $version.domain.property.referenceCode }}
              </span>
              <span
                class="value"
                @click="viewCode(details.referenceCode)"
                style="margin-left: 0.1em; color: #479eff; cursor: pointer"
              >
                {{ details.referenceCode }}
              </span>
            </div>
            <div
              class="detail"
              v-for="(udp, index) in additionalProperties.filter(
                e => e.catalog === $t('domain.domain.standardProp')
              )"
              :key="index"
            >
              <udp-form-label
                :content="`${udp.name}`"
                :strWidth="190"
                :showModel="true"
              ></udp-form-label>
              <!--<span class="label">{{ udp.name }}</span>-->
              <div style="display: inline-block">
                <span style="white-space: pre-wrap">{{ udp.value }}</span>
              </div>
            </div>
            <div class="detail" style="width: 800px">
              <span class="label">{{ $version.domain.property.theme }}</span>
              <span class="value" style="width: 500px">
                <i class="iconfont icon-file"></i>
                {{ details.path ? details.path.join('/') : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="prop-line alg-line" style="padding-top: 20px">
          <div class="descriptionMessage-title">
            <p class="message-title">
              {{ $version.domain.propertyType.business }}
            </p>
          </div>
          <div class="details-box">
            <div class="detail broader">
              <span class="label">
                {{ $version.domain.property.description }}
              </span>
              <span class="value" v-html="nl2br(details.description)"></span>
            </div>
            <div class="detail broader" style="display: none"></div>
            <div class="detail">
              <span class="label">
                {{ $version.domain.property.businessRule }}
              </span>
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
            <div class="detail">
              <span class="label">
                {{ $version.domain.property.authCategoryId }}
              </span>
              <span
                class="value"
                v-html="nl2br(details.authCategoryName)"
              ></span>
            </div>
            <div id="long-text" class="detail" v-if="categoryTypeId === 2">
              <span class="label">{{ $version.domain.property.function }}</span>
              <span class="value" v-html="nl2br(details.function)"></span>
            </div>
            <div id="long-text" class="detail" v-if="categoryTypeId === 2">
              <span class="label">
                {{ $version.domain.property.measureUnit }}
              </span>
              <span class="value" v-html="nl2br(details.measureUnit)"></span>
            </div>
            <div id="long-text" class="detail" v-if="categoryTypeId === 2">
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
              <udp-form-label
                :content="`${udp.name}`"
                :strWidth="190"
                :showModel="true"
              ></udp-form-label>
              <!--<span class="label">{{ udp.name }}</span>-->
              <div style="display: inline-block">
                <span style="white-space: pre-wrap">{{ udp.value }}</span>
              </div>
            </div>
            <br v-if="categoryTypeId === 2" />
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
                    <br />
                  </span>
                </span>
              </span>
            </div>
            <br />
            <!-- <div class="detail">
            <span class="label">{{$version.domain.property.relationDocuments}}</span>
          </div> -->
            <!-- <div class="list-outer" style="max-width: 80%;">

          </div> -->
            <div class="detail2">
              <span class="label">
                {{
                  $t('domain.domain.referenceTypeDomain', {
                    domainType: labelText.nameAbbr,
                  })
                }}
              </span>
            </div>
            <div class="list-outer">
              <relation-domain-list
                :domainCodes="details.relationDomain"
                :categoryTypeId="categoryTypeId"
              ></relation-domain-list>
            </div>
          </div>
        </div>
        <div class="prop-line alg-line">
          <div class="descriptionMessage-title">
            <p class="message-title">
              {{ $version.domain.propertyType.management }}
            </p>
          </div>
          <div class="details-box">
            <div class="detail">
              <span class="label">
                {{ $version.domain.property.descriptionDepartment }}
              </span>
              <span class="value">{{ details.descriptionDepartmentName }}</span>
            </div>
            <div class="detail" v-if="categoryTypeId === 2">
              <span class="label">
                {{ $version.domain.property.parentCode }}
              </span>
              <span class="value">{{ details.parentCode }}</span>
            </div>
            <!--<div class="detail">-->
            <!--  <span class="label">-->
            <!--    {{ $version.domain.property.submitter }}-->
            <!--  </span>-->
            <!--  <span class="value">{{ details.submitter }}</span>-->
            <!--</div>-->
            <div class="detail">
              <span class="label">{{ $t('domain.domain.createTime') }}</span>
              <span class="value">
                {{ $timeFormatter(details.createTime) }}
              </span>
            </div>
            <div class="detail">
              <span class="label">{{ $version.tableHeader.publishTime }}</span>
              <span class="value">
                {{ $timeFormatter(details.firstPublish) }}
              </span>
            </div>
            <div class="detail">
              <span class="label">
                {{ $t('domain.domain.lastUpdateTime') }}
              </span>
              <span class="value">
                {{ $timeFormatter(details.lastModification) }}
              </span>
            </div>
            <div
              class="detail"
              v-for="(udp, index) in additionalProperties.filter(
                e => e.catalog === $t('domain.domain.manageProp')
              )"
              :key="index"
            >
              <udp-form-label
                :content="`${udp.name}`"
                :strWidth="190"
                :showModel="true"
              ></udp-form-label>
              <!--<span class="label">{{ udp.name }}</span>-->
              <div style="display: inline-block">
                <span style="white-space: pre-wrap">{{ udp.value }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="prop-line alg-line">
          <div class="descriptionMessage-title">
            <p class="message-title">
              {{ $version.domain.propertyType.technology }}
            </p>
          </div>
          <div class="details-box">
            <div class="detail">
              <span class="label">
                {{ $version.domain.property.rangeType }}
              </span>
              <span class="value">{{ details.rangeType }}</span>
            </div>
            <div class="detail">
              <span class="label">{{ $version.domain.property.dataType }}</span>
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
              <span class="label">{{ $version.domain.property.notNull }}</span>
              <span class="value">
                {{
                  details.notNull
                    ? $t('domain.common.true')
                    : $t('domain.common.false')
                }}
              </span>
            </div>
            <div id="long-text" class="detail">
              <span class="label">
                {{ $version.domain.property.dataFormat }}
              </span>
              <span class="value">{{ details.dataFormat }}</span>
            </div>
            <div class="detail">
              <span class="label">{{ $version.domain.property.ownerOrg }}</span>
              <span class="value">{{ details.ownerOrgName }}</span>
            </div>
            <div
              class="detail"
              v-for="(udp, index) in additionalProperties.filter(
                e => e.catalog === $t('domain.domain.techProp')
              )"
              :key="index"
            >
              <udp-form-label
                :content="`${udp.name}`"
                :strWidth="190"
                :showModel="true"
              ></udp-form-label>
              <!--<span class="label">{{ udp.name }}</span>-->
              <div style="display: inline-block">
                <span style="white-space: pre-wrap">{{ udp.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import scan from './standardScan'
export default scan
</script>
<style lang="scss" scoped>
@import './standardScan';
el-tabs__content {
  position: absolute;
  bottom: 0;
  top: 100px;
  left: 20px;
  overflow: scroll;
  right: 10px;
}
#long-text {
  div {
    //width: 600px !important;
    overflow: hidden;
    line-height: 2em;
    word-wrap: break-word;
    color: #555;
  }
}
</style>
<style lang="scss">
.standardtabs-table-details {
  .el-tabs__content {
    position: absolute;
    top: 32px;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
#standard-scan {
  //重写部分知识图谱的样式以适应当前页面
  // #kg {
  //   width: 1380px;
  // }
  #network_id {
    height: 72vh !important;
  }
  /*.el-tabs__content {
    min-height: 778px;
  }*/
  .el-tabs__nav-wrap::after {
    height: 1px;
  }
}
.XStyle {
  text-decoration: line-through;
}
</style>
