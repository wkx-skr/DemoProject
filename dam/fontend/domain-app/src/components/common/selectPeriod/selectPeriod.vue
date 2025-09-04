<template>
  <div>
    <datablau-form label-width="0px">
      <!--      <el-form-item style="position: relative">-->
      <!--        <el-radio v-model="radio" id="scheduleByCron" label="scheduleByCron" >{{$version.jobManagement.scheduleByCron}}:</el-radio>-->
      <!--        <el-input clearable maxlength="100" class="cronSchedule" v-model="schedule" :disabled="radio === 'scheduleByWeekdays'" @blur="make"></el-input>-->
      <!--        <i v-if="schedule" class="el-icon-question" @mouseenter="showInfo = true" @mouseleave="showInfo = false"></i>-->
      <!--        <div v-if="showInfo" class="info">{{descrip ? descrip : '表达式错误'}}</div>-->
      <!--      </el-form-item>-->
      <el-form-item
        :label="
          hasLable
            ? ''
            : $t('quality.page.qualityExamineJob.repetitionPeriod') + ':'
        "
      >
        <!--      <el-radio class="radio" v-model="radio" id="scheduleByWeekdays" label="scheduleByWeekdays">重复周期:</el-radio>-->
        <!-- <span style="margin-right: 30px">重复周期:</span> -->
        <datablau-select
          class="width"
          v-model="radio2"
          :disabled="radio === 'scheduleByCron'"
          style="margin-right: 10px; display: inline-block; width: 100px"
          @change="selectChange"
        >
          <el-option
            :label="$t('quality.page.qualityExamineJob.selectPeriod.noRepeat')"
            value="noRepeat"
          ></el-option>
          <el-option
            :label="$t('quality.page.qualityExamineJob.selectPeriod.everyday')"
            value="everyday"
          ></el-option>
          <el-option
            :label="$t('quality.page.qualityExamineJob.selectPeriod.weekly')"
            value="weekly"
          ></el-option>
          <el-option
            :label="$t('quality.page.qualityExamineJob.selectPeriod.monthly')"
            value="monthly"
          ></el-option>
          <el-option
            :label="$t('quality.page.qualityExamineJob.selectPeriod.quarterly')"
            value="quarterly"
          ></el-option>
          <el-option
            :label="$t('quality.page.qualityExamineJob.selectPeriod.yearly')"
            value="yearly"
          ></el-option>
          <el-option
            :label="
              $t('quality.page.qualityExamineJob.selectPeriod.schedulings')
            "
            value="schedulings"
          ></el-option>
        </datablau-select>
        <datablau-datePicker
          v-model="year"
          v-if="radio2 === 'noRepeat'"
          :disabled="radio === 'scheduleByCron'"
          style="margin-right: 10px; display: inline-block"
          :placeholder="
            $t('quality.page.qualityExamineJob.selectPeriod.selectYear')
          "
          :datePickerType="'year'"
        ></datablau-datePicker>
        <span style="margin-right: 2px" v-if="!(radio2 !== 'quarterly')">
          {{ $t('quality.page.qualityExamineJob.selectPeriod.index') }}
        </span>
        <datablau-select
          v-model="whichMonth"
          placeholder=""
          style="display: inline-block; width: 55px"
          v-if="!(radio2 !== 'quarterly')"
        >
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
          <el-option label="3" value="3"></el-option>
        </datablau-select>
        <span v-if="!(radio2 !== 'quarterly')">
          {{ $t('quality.page.qualityExamineJob.selectPeriod.months') }}
        </span>
        <datablau-select
          v-model="mouths"
          placeholder=""
          style="width: 60px; display: inline-block"
          v-if="!(radio2 !== 'yearly') || radio2 === 'noRepeat'"
          :disabled="radio === 'scheduleByCron'"
        >
          <el-option
            v-for="item in mouthsList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
        <span
          v-if="!(radio2 !== 'yearly') || radio2 === 'noRepeat'"
          style="margin-right: 10px"
        >
          {{ $t('quality.page.qualityExamineJob.selectPeriod.mouths') }}
        </span>
        <datablau-select
          class="select"
          v-model="days"
          placeholder=""
          v-if="!dayDisabled() || radio2 === 'noRepeat'"
          :disabled="radio === 'scheduleByCron'"
          style="display: inline-block; width: 60px"
        >
          <el-option
            v-for="item in daysList"
            :key="item"
            :label="item"
            :disabled="dayCanSelect(item)"
            :value="item"
          ></el-option>
        </datablau-select>
        <span
          v-if="!dayDisabled() || radio2 === 'noRepeat'"
          style="margin-right: 10px"
        >
          {{ $t('quality.page.qualityExamineJob.selectPeriod.days') }}
        </span>
        <div v-if="radio2 === 'weekly'" style="display: inline-block">
          <datablau-select
            multiple
            v-model="selectedWeekDays"
            :disabled="radio2 !== 'weekly' || radio === 'scheduleByCron'"
            style="margin-right: 20px; width: 180px"
          >
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.mon')"
              value="Mon"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.tue')"
              value="Tue"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.wed')"
              value="Wed"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.thu')"
              value="Thu"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.fri')"
              value="Fri"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.sat')"
              value="Sat"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityExamineJob.selectPeriod.sun')"
              value="Sun"
            ></el-option>
          </datablau-select>
        </div>
        <datablau-select
          v-model="hours"
          placeholder=""
          v-if="radio2 !== 'schedulings'"
          class="select"
          :disabled="timeDisabled()"
          style="width: 60px"
        >
          <el-option
            v-for="item in hoursList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
        <span
          style="margin-right: 10px; margin-left: 8px"
          v-if="radio2 !== 'schedulings'"
        >
          {{ $t('quality.page.qualityExamineJob.selectPeriod.hours') }}
        </span>
        <datablau-select
          v-model="minutes"
          v-if="radio2 !== 'schedulings'"
          placeholder=""
          class="select"
          :disabled="radio === 'scheduleByCron' || (radio2 && hours === null)"
          style="width: 60px"
        >
          <el-option
            v-for="item in minutesList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
        <span v-if="radio2 !== 'schedulings'" style="margin-left: 8px">
          {{ $t('quality.page.qualityExamineJob.selectPeriod.minutes') }}
        </span>
      </el-form-item>
    </datablau-form>
  </div>
