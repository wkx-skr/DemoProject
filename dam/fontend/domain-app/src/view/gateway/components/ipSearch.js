export default {
  data() {
    return {
      form: {
        start: '',
        end: '',
      },
      ipName: '',
      isIp: false,
      ipTip: '',
      showError: false,
      firstIp: null,
      allList: [],
      lastIp: '',
      isDisabled: true,
      isLast: true,
      flag: true,
    }
  },
  watch: {
    'form.start'(val) {
      const arr = val.split('.')
      const newArr = arr.slice(0, 3)
      if (arr.length > 3) {
        this.ipName = newArr.join('.') + '.'
      } else {
        this.ipName = newArr.join('.')
      }

      var exp =
        /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      var reg = this.form.start.match(exp)
      if (reg == null) {
        // this.isIp = false
        // this.ipTip = 'ip地址不合法'
        this.isDisabled = true
      } else {
        // this.isIp = true
        // this.ipTip = ''
        this.firstIp = parseInt(this.form.start.split('.')[3])
        this.isDisabled = false
      }
    },
  },
  created() {},
  mounted() {},
  methods: {
    stopSearch() {
      this.flag = false
    },
    async formSearch() {
      this.flag = true
      this.allList = []
      const portArr = [
        {
          port: 3306,
          name: 'mysql',
        },
        {
          port: 1521,
          name: 'oracle',
        },
        {
          port: 1433,
          name: 'sqlserver',
        },
        {
          port: 8123,
          name: 'clickhouse',
        },
        {
          port: 5432,
          name: 'postgresql',
        },
        {
          port: 5433,
          name: 'vertica',
        },
        {
          port: 5439,
          name: 'redshift',
        },
        {
          port: 50000,
          name: 'db2',
        },
        {
          port: 1025,
          name: 'Teradata',
        },
        {
          port: 5258,
          name: 'Gbase',
        },
      ]
      if (this.form.end && parseInt(this.form.end) <= this.firstIp) {
        this.showError = true
        return
      } else {
        this.showError = false
      }
      this.isLast = false
      if (this.form.end) {
        for (let i = this.firstIp; i <= parseInt(this.form.end); i++) {
          this.lastIp = i
          for (let j = 0; j < portArr.length; j++) {
            const params = {
              ip: `${this.ipName}${this.lastIp}`,
              port: portArr[j].port,
            }
            try {
              if (!this.flag) {
                this.isLast = true
                return
              }
              let res = await this.$http.get(
                this.$url + '/service/utils/portscan',
                { params: params }
              )
              if (res.status === 200) {
                if (res.data.data.connectable) {
                  const tip = `${params.ip}发现${portArr[j].name}数据库`
                  this.allList.push(tip)
                }
                if (
                  res.data.data.ip === this.ipName + this.form.end &&
                  res.data.data.port === portArr[portArr.length - 1].port
                ) {
                  if (this.allList.length === 0) {
                    this.allList.push('暂未发现与其匹配的数据库')
                  }
                  this.isLast = true
                }
              }
            } catch (e) {
              this.$showFailure(e)
            }
          }
        }
      } else {
        this.lastIp = this.firstIp
        for (let j = 0; j < portArr.length; j++) {
          const params = {
            ip: `${this.ipName}${this.lastIp}`,
            port: portArr[j].port,
          }
          try {
            if (!this.flag) {
              this.isLast = true
              return
            }
            let res = await this.$http.get(
              this.$url + '/service/utils/portscan',
              { params: params }
            )
            if (res.status === 200) {
              if (res.data.data.connectable) {
                const tip = `${params.ip}发现${portArr[j].name}数据库`
                this.allList.push(tip)
              }
              if (res.data.data.port === portArr[portArr.length - 1].port) {
                if (this.allList.length === 0) {
                  this.allList.push('暂未发现与其匹配的数据库')
                }
                this.isLast = true
              }
            }
          } catch (e) {
            this.$showFailure(e)
          }
        }
      }
    },
    handleInput(value) {
      if (value.replace(/[^0-9.]/g, ''))
        value = value.replace(/[^0-9.]/g, '') && value
    },
    handleBlur() {
      var exp =
        /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      var reg = this.form.start.match(exp)
      if (reg == null) {
        this.isIp = false
        this.ipTip = 'ip地址不合法'
        this.isDisabled = true
      } else {
        this.isIp = true
        this.ipTip = ''
        this.firstIp = parseInt(this.form.start.split('.')[3])
        this.isDisabled = false
      }
    },
  },
}
