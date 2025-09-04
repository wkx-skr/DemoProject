<template>
  <div :class="{ dark: $theme === 'dark' }">
    <div
      id="nav"
      :class="{
        ext: isExtension,
        hide: !currentTopMenu,
        en: $i18n.locale === 'en',
      }"
    >
      <div id="nav-btn-box">
        <el-menu
          ref="navMenu"
          :default-active="defaultActive"
          :collapse-transition="false"
          :key="menuId"
          :unique-opened="false"
          :router="true"
          :collapse="!isExtension"
          @open="handleOpen"
          @select="handleSelect"
          @close="handleClose"
          v-if="showNav"
          :default-openeds="defaultOpeneds"
          class="top-menu"
        >
          <el-submenu
            index="dataStandardDashboard"
            v-if="
              menuMap.level1['dataStandardDashboard'] ||
              (menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.dataStandardDashboard &&
                menuMap.userLevel1.dataStandardDashboard.length > 0)
            "
            v-show="currentTopMenu === '数据标准'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-fwzl"></i>
              <span>{{ $t('common.page.dataStandardDashboard') }}</span>
            </template>
            <el-menu-item
              index="/main/dataStandard/dashboard"
              v-if="menuMap.dataStandardDashboard"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataStandardDashboard') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.dataStandardDashboard
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.dataStandardDashboard"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="domain"
            v-if="menuMap.level1['domain']"
            v-show="currentTopMenu === '数据标准'"
          >
            <!--  -->
            <template slot="title">
              <i class="icon iconfont icon-menu-sjbz"></i>
              <span>{{ $t('common.page.domain') }}</span>
            </template>
            <el-menu-item
              index="/main/dataStandard"
              v-if="menuMap['dataStandard'] || $auth['DATA_STANDARD_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataStandard') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataStandard/code"
              v-if="menuMap['code'] || $auth['STANDARD_CODE_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.code') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataStandard/glossary"
              v-if="menuMap['glossary'] || $auth['DICTIONARY_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.glossary') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.domain
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.domain"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="otherDomain"
            v-if="menuMap.level1['otherDomain']"
            v-show="currentTopMenu === '数据标准'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-sjbz"></i>
              <span>{{ $t('common.page.otherDomain') }}</span>
            </template>
            <el-menu-item
              index="/main/dataStandardField"
              v-if="menuMap['dataStandardField']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataStandardField') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/domainStandard"
              v-if="
                menuMap['domainStandard'] || $auth['DATA_STANDARD_FIELD_MANAGE']
              "
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.domainStandard') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="indexMenu"
            v-if="menuMap.level1['indexMenu']"
            v-show="currentTopMenu === '数据标准'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-zbtix"></i>
              <span>{{ $t('common.page.indexMenu') }}</span>
            </template>
            <el-menu-item index="/main/index" v-if="menuMap['index']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.index') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/dimension" v-if="menuMap['dimension']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dimension') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.index
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.index"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="domainLanding"
            v-if="
              menuMap.level1['domainLanding'] ||
              menuMap['dataFind'] ||
              menuMap['domainCluster'] ||
              menuMap['domainVertify'] ||
              (menuMap.userLevel1 && menuMap.userLevel1.domainLanding)
            "
            v-show="currentTopMenu === '数据标准'"
          >
            <!-- v-if="menuMap.level1['domainLanding']" -->
            <template slot="title">
              <i class="icon iconfont icon-menu-bzld"></i>
              <span>{{ $t('common.page.domainLanding') }}</span>
            </template>
            <el-menu-item index="/main/dataFind" v-if="menuMap['dataFind']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataFind') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/domainCluster"
              v-if="menuMap['domainCluster']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.domainCluster') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/domainVertify"
              v-if="menuMap['domainVertify']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.domainVertify') }}
              </span>
            </el-menu-item>
            <template
              v-if="menuMap.userLevel1 && menuMap.userLevel1.domainLanding"
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.domainLanding"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="statistical"
            v-show="currentTopMenu === '数据标准'"
            v-if="
              menuMap.level1['statistical'] &&
              $auth['DATA_STANDARD_STATISTICS_VIEW']
            "
          >
            <template slot="title">
              <i class="iconfont icon-menu-sjtm"></i>
              <span>{{ $t('common.page.statistical') }}</span>
            </template>
            <el-menu-item
              index="/main/dataStandard/queryStandard"
              v-if="$auth['DATA_STANDARD_STATISTICS_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.queryStandard') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.statistical
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.statistical"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="domainSystemSetting"
            v-show="currentTopMenu === '数据标准'"
            v-if="
              menuMap.level1['domainSystemSetting'] &&
              $auth['DATA_STANDARD_PARAM_MANAGE']
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-shezhi"></i>
              <span>{{ $t('common.page.domainSystemSetting') }}</span>
            </template>
            <el-menu-item
              index="/main/domainSetting"
              v-if="$auth['DATA_STANDARD_PARAM_MANAGE']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.domainSetting') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.domainSystemSetting
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.domainSystemSetting"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="metaData"
            v-if="menuMap.level1['metaData']"
            v-show="currentTopMenu === '元数据'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-ysjgl"></i>
              <span>{{ $t('common.page.metaData') }}</span>
            </template>
            <el-menu-item
              index="/main/dashboard/dataCatalogDashboard"
              v-if="menuMap['dataCatalogDashboard']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataCatalogDashboard') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/map" v-if="menuMap['map']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.map') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/meta" v-if="menuMap['dataCatalog']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataCatalog') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/reportFormManage"
              v-if="menuMap['reportFormManage']"
            >
              <!--  -->
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.reportFormManage') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/metaFolder" v-if="menuMap['metaFolder']">
              <!--  -->
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.metaFolder') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.metaData
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.metaData"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
            <!--            <el-menu-item index="/main/dataDemand" v-if="menuMap['dataDemand']">-->
            <!--              <span slot="title" class="menu-margin-left">{{this.$version.nav.dataDemand}}</span>-->
            <!--            </el-menu-item>-->
            <!--            <el-menu-item index="/main/dataService" v-if="menuMap['dataService']">-->
            <!--              <span slot="title" class="menu-margin-left">{{this.$version.nav.dataService}}</span>-->
            <!--            </el-menu-item>-->
          </el-submenu>
          <!-- <el-submenu
            index="businessData"
            v-if="menuMap.level1.businessData"
            v-show="currentTopMenu === '元数据'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-ywlc"></i>
              <span>{{ $t('common.page.businessData') }}</span>
            </template>
            <el-menu-item
              index="/main/businessData"
              v-if="menuMap['businessData']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.businessData') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/businessObject"
              v-if="menuMap['businessData']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.businessObject') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.businessData
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.businessData"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu> -->
          <!--          <el-submenu-->
          <!--            index="dataIntelligence"-->
          <!--            v-if="menuMap.level1.dataIntelligence"-->
          <!--            v-show="currentTopMenu==='元数据'"-->
          <!--          >-->
          <!--            <template slot="title">-->
          <!--              <i class="icon icon-41"></i>-->
          <!--              <span>{{$version.nav.dataIntelligence}}</span>-->
          <!--            </template>-->
          <!--            <el-menu-item index="/main/queryLog" v-if="menuMap['queryLog']">-->
          <!--              <span slot="title" class="menu-margin-left">{{this.$version.nav.queryLog}}</span>-->
          <!--            </el-menu-item>-->
          <!--          </el-submenu>-->
          <el-submenu
            index="dataResource"
            v-if="menuMap.level1['dataResource']"
            v-show="currentTopMenu === '元数据'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-cjgl"></i>
              <span>{{ $t('common.page.dataResource') }}</span>
            </template>
            <el-menu-item
              index="/main/modelCategory"
              v-if="menuMap['modelCategory']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.modelCategory') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/interfacepage"
              v-if="menuMap['interfacepage']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.interfacepage') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/systemManage/dataSource"
              v-if="menuMap['dataSource']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataSource') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/systemManage/driveManagement"
              v-if="menuMap['driveManagement']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.driveManagement') }}
              </span>
            </el-menu-item>
            <!--            <el-menu-item
              index="/main/dataStandard/tagManage"
              v-if="menuMap['tagManage']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.tagManage') }}
              </span>
            </el-menu-item>-->
            <!-- <el-menu-item
              index="/main/systemManage/lineage"
              v-if="menuMap['lineage']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.lineage') }}
              </span>
            </el-menu-item> -->
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.dataResource
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.dataResource"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="lineage"
            v-if="menuMap.level1['lineage']"
            v-show="currentTopMenu === '元数据'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-cjgl"></i>
              <span>{{ $t('common.page.lineage') }}</span>
            </template>
            <el-menu-item
              index="/main/systemManage/lineageFile"
              v-if="menuMap['lineageFile']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.lineageFile') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/systemManage/lineageCatalogue"
              v-if="menuMap['lineageCatalogue']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.lineageCatalogue') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/systemManage/scriptManage"
              v-if="menuMap['scriptManage']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.scriptManage') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.lineage
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.lineage"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="dataQualityReport"
            v-if="menuMap.level1['dataQualityReport']"
            v-show="currentTopMenu === '数据质量'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-zlbg"></i>
              <span>{{ $t('common.page.dataQualityReport') }}</span>
            </template>
            <el-menu-item
              index="/main/dataQuality/dashboard"
              v-if="menuMap['dataQualityDashboard']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataQualityDashboard') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataQuality/ruleReport"
              v-if="menuMap['ruleReport']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.ruleReport') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataQuality/problemReport"
              v-if="menuMap['problemReport']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.problemReport') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.dataQualityReport
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.dataQualityReport"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="ruleManagement"
            v-if="menuMap.level1['ruleManagement']"
            v-show="currentTopMenu === '数据质量'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-gzgl"></i>
              <span>{{ $t('common.page.ruleManagement') }}</span>
            </template>
            <el-menu-item
              index="/main/dataQuality/ruleTemplate"
              v-if="menuMap['ruleTemplate']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.ruleTemplate') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataQuality/rules"
              v-if="menuMap['dataQualityRules']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataQualityRules') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataQuality/qualityRule"
              v-if="menuMap['qualityRule']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.qualityRule') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.ruleManagement
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.ruleManagement"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-menu-item
            class="el-submenu__title first-title2"
            index="/main/homePage"
            v-if="menuMap.level1.homePage"
            v-show="currentTopMenu === '指标管理'"
          >
            <i class="icon iconfont icon-menu-fwzl"></i>
            <span slot="title" class="menu-margin-left">
              {{ $t('common.page.homePage') }}
            </span>
          </el-menu-item>
          <el-submenu
            index="demandManagement"
            v-if="menuMap.level1.demandManagement"
            v-show="currentTopMenu === '指标管理'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-xqgl"></i>
              <span>{{ $t('common.page.demandManagement') }}</span>
            </template>
            <el-menu-item
              index="/main/demandManagement"
              v-if="menuMap['demandManagement']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.demandManagement') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="indexManagement"
            v-if="menuMap.level1.indexManagement"
            v-show="currentTopMenu === '指标管理'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-zbgl"></i>
              <span>{{ $t('common.page.indexManagement') }}</span>
            </template>
            <el-menu-item
              index="/main/dimensionDefinition"
              v-if="menuMap['dimensionDefinition']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dimensionDefinition') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/indexDefinition"
              v-if="menuMap['indexDefinition']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.indexDefinition') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/forkIndexDefinition"
              v-if="menuMap['forkIndexDefinition']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.forkIndexDefinition') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item
            class="el-submenu__title first-title2"
            index="/main/indexModifier"
            v-if="menuMap.level1.indexModifier"
            v-show="currentTopMenu === '指标管理'"
          >
            <i class="icon iconfont icon-menu-zbgl"></i>
            <span slot="title" class="menu-margin-left">
              {{ $t('common.page.indexModifier') }}
            </span>
          </el-menu-item>
          <el-menu-item
            class="el-submenu__title first-title2"
            index="/main/indexTimer"
            v-if="menuMap.level1.indexTimer"
            v-show="currentTopMenu === '指标管理'"
          >
            <i class="icon iconfont icon-menu-zbgl"></i>
            <span slot="title" class="menu-margin-left">
              {{ $t('common.page.indexTimer') }}
            </span>
          </el-menu-item>
          <el-submenu
            index="themeDirectory"
            v-if="menuMap.level1.themeDirectory"
            v-show="currentTopMenu === '指标管理'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-ztml"></i>
              <span>{{ $t('common.page.themeDirectory') }}</span>
            </template>
            <el-menu-item
              index="/main/themeDirectory"
              v-if="menuMap.themeDirectory"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.themeDirectory') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="indexApply"
            v-if="menuMap.level1.indexApply"
            v-show="currentTopMenu === '指标管理'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-zbyy"></i>
              <span>{{ $t('common.page.indexApply') }}</span>
            </template>
            <el-menu-item
              index="/main/autonomousQuery"
              v-if="menuMap['autonomousQuery']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.autonomousQuery') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="qualityExamineJob"
            v-if="menuMap.level1['qualityExamineJob']"
            v-show="currentTopMenu === '数据质量'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-jhrw"></i>
              <span>{{ $t('common.page.qualityExamineJob') }}</span>
            </template>
            <el-menu-item
              v-if="menuMap['qualityExamineJob']"
              index="/main/dataQuality/examineJob"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.qualityExamineJob') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.qualityExamineJob
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.qualityExamineJob"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="repairJobManagement"
            v-if="menuMap.level1['repairJobManagement']"
            v-show="currentTopMenu === '数据质量'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-wtgl"></i>
              <span>{{ $t('common.page.repairJobManagement') }}</span>
            </template>
            <el-menu-item
              index="/main/dataQuality/repairJob"
              v-if="menuMap['dataQualityRepairJob']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataQualityRepairJob') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataQuality/monitor"
              v-if="menuMap['dataQualityMonitor']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataQualityMonitor') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataQuality/check"
              v-if="menuMap['dataQualityCheck']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataQualityCheck') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/knowledge"
              v-if="menuMap['knowledgebase']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.knowledgebase') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.repairJobManagement
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.repairJobManagement"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="settingList"
            v-if="menuMap.level1['settingList']"
            v-show="currentTopMenu === '数据质量'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-gzcs"></i>
              <span>{{ $t('common.page.settingListSet') }}</span>
            </template>
            <el-menu-item
              v-if="menuMap['settingList']"
              index="/main/settingList"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.settingList') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['qualityAssurance']"
              index="/main/dataQuality/qualityAssurance"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.qualityAssurance') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['problemProgramme']"
              index="/main/dataQuality/problemProgramme"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.problemProgramme') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.settingList
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.settingList"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
            <!--<el-menu-item
              v-if="menuMap['settingList']"
              index="/main/function">
              <span slot="title" class="menu-margin-left">{{this.$version.nav.functionByUser}}</span>
            </el-menu-item>-->
          </el-submenu>
          <!-- <el-submenu
            index="process"
            v-show="currentTopMenu==='系统管理'"
          >
            <template slot="title">
              <i class="icon el-icon-menu"></i>
              <span>{{this.$version.nav.process}}</span>
            </template>
            <el-menu-item index="/main/processCenter" >
              <span slot="title" class="menu-margin-left">{{this.$version.nav.processCenter}}</span>
            </el-menu-item>
          </el-submenu> -->
          <el-submenu
            index="process"
            v-show="
              currentTopMenu === 'systemManage' || currentTopMenu === 'process'
            "
            v-if="menuMap.level1['process']"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-lcgl"></i>
              <span>{{ $t('common.page.process') }}</span>
            </template>
            <el-menu-item
              index="/main/processCenter"
              v-if="$auth['PROCESS_CONTERP_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.processCenter') }}
              </span>
            </el-menu-item>
            <!--            <el-menu-item
              index="/main/formCenter"
              v-if="$auth['FORM_CONTERP_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.formCenter') }}
              </span>
            </el-menu-item>-->
            <el-menu-item
              index="/main/allApply"
              v-if="$auth['PROCESS_MONITORING_VIEW']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.allApply') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/monitor" v-if="$auth['MONITOR_VIEW']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.monitor') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.process
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.process"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <el-submenu
            index="systemManage"
            v-if="menuMap.level1['systemManage']"
            v-show="
              currentTopMenu === 'systemManage' || currentTopMenu === 'process'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-xtgl"></i>
              <span>{{ $t('common.page.systemManage') }}</span>
            </template>
            <el-menu-item
              index="/main/organizationManage"
              v-if="menuMap['organizationManage']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.organizationManage') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/user" v-if="menuMap['user']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.user') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/group" v-if="menuMap['group']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.group') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/userGroup" v-if="menuMap['userGroup']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.userGroup') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataStandard/tagManage"
              v-if="menuMap['tagManage']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.tagManage') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/systemManage/jobManagement"
              v-if="menuMap['jobManagement']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.jobManagement') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/systemManage/systemSetting"
              v-if="menuMap['systemSetting']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.systemSetting') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/authorityManagement" v-show="false">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.authorityManagement') }}
              </span>
            </el-menu-item>
            <el-menu-item
              index="/main/dataStageJob"
              v-if="menuMap['dataStageJob']"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataStageJob') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/configPane" v-if="menuMap['configPane']">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.configPane') }}
              </span>
            </el-menu-item>
            <el-menu-item index="/main/logManage" v-if="menuMap.logManage">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.logManage') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.systemManage
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.systemManage"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
            <!--            <el-menu-item index="/main/processModel" v-if="menuMap['processModel']">-->
            <!--              <span slot="title" class="menu-margin-left">{{this.$version.nav.processModel}}</span>-->
            <!--            </el-menu-item>-->
            <!-- <el-menu-item index="/main/helpDoc" v-if="$showClLogo">
                      <span slot="title" class="menu-margin-left">帮助文档</span>
                  </el-menu-item> -->
          </el-submenu>
          <el-menu-item
            class="el-submenu__title first-title"
            v-if="menuMap['serviceOverview']"
            v-show="currentTopMenu === '数据服务'"
            index="/main/serviceOverview"
          >
            <i class="icon iconfont icon-menu-fwzl"></i>
            <span slot="title" class="menu-margin-left">
              {{ $t('common.page.serviceOverview') }}
            </span>
          </el-menu-item>
          <el-menu-item
            class="el-submenu__title first-title"
            v-if="menuMap['apiOverview']"
            v-show="currentTopMenu === '数据服务'"
            index="/main/apiOverview"
          >
            <i class="icon iconfont icon-menu-apisc"></i>
            <span slot="title" class="menu-margin-left">
              {{ $t('common.page.apiOverview') }}
            </span>
          </el-menu-item>
          <el-menu-item
            class="el-submenu__title first-title"
            v-if="menuMap['applyOverview']"
            v-show="currentTopMenu === '数据服务'"
            index="/main/applyOverview"
          >
            <i class="icon iconfont icon-menu-yylb"></i>
            <span slot="title" class="menu-margin-left">
              {{ $t('common.page.applyOverview') }}
            </span>
          </el-menu-item>
          <el-submenu
            class="my-api"
            @click="changeIndexTo('myApi')"
            index="myApi"
            v-if="menuMap.level1['myApi']"
            v-show="currentTopMenu === '数据服务'"
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-fwgl"></i>
              <span>{{ $t('common.page.myApi') }}</span>
            </template>
            <el-menu-item v-if="menuMap['manageApi']" index="/main/manageApi">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.manageApi') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['manageApp']" index="/main/manageApp">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.manageApp') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['apiAudit']" index="/main/apiAudit">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.apiAudit') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['applyAudit']" index="/main/applyAudit">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.applyAudit') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['requestApi']" index="/main/requestApi">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.requestApi') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['devApi']" index="/main/devApi">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.devApi') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['requestApp']" index="/main/requestApp">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.requestApp') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['devApp']" index="/main/devApp">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.devApp') }}
              </span>
            </el-menu-item>
            <template
              v-if="
                menuMap.userLevel1 &&
                menuMap.userLevel1 &&
                menuMap.userLevel1.myApi
              "
            >
              <el-menu-item
                v-for="o in menuMap.userLevelMap.myApi"
                :key="o"
                :index="'/main/' + o"
              >
                <span slot="title" class="menu-margin-left">
                  {{ $t('common.page.' + o) }}
                </span>
              </el-menu-item>
            </template>
          </el-submenu>
          <!-- <el-submenu
            index="securitySummary"
            v-if="menuMap.level1['securitySummary']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon el-icon-lock"></i>
              <span>概览</span>
            </template>
            <el-menu-item
              v-if="menuMap['dataSecurity']"
              index="/main/dataSecurity"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataSecurity') }}
              </span>
            </el-menu-item>
          </el-submenu> -->
          <el-submenu
            index="securityOverview"
            v-if="menuMap.level1['securityOverview']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-fwzl"></i>
              <span>安全概览</span>
            </template>
            <el-menu-item v-if="menuMap['assetCount']" index="/main/assetCount">
              <span slot="title" class="menu-margin-left">安全概览</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="enterpriseDataManagement"
            v-if="menuMap.level1['enterpriseDataManagement']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-flfj"></i>
              <span>数据分类分级</span>
            </template>
            <el-menu-item
              v-if="menuMap['informationItems']"
              index="/main/informationItems"
            >
              <span slot="title" class="menu-margin-left">分类信息项</span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['accessControl']"
              index="/main/accessControl"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.accessControl') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['dataLevel']" index="/main/dataLevel">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataLevel') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['statutoryProvisions']"
              index="/main/statutoryProvisions"
            >
              <span slot="title" class="menu-margin-left">法规条文</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="classificationTool"
            v-if="menuMap.level1['classificationTool']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-flfjtool"></i>
              <span>分类分级工具</span>
            </template>
            <el-menu-item
              v-if="menuMap['reviewAndRelease']"
              index="/main/reviewAndRelease"
            >
              <span slot="title" class="menu-margin-left">评审与发布</span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['intelligenceClassification']"
              index="/main/intelligenceClassification"
            >
              <span slot="title" class="menu-margin-left">智能分类分级</span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['coordinationClassification']"
              index="/main/coordinationClassification"
            >
              <span slot="title" class="menu-margin-left">协同分类分级</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="strategyManage"
            v-if="menuMap.level1['strategyManage']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-accesspolicy"></i>
              <span>访控管理</span>
            </template>
            <el-menu-item
              v-if="menuMap['accessStrategy']"
              index="/main/accessStrategy"
            >
              <span slot="title" class="menu-margin-left">访问策略</span>
            </el-menu-item>
            <!-- <el-menu-item
              v-if="menuMap['securityPolicy']"
              index="/main/securityPolicy"
            >
              <span slot="title" class="menu-margin-left">安全策略</span>
            </el-menu-item> -->
          </el-submenu>
          <el-submenu
            index="dataDesensitization"
            v-if="menuMap.level1['dataDesensitization']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-sjtm"></i>
              <span>数据脱敏</span>
            </template>
            <el-menu-item
              v-if="menuMap['datamaskingRule']"
              index="/main/datamaskingRule"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.datamaskingRule') }}
              </span>
            </el-menu-item>
            <!-- <el-menu-item
              v-if="menuMap['jarManagement']"
              index="/main/jarManagement"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.jarManagement') }}
              </span>
            </el-menu-item> -->
            <!-- <el-menu-item
              v-if="menuMap['dataDesensitization/staticRule']"
              index="/main/dataDesensitization/staticRule"
            >
              <span slot="title" class="menu-margin-left">数据脱敏任务</span>
            </el-menu-item> -->
          </el-submenu>
          <!-- 6.4暂时不要 -->
          <!-- <el-submenu
            index="dataControler"
            v-if="menuMap.level1['dataControler']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-sqgl"></i>
              <span>数据申请管理</span>
            </template>
            <el-menu-item
              v-if="menuMap['dataControl']"
              index="/main/dataControl"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataControl') }}
              </span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['whiteList']" index="/main/whiteList">
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.whiteList') }}
              </span>
            </el-menu-item>
          </el-submenu> -->
          <!-- <el-submenu
            index="gatewayManager"
            v-if="menuMap.level1['gatewayManager']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-aqwg"></i>
              <span>安全网关管理</span>
            </template>
            <el-menu-item
              v-if="menuMap['dataSecurityGateway']"
              index="/main/dataSecurityGateway"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataSecurityGateway') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['gatewayAudit']"
              index="/main/gatewayAudit"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.gatewayAudit') }}
              </span>
            </el-menu-item>
          </el-submenu> -->
          <!-- <el-submenu
            index="unifiedQueryManager"
            v-if="menuMap.level1['unifiedQueryManager']"
            v-show="
              currentTopMenu === '统一查询' || currentTopMenu === 'unifiedQuery'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-sjtm"></i>
              <span>动态脱敏查询工具</span>
            </template>
            <el-menu-item
              v-if="menuMap['unifiedQuery']"
              index="/main/unifiedQuery"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.unifiedQuery') }}
              </span>
            </el-menu-item>
          </el-submenu> -->
          <el-submenu
            index="gatewayManager"
            v-if="menuMap.level1['gatewayManager']"
            v-show="
              currentTopMenu === '安全网关' || currentTopMenu === 'gateway'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-aqwg"></i>
              <span>安全网关管理</span>
            </template>
            <el-menu-item
              v-if="menuMap['dataSecurityGateway']"
              index="/main/dataSecurityGateway"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.dataSecurityGateway') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['gatewayAudit']"
              index="/main/gatewayAudit"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.gatewayAudit') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="securitySystemManage"
            v-if="menuMap.level1['securitySystemManage']"
            v-show="
              currentTopMenu === '数据安全' || currentTopMenu === 'dataSecurity'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-xtgl"></i>
              <span>系统管理</span>
            </template>
            <el-menu-item
              v-if="menuMap['classificationStructure']"
              index="/main/classificationStructure"
            >
              <span slot="title" class="menu-margin-left">安全分类设计</span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['itemParamConfig']"
              index="/main/itemParamConfig"
            >
              <span slot="title" class="menu-margin-left">参数配置</span>
            </el-menu-item>
            <el-menu-item v-if="menuMap['algorithm']" index="/main/algorithm">
              <span slot="title" class="menu-margin-left">识别算法</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="assetApplication"
            v-if="menuMap.level1['assetApplication']"
            v-show="
              currentTopMenu === '数据资产' || currentTopMenu === 'dataAsset'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-fwzl"></i>
              <span>{{ $t('common.page.assetApplication') }}</span>
            </template>
            <el-menu-item
              v-if="menuMap['assetAnalysis']"
              index="/main/dataAsset/analysis"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.assetAnalysis') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['assetHome']"
              index=""
              @click="activeItem('/main/dataAsset/home')"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.assetHome') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['assetOverview']"
              index=""
              @click="activeItem('/main/dataAsset/overview')"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.assetOverview') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="assetManage"
            v-if="menuMap.level1['assetManage']"
            v-show="
              currentTopMenu === '数据资产' || currentTopMenu === 'dataAsset'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-zbgl"></i>
              <span>{{ $t('common.page.assetManage') }}</span>
            </template>
            <el-menu-item
              v-if="menuMap['assetDirManage']"
              index="/main/dataAsset/manage"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.assetDirManage') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="assetWorkbench"
            v-if="menuMap.level1['assetWorkbench']"
            v-show="
              currentTopMenu === '数据资产' || currentTopMenu === 'dataAsset'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-workbench"></i>
              <span>{{ $t('common.page.userPane') }}</span>
            </template>
            <el-menu-item
              v-if="menuMap['myAsset']"
              index="/main/dataAsset/myAsset"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.myAsset') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['myAssetApply']"
              index="/main/dataAsset/myApply"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.myApply') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['myAssetTodo']"
              index="/main/dataAsset/myTodo"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.workItems') }}
              </span>
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="assetSystemManage"
            v-if="menuMap.level1['assetSystemManage']"
            v-show="
              currentTopMenu === '数据资产' || currentTopMenu === 'dataAsset'
            "
          >
            <template slot="title">
              <i class="icon iconfont icon-menu-xtgl"></i>
              <span>{{ $t('common.page.assetSystemManage') }}</span>
            </template>
            <el-menu-item
              v-if="menuMap['directoryStructure']"
              index="/main/dataAsset/directoryStructure"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.structureSettings') }}
              </span>
            </el-menu-item>
            <el-menu-item
              v-if="menuMap['generalSetting']"
              index="/main/dataAsset/generalSetting"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.typeSettings') }}
              </span>
            </el-menu-item>

            <el-menu-item
              v-if="menuMap['logsRecord']"
              index="/main/dataAsset/logsRecord"
            >
              <span slot="title" class="menu-margin-left">
                {{ $t('common.page.logsRecord') }}
              </span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <div id="ext-btn" @click="toggleExtension">
        <i v-if="!isExtension" class="fa fa-angle-double-right"></i>
        <i v-else class="fa fa-angle-double-left"></i>
      </div>
    </div>
  </div>