</template>

<script>
export default {
  name: 'selectPeriod',
  props: ['cron', 'defaultCheck', 'returnEachChange', 'hasLable'],
  data() {
    return {
      radio2: '',
      whichMonth: '',
      mouths: '',
      days: '',
      hours: null,
      minutes: '',
      mouthsList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      daysList: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
      ],
      hoursList: [
        '0',
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
      ],
      minutesList: [
        '0',
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
      ],
      year: '',
      descrip: '',
      radio: 'scheduleByWeekdays',
      selectedWeekDays: [],
      showInfo: false,
      schedule: '',
      deleteArr: ['minutesList', 'hoursList', 'selectedWeekDays', 'daysList'],
    }
  },
  mounted() {
    if (this.cron === null || (this.cron && this.cron.includes('simple'))) {
      this.schedule = null
      this.radio2 = 'schedulings'
    } else if (this.cron) {
      this.schedule = this.cron
      this.getScheduleTime('cron:' + this.cron)
    }
    this.radio = this.defaultCheck
  },
  beforeDestroy() {
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    })
  },
  methods: {
    selectChange(value) {
      this.selectedWeekDays = []
      this.whichMonth = ''
      this.mouths = ''
      this.days = ''
      this.hours = null
      this.minutes = ''
    },
    make() {
      const self = this
      let cronString = null
      let scheduleString = ''
      if (this.radio === 'scheduleByCron') {
        cronString = this.schedule
        const cron = cronString.split(' ')
        if (cron.length !== 6 && cron.length !== 7) {
          self.$message.error(self.$version.jobManagement.cronFormatError)
        } else {
          // self.updateJobSchedule(cronString);
          // scheduleString = cronString;
          this.$emit('getCronString', cronString, this.radio)
        }
      } else {
        const minutePart = self.minutes
        const hourPart = self.hours
        const dayPart = self.days
        const whichMonth = self.whichMonth
        const monthPart = self.mouths
        const weekPart = self.selectedWeekDays
        const yearPart =
          typeof self.year === 'object' ? self.year.getFullYear() : self.year
        // const msg = function () {
        //   self.$message.error(self.$version.jobManagement.theTimeIsNotComplete);
        //   return;
        // }
        function noRepeat() {
          if (minutePart && hourPart && dayPart && monthPart && yearPart) {
            // 0 15 10 10 12 ? 2021
            cronString =
              '0 ' +
              minutePart +
              ' ' +
              hourPart +
              ' ' +
              dayPart +
              ' ' +
              monthPart +
              ' ' +
              '?' +
              ' ' +
              yearPart
          } else {
            // msg();
          }
        }
        function everyday() {
          if (minutePart && hourPart) {
            cronString =
              '0 ' +
              minutePart +
              ' ' +
              hourPart +
              ' ' +
              '*' +
              ' ' +
              '*' +
              ' ' +
              '?'
          } else {
            // msg();
          }
        }
        function weekly() {
          if (minutePart && hourPart && weekPart.length) {
            cronString =
              '0 ' +
              minutePart +
              ' ' +
              hourPart +
              ' ' +
              '?' +
              ' ' +
              '*' +
              ' ' +
              weekPart
          } else {
            // msg();
          }
        }
        function monthly() {
          if (minutePart && hourPart && dayPart) {
            cronString =
              '0 ' +
              minutePart +
              ' ' +
              hourPart +
              ' ' +
              dayPart +
              ' ' +
              '*' +
              ' ' +
              '?'
          } else {
            // msg();
          }
        }
        function quarterly() {
          if (minutePart && hourPart && dayPart && whichMonth) {
            switch (whichMonth) {
              case '1':
                cronString =
                  '0 ' +
                  minutePart +
                  ' ' +
                  hourPart +
                  ' ' +
                  dayPart +
                  ' ' +
                  '1,4,7,10' +
                  ' ' +
                  '?'
                break
              case '2':
                cronString =
                  '0 ' +
                  minutePart +
                  ' ' +
                  hourPart +
                  ' ' +
                  dayPart +
                  ' ' +
                  '2,5,8,11' +
                  ' ' +
                  '?'
                break
              case '3':
                cronString =
                  '0 ' +
                  minutePart +
                  ' ' +
                  hourPart +
                  ' ' +
                  dayPart +
                  ' ' +
                  '3,6,9,12' +
                  ' ' +
                  '?'
                break
            }
          } else {
            // msg();
          }
        }
        function yearly() {
          if (minutePart && hourPart && dayPart && monthPart) {
            cronString =
              '0 ' +
              minutePart +
              ' ' +
              hourPart +
              ' ' +
              dayPart +
              ' ' +
              monthPart +
              ' ' +
              '?' +
              ' ' +
              '*'
          } else {
            // msg();
          }
        }

        function schedulings() {
          cronString = null
        }
        // console.log(self.radio2);
        switch (self.radio2) {
          case 'noRepeat':
            noRepeat()
            break
          case 'everyday':
            everyday()
            break
          case 'weekly':
            weekly()
            break
          case 'monthly':
            monthly()
            break
          case 'quarterly':
            quarterly()
            break
          case 'yearly':
            yearly()
            break
          case 'schedulings':
            schedulings()
            break
        }
        scheduleString = cronString
        // this.schedule = scheduleString
        if (cronString) {
          this.$emit('getCronString', cronString, this.radio)
        } else {
          if (self.radio2 === 'schedulings') {
            this.$emit('getCronString', null)
          } else if (this.returnEachChange) {
            this.$emit('getCronString', '')
          } else {
            this.$emit('getCronString', '')
          }
        }
        // this.getScheduleTime('cron:' + this.schedule)
      }
    },
    getScheduleTime(scheduleInCron) {
      const scheduleString = scheduleInCron.split(':')
      const expressionFormat = scheduleString[0]
      let cron = null
      if (expressionFormat === 'cron') {
        cron = scheduleString[1]
        const cronFormatted = cron.split(' ')
        if (cronFormatted[1] === '*') {
          this.selectedMin = '0'
        } else {
          this.minutes = cronFormatted[1]
        }
        if (cronFormatted[2] === '*') {
          this.selectedHour = '0'
        } else {
          this.hours = cronFormatted[2]
        }
        if (cronFormatted[3] !== '?') {
          this.days = cronFormatted[3]
        } else {
          this.radio2 = 'weekly'
          this.descrip =
            '每周' +
            cronFormatted[5] +
            ' ' +
            this.hours +
            '时' +
            this.minutes +
            '分执行'
        }
        if (cronFormatted[4] === '*' && cronFormatted[5] === '?') {
          if (cronFormatted[3] === '*') {
            this.radio2 = 'everyday'
            this.descrip = '每日' + this.hours + '时' + this.minutes + '分执行'
          } else {
            this.radio2 = 'monthly'
            this.descrip =
              '每' +
              this.mouths +
              '月' +
              this.days +
              '日' +
              this.hours +
              '时' +
              this.minutes +
              '分执行'
          }
        } else if (cronFormatted[4].includes(',')) {
          this.radio2 = 'quarterly'
          this.whichMonth = cronFormatted[4].substring(0, 1)
          this.descrip =
            '每季第' +
            this.whichMonth +
            '个月' +
            this.days +
            '日' +
            this.hours +
            '时' +
            this.minutes +
            '分执行'
        } else if (cronFormatted.length === 7) {
          if (cronFormatted[6] === '*') {
            this.radio2 = 'yearly'
            this.mouths = cronFormatted[4]
            this.descrip =
              '每年' +
              this.mouths +
              '月' +
              this.days +
              '日' +
              this.hours +
              '时' +
              this.minutes +
              '分执行'
          } else {
            this.radio2 = 'noRepeat'
            this.year = cronFormatted[6]
            this.mouths = cronFormatted[4]
            this.days = cronFormatted[3]
            this.descrip =
              cronFormatted[6] +
              '年' +
              this.mouths +
              '月' +
              this.days +
              '日' +
              this.hours +
              '时' +
              this.minutes +
              '分执行'
          }
        }
        if (cronFormatted[5] === '*' || cronFormatted[5] === '?') {
          this.selectedWeekDays = []
        } else {
          this.selectedWeekDays = cronFormatted[5].split(',')
        }
      }
    },
    dayDisabled() {
      if (
        this.radio2 === 'monthly' ||
        this.radio2 === 'quarterly' ||
        this.radio2 === 'yearly'
      ) {
        if (this.radio2 === 'quarterly') {
          if (this.whichMonth) {
            return false
          } else {
            return true
          }
        } else if (this.radio2 === 'yearly') {
          if (this.mouths) {
            return false
          } else {
            return true
          }
        } else {
          return false
        }
      } else {
        return true
      }
    },
    timeDisabled() {
      if (this.radio !== 'scheduleByCron' && this.radio2) {
        if (this.radio2 === 'weekly') {
          if (this.selectedWeekDays.length) {
            return false
          } else {
            return true
          }
        } else if (this.radio2 === 'everyday') {
          return false
        } else {
          if (this.days) {
            return false
          } else {
            return true
          }
        }
      } else {
        return true
      }
    },
    dayCanSelect(item) {
      if (this.mouths === 2) {
        const y =
          typeof this.year === 'object' ? this.year.getFullYear() : this.year
        const dayTotal = new Date(y, 2, 0).getDate() || 28
        return item > dayTotal
      } else {
        if (item === 31) {
          const m = this.mouths
          if (m === 2 || m === 4 || m === 6 || m === 9 || m === 11) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      }
    },
    // refreshData () {
    //   this.whichMonth = ''
    //   this.mouths = ''
    //   this.days = ''
    //   this.hours = ''
    //   this.minutes = ''
    //   this.selectedWeekDays = []
    //   this.year = ''
    //   setTimeout(() => {
    //     this.getScheduleTime('cron:' + this.schedule)
    //   });
    // }
  },
  watch: {
    radio2() {
      this.make()
    },
    year() {
      this.make()
    },
    whichMonth() {
      this.make()
    },
    mouths() {
      // this.days = null
      this.make()
    },
    days() {
      this.make()
    },
    selectedWeekDays() {
      this.make()
    },
    hours() {
      this.make()
    },
    minutes() {
      this.make()
    },
    radio() {
      if (this.schedule) {
        this.make()
      }
    },
    cron() {
      if (this.cron === null) {
        // 获取详情时，异步监听
        this.schedule = null
        this.radio2 = 'schedulings'
      }
      if (this.cron) {
        this.schedule = this.cron
        if (this.cron.includes('simple')) {
          this.schedule = null
          this.radio2 = 'schedulings'
          return
        }
        if (this.cron) {
          this.getScheduleTime('cron:' + this.cron)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/ .el-form-item__label {
  line-height: 34px;
}
.cronSchedule {
  width: 50%;
}
.width {
  width: 8vw;
}
.el-icon-question {
  transform: scale(1.3);
  margin-left: 10px;
  opacity: 0.5;
}
.el-icon-question:hover {
  background-color: lightgrey;
}
.info {
  width: 250px;
  height: 80px;
  position: absolute;
  top: 0;
  right: 0;
  border: 1px solid grey;
  transform: translateY(-22px);
  text-align: center;
  line-height: 75px;
  opacity: 0.6;
}
.form {
  span {
    color: #606266;
    margin-right: 15px;
    margin-left: 2px;
  }
}
.select {
  display: inline-block;
  width: 60px;
}
/deep/ .el-form-item__label {
  width: auto !important;
}
</style>
<style lang="scss">
// .weeklyselect {
//   .el-input--small .el-input__inner {
//     height: 34px;
//   }
// }
</style>
