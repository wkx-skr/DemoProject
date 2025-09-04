<template>
  <div
    :style="style.container"
    class="list-detail"
    :class="{
      'is-report': data.dataReportType,
      'with-image': data['dataReportType'] && data['thumbnailFileId'],
    }"
  >
    <div class="title line-info" @click="showDetail(data)">
      <span v-html="formatAlias(data)" class="ch-name"></span>
      <span v-html="formatName(data)" class="en-name"></span>
    </div>
    <div
      :class="
        data['dataReportType'] && data['thumbnailFileId']
          ? 'report-image'
          : 'no-image'
      "
      v-if="data['dataReportType'] && data['thumbnailFileId']"
    >
      <report-image
        :file-id="data['thumbnailFileId']"
        v-if="data['thumbnailFileId']"
      ></report-image>
    </div>
    <div class="properties line-info">
      <span class="property folder one-line-eclipse" :title="paths">
        <i
          class="fa fa-folder"
          v-if="paths && paths.length > 0"
          style="font-size: 14px; display: inline-block"
        ></i>
        <span v-for="p in paths" v-if="!!p" class="single-path">{{ p }}</span>
      </span>
      <span class="property rate">
        <span class="vote-rate" v-if="typeof vote === 'number'">
          <datablau-rate
            class="my-rate"
            disabled
            v-model="vote"
          ></datablau-rate>
        </span>
        <span v-else class="property rate">
          <datablau-rate
            class="my-rate"
            disabled
            v-model="defaultRate"
          ></datablau-rate>
        </span>
      </span>
    </div>
    <div class="detail-info line-info">
      <div class="type-detail-info" v-for="item in tableList" :key="item.label">
        <img :src="item.src" alt="" style="margin-riht: 4px" />
        <span>{{ item.label }}:</span>
        <span v-if="!newAsset">
          {{
            data[item.value]
              ? data[item.value]
              : $modelCategoriesDetailsMap[data.categoryId]
              ? $modelCategoriesDetailsMap[data.categoryId][item.value]
              : '无'
          }}
        </span>
        <span v-else>{{ item.name }}</span>
      </div>
      <div
        class="type-detail"
        v-if="data.typeId == this.$commentPreCode.ShareFile"
      ></div>
    </div>
    <div
      class="description one-line-eclipse line-info"
      v-if="summary && summary.length"
    >
      <span v-html="summaryXss" v-if="summaryLoaded"></span>
    </div>
    <div class="tag-box line-info" v-if="data.tagIds && data.tagIds.length > 0">
      <el-tooltip
        v-for="tag in data.tagIds"
        :key="tag"
        :disabled="!$globalData.tagDescriptionMap.get(tag)"
        :content="$globalData.tagDescriptionMap.get(tag)"
      >
        <span class="tag" v-if="!!$globalData.tagMap.get(tag)">
          {{ $globalData.tagMap.get(tag).name }}
        </span>
      </el-tooltip>
    </div>
    <div class="icon">
      <datablau-icon :data-type="dataTypeMap(data)"></datablau-icon>
    </div>
  </div>
</template>

<script>
import listDetail from './listDetail.js'
export default listDetail
</script>

<style scoped lang="scss">
@import './listDetail';
</style>
