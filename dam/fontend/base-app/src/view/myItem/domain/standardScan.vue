<template>
  <div
    style="
      padding: 10px 20px 30px;
      max-width: 1280px;
      overflow-x: hidden;
      overflow-y: hidden;
    "
    v-if="details"
  >
    <el-dialog
      title="查看引用代码"
      width="800px"
      append-to-body
      :visible.sync="codeDialogVisible"
    >
      <view-code :code="code" :key="code"></view-code>
    </el-dialog>
    <el-dialog
      title="资产地图"
      fullscreen
      :visible.sync="mapVisible"
      v-if="mapVisible"
      append-to-body
    >
      <div style="position: absolute; top: 50px; left: 0; bottom: 0; right: 0">
        <datablau-property-map
          data-type="domain"
          :data-id="details.domainId"
          :data-name="details.domainChName"
        ></datablau-property-map>
      </div>
    </el-dialog>
    <div class="description-line">
      <div class="details-box">
        <div class="detail" data-id="domainChName">
          <span class="label">中文名称</span>
          <span class="value">{{ details.chineseName }}</span>
        </div>
        <div class="detail">
          <span class="label">标准编码</span>
          <span class="value">{{ details.domainCode }}</span>
        </div>
        <div class="detail">
          <span class="label">英文名称</span>
          <span class="value">{{ details.englishName }}</span>
        </div>
        <div class="detail">
          <span class="label">英文简写</span>
          <span class="value">{{ details.abbreviation }}</span>
        </div>
        <div class="detail">
          <span class="label">引用代码</span>
          <span
            class="value"
            @click="viewCode(details.referenceCode.split(' ')[0])"
            style="margin-left: 0.1em; color: #479eff; cursor: pointer"
          >
            {{ details.referenceCode }}
          </span>
        </div>
        <div class="detail">
          <span class="label">主题目录</span>
          <span class="value">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            {{ details.path && details.path.join('/') }}
          </span>
        </div>
        <div
          class="detail"
          v-for="(udp, index) in udps"
          v-if="udp.category === 'STANDARD'"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <span
            class="value"
            v-html="nl2br(details.additionalProperties[index])"
          ></span>
        </div>
      </div>
      <standard-status
        style="margin: 30px 0 -60px"
        :details="details"
        @updateDomain="handleUpdate"
      ></standard-status>
    </div>
    <div class="prop-line alg-line">
      <div class="title">业务信息</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail broader">
          <span class="label">业务定义</span>
          <span class="value" v-html="nl2br(details.description)"></span>
        </div>
        <div
          class="detail broader"
          v-for="(udp, index) in udps"
          v-if="udp.category === 'BUSINESS'"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <span
            class="value"
            v-html="nl2br(details.additionalProperties[index])"
          ></span>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line">
      <div class="title">管理信息</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">所有者</span>
          <span class="value">{{ details.submitter }}</span>
        </div>
        <div class="detail">
          <span class="label">发布时间</span>
          <span class="value">
            {{
              $timeFormatter(
                details.firstPublish
                  ? details.firstPublish
                  : details.lastModification
              )
            }}
          </span>
        </div>
        <div
          class="detail"
          v-for="(udp, index) in udps"
          v-if="udp.category === 'MANAGEMENT'"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <span
            class="value"
            v-html="nl2br(details.additionalProperties[index])"
          ></span>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line">
      <div class="title">技术信息</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">数据类型</span>
          <span class="value">{{ details.dataType }}</span>
        </div>
        <div class="detail">
          <span class="label">数据长度</span>
          <span class="value">{{ details.dataScale }}</span>
        </div>
        <div class="detail">
          <span class="label">数据精度</span>
          <span class="value">{{ details.dataPrecision }}</span>
        </div>
        <div class="detail">
          <span class="label">非空</span>
          <span class="value">{{ details.notNull }}</span>
        </div>
        <div
          class="detail"
          v-for="(udp, index) in udps"
          v-if="udp.category === 'TECHNICAL'"
          :key="index"
        >
          <span class="label">{{ udp.name }}</span>
          <span
            class="value"
            v-html="nl2br(details.additionalProperties[index])"
          ></span>
        </div>
      </div>
    </div>

    <!--<div
      v-if="details.state === 'A' || details.state === 'V'"
      class="prop-line alg-line"
    >
      <div class="title">资产引用</div>
      <div class="line"></div>
      <quoto
        v-if="scrolled"
        :domainId="data.id" :domainCode="details.domainCode" :key="data.id"></quoto>
    </div>
    <div class="prop-line alg-line" v-if="details.state==='A'">
      <div class="title">版本历史</div>
      <div class="line"></div>
      <version
        v-if="scrolled"
        style="max-width:800px;"
        :domainId="data.id"
        :details="details"
        :key="data.id"></version>
    </div>-->
  </div>
</template>
<script>
import scan from './standardScan'
export default scan
</script>
<style lang="scss" scoped>
@import './standardScan';
</style>