</template>
<script>
import nav from './nav.js'

export default nav
</script>

<style lang="scss" scoped>
@import './nav.scss';
</style>
<style lang="scss">
@import '~@/next/components/basic/color.sass';
#nav-btn-box {
  .el-menu {
    background-color: #fff;
    // border-right: solid 1px var(--border-color-lighter);
    .el-menu-item,
    .el-submenu__title {
      color: var(--table-color);

      /*&:hover {
        background-color: $table-hover-color;
        color: var(--default-opposite-color);
      }*/
    }
  }

  .first-title2,
  .first-title {
    padding-left: 16px !important;
    margin-left: -20px !important;
    width: 180px;
    span {
      padding-left: 0px;
    }
    i.icon {
      position: relative;
      top: -4px;
    }
    .el-tooltip {
      margin-left: -4px !important;
    }
    .menu-margin-left {
      display: inline-block;
      position: relative;
      margin-left: 1px;
      font-size: 14px;
      line-height: 14px;
      top: 5px;
    }
  }
  .el-submenu__title {
    margin-left: -20px;
  }

  .my-api {
    margin-left: 2px !important;
  }

  .el-menu:not(.el-menu--collapse) {
    li.el-submenu {
      .el-submenu__title {
        border-left: 3px solid transparent;
      }

      &.is-active {
        .el-submenu__title {
          & > i.icon {
            color: #409eff;
          }
        }
      }

      &.is-active:not(.is-opened) .el-submenu__title {
        border-left-color: #409eff;

        i.icon {
          color: #409eff !important;
        }
      }
    }
  }

  .el-submenu__title {
    /* padding-left: 8px !important; */
    height: 40px;
    line-height: 40px;
  }

  .el-menu--collapse .el-submenu__title {
    height: 50px;
    line-height: 50px;
  }
}

.el-menu {
  border-right: none;
}
</style>
