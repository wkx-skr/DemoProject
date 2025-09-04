/*
 * @Author: sunyuxia sunyuxia1991@163.com
 * @Date: 2022-11-23 14:11:58
 * @LastEditors: sunyuxia sunyuxia1991@163.com
 * @LastEditTime: 2022-11-24 10:49:49
 * @FilePath: /dam-web/datablau-web/src/view/dataSecurity/informationItems/components/udps/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      formContent: {
        udpList: [],
      },
    }
  },
  props: {
    defaultUdps: Array,
  },
  watch: {
    defaultUdps: {
      handler(udps) {
        this.$refs.udpForm && this.$refs.udpForm.clearValidate()
        this.$set(
          this.formContent,
          'udpList',
          udps && udps.length
            ? _.cloneDeep(
                udps.map(item => ({
                  ...item,
                  delete: false,
                }))
              )
            : [
                {
                  propName: '',
                  propOrder: 0,
                  desc: '',
                  type: '',
                  typeData: '',
                  required: false,
                  value: '',
                  delete: false,
                },
              ]
        )
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    add(index) {
      this.formContent.udpList.push({
        propName: '',
        propOrder: index + 1,
        desc: '',
        type: '',
        typeData: '',
        required: false,
        value: '',
        delete: false,
      })
    },
    remove(index) {
      const target = this.validateUdps[index]
      console.log(index, target)
      if (target.id) {
        target.delete = true
      } else {
        this.formContent.udpList.splice(index, 1)
      }
    },
    submitData() {
      this.$refs.udpForm.validate(valid => {
        if (valid) {
          const params = _.cloneDeep(this.formContent.udpList)
          this.$emit('update', params)
        } else {
          return false
        }
      })
    },
    closeDialog() {
      this.$emit('close')
    },
    // 判断扩展属性名是否重名
    checkName(name) {
      const target = this.validateUdps.filter(item => item.propName === name)
      // console.log(target)
      if (target.length < 2) {
        return true
      } else {
        return false
      }
    },
    validator(rule, value, callback) {
      if (rule.field && rule.field.indexOf('propName') === 0) {
        let updIndex = rule.field.replace('propName', '')
        let udp = this.formContent.udpList[updIndex]
        // console.log(udp.propName)
        if (udp.propName) {
          this.checkName(udp.propName)
            ? callback()
            : callback(new Error(this.$t('informationItems.attrRepeat')))
        } else {
          console.log('bu neng wei kong')
          callback(new Error(this.$t('informationItems.attrNotNull')))
        }
        return
      }
      if (rule.field && rule.field.indexOf('typeData') === 0) {
        let updIndex = rule.field.replace('typeData', '')
        let item = this.formContent.udpList[updIndex]
        if (item.type !== 'ENUM' || item.typeData) {
          callback()
        } else {
          callback(new Error(this.$t('informationItems.enumNotNull')))
        }
        return
      }
      if (rule.field && rule.field.indexOf('type') === 0) {
        console.log(rule)
        let updIndex = rule.field.replace('type', '')
        let udp = this.formContent.udpList[updIndex]
        if (udp.type) {
          callback()
        } else {
          callback(new Error(this.$t('informationItems.attrTypeNotNull')))
        }
        return
      }
    },
  },
  computed: {
    rules() {
      let obj = {
        propName: [
          {
            required: true,
            trigger: 'blur',
            validator: this.validator,
          },
        ],
        typeData: [
          {
            required: true,
            trigger: 'blur',
            validator: this.validator,
          },
        ],
        type: [
          {
            required: true,
            trigger: 'blur',
            validator: this.validator,
          },
        ],
      }
      let newObj = {}
      this.formContent.udpList
        .filter(item => !item.delete)
        .forEach((item, index) => {
          newObj['propName' + index] = obj.propName
          newObj['typeData' + index] = obj.typeData
          newObj['type' + index] = obj.type
        })
      return newObj
    },
    validateUdps() {
      return this.formContent.udpList.filter(item => !item.delete)
    },
  },
}
