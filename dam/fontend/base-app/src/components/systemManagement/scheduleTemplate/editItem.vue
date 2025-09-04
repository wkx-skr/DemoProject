<template>
  <div>
    <datablau-breadcrumb
      :node-data="nodeData4"
      @back="backClick"
      style="margin-bottom: 20px; border-bottom: 1px solid #f1f1f1"
    ></datablau-breadcrumb>
    <datablau-form-submit style="top: 50px; bottom: 0">
      <div>
        <datablau-form
          :model="formContent"
          ref="demoForm"
          :rules="rules"
          label-width="10em"
        >
          <el-form-item
            prop="name"
            :label="$t('system.systemSetting.tempName')"
          >
            <datablau-input
              v-model="formContent.name"
              maxlength="200"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item prop="a" :label="$t('system.systemSetting.targYear')">
            <datablau-select v-model="formContent.year" @change="clearDates">
              <el-option :value="2022" :label="2022" :key="2022"></el-option>
              <el-option :value="2023" :label="2023" :key="2023"></el-option>
              <el-option :value="2024" :label="2024" :key="2024"></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            prop="description"
            :label="$t('system.systemSetting.tempDesc')"
          >
            <datablau-input
              v-model="formContent.description"
              type="textarea"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('system.systemSetting.dateSet')"
            prop="calendar"
          >
            <div>
              {{ $t('system.systemSetting.selDate') }}
              <div style="float: right">
                <datablau-button @click="reverseSelection">
                  {{ $t('system.systemSetting.reverseSel') }}
                </datablau-button>
                <datablau-button @click="downloadTemplate">
                  {{ $t('system.systemSetting.downloadTemplate') }}
                </datablau-button>
                <!--<el-upload
                  style="float: right; margin-left: 10px"
                  ref="upload"
                  :on-change="handlePreview"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                >
                  <
                </el-upload>-->
                <datablau-button slot="trigger" @click="uploadDates">
                  {{ $t('system.systemSetting.importDate') }}
                </datablau-button>
                <input type="file" :key="fileKey" id="file" v-show="false" />
              </div>
            </div>
          </el-form-item>
        </datablau-form>
        <calendar
          v-for="i in 12"
          :key="i + '-' + calendarKey"
          :year="formContent.year"
          :month="i"
          :dates="formContent.dates"
          @update-dates="updateDates"
        ></calendar>
      </div>
      <template slot="buttons">
        <datablau-button
          type="important"
          style="margin-left: -10px"
          @click="saveItem"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button @click="backClick">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </template>
    </datablau-form-submit>
  </div>
</template>
<script>
import Calendar from './Calendar.vue'
export default {
  components: {
    Calendar,
  },
  props: {
    currentData: {
      required: false,
      default: null,
      type: Object,
    },
  },
  mounted() {
    if (this.currentData) {
      this.initData()
    }
    setTimeout(() => {
      this.initEventListener()
    }, 1000)
  },
  data() {
    const validateCalendar = (rule, value, callback) => {
      if (this.formContent.dates && this.formContent.dates.length > 0) {
        callback()
      } else {
        callback(new Error())
      }
    }
    return {
      nodeData4: [this.$t('system.systemSetting.addTimeTemp')],
      formContent: {
        name: '',
        description: '',
        year: new Date().getFullYear(),
        dates: [],
        state: 1,
      },
      rules: {
        name: {
          required: true,
          message: this.$t('meta.modelCategory.formItemRequired', [
            this.$t('system.systemSetting.tempName'),
          ]),
        },
        calendar: {
          required: true,
          message: this.$t('meta.modelCategory.formItemRequired', [
            this.$t('system.systemSetting.dateSet'),
          ]),
          validator: validateCalendar,
        },
      },
      calendarKey: 0,
      fileKey: 0,
    }
  },
  beforeDestroy() {
    document.querySelector('#file') &&
      document
        .querySelector('#file')
        .removeEventListener('change', this.importDate)
  },
  methods: {
    clearDates() {
      this.formContent.dates = []
      this.calendarKey++
    },
    importDate() {
      const self = this
      let file = document.querySelector('#file').files[0]
      const reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = e => {
        const data = e.target.result
        const zzexcel = window.XLS.read(data, {
          type: 'binary',
        })
        let result = []
        for (let i = 0; i < 1; i++) {
          result = zzexcel.Sheets[zzexcel.SheetNames[i]]
        }
        self.decodeResult(result)

        // 清空file input中的文件，以便导入相同文件时可以被检测到
        document.querySelector('#file').value = ''
      }
    },
    initEventListener() {
      if (typeof window.XLSX === 'undefined') {
        $(document.body).append(
          '<script src="./static/js/xlsx.full.min.js"><\/script>'
        )
      }
      document
        .querySelector('#file')
        .addEventListener('change', this.importDate)
    },
    decodeResult(result) {
      function formatExcelDate(serial) {
        var utc_days = Math.floor(serial - 25569)
        var utc_value = utc_days * 86400
        var date_info = new Date(utc_value * 1000)

        var fractional_day = serial - Math.floor(serial) + 0.0000001

        var total_seconds = Math.floor(86400 * fractional_day)

        var seconds = total_seconds % 60

        total_seconds -= seconds

        var hours = Math.floor(total_seconds / (60 * 60))
        var minutes = Math.floor(total_seconds / 60) % 60

        const time = new Date(
          date_info.getFullYear(),
          date_info.getMonth(),
          date_info.getDate(),
          hours,
          minutes,
          seconds
        )
        return (
          time.getFullYear() +
          '-' +
          (time.getMonth() + 1) +
          '-' +
          time.getDate()
        )
      }
      const arr = []
      let i = 2
      do {
        if (result['A' + i] && result['A' + i].v) {
          arr.push(result['A' + i].v)
        }
        i++
      } while (i < 10000)
      this.formContent.dates = arr
        .map(i => {
          if (typeof i === 'number') {
            return formatExcelDate(i)
          } else {
            return i
          }
        })
        .filter(i => {
          if (
            typeof i === 'string' &&
            i.startsWith(String(this.formContent.year) + '-')
          ) {
            return true
          }
        })
      this.$datablauMessage.success(
        this.$t('system.systemSetting.importSuccessInfo', {
          total: arr.length,
          success: this.formContent.dates.length,
          error: arr.length - this.formContent.dates.length,
        })
      )
    },
    initData() {
      this.formContent.name = this.currentData.name
      this.formContent.description = this.currentData.description
      this.formContent.year = this.currentData.year
      this.formContent.id = this.currentData.id
      this.formContent.state = this.currentData.state
      this.formContent.dates = this.currentData.dates
    },
    backClick() {
      this.$emit('close')
    },
    saveItem() {
      this.$refs.demoForm.validate(valid => {
        if (valid) {
          const requestUrl = this.currentData
            ? `/job/dateTemplate/update`
            : `/job/dateTemplate/create`
          const requestBody = this.formContent
          this.$http
            .post(requestUrl, requestBody)
            .then(res => {
              this.$emit('reload')
              this.$emit('close')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    reverseSelection() {
      const r = this.formatDateForThisYear()
      let dates = []
      r.forEach(item => {
        if (!this.formContent.dates.includes(item)) {
          dates.push(item)
        }
      })
      this.formContent.dates = dates
    },
    uploadDates() {
      $('#file').click()
    },
    formatDateForOneDay(month, day) {
      const result = {
        day: /* day < 10 ? '0' + day : */ String(day),
        month: /* month < 10 ? '0' + String(month) : */ String(month),
        year: String(this.formContent.year),
      }
      return result.year + '-' + result.month + '-' + result.day
    },
    formatDateForThisYear() {
      const arr = []
      for (let i = 1; i <= 12; i++) {
        let lastDayOfMonth = new Date(
          new Date(this.formContent.year, i).getTime() - 24 * 60 * 60 * 1000
        ).getDate()
        for (let j = 1; j <= lastDayOfMonth; j++) {
          arr.push(this.formatDateForOneDay(i, j))
        }
      }
      return arr
    },
    updateDates({ mode, str }) {
      if (mode) {
        this.formContent.dates.push(str)
      } else {
        let idx = this.formContent.dates.indexOf(str)
        this.formContent.dates.splice(idx, 1)
      }
      this.$refs.demoForm.validate()
    },
    downloadTemplate() {
      this.$downloadFilePost(
        `/job/dateTemplate/downloadTemplate`, null, '日期选择模板.xlsx'
      )
    },
    handlePreview(file) {},
  },
}
</script>
