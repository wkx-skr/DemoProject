import axios from 'axios'
export default {
  data() {
    return {
      http: this.$http ? this.$http : axios,

      urls: {
        getUserLists: {
          description: '获取用户列表，无需session',
          url: '/gateway/main/user/getUserLists',
        },
        getAbout: {
          url: '/gateway/main/about',
        },
        // getUserInfo: {
        //     description: '获取当前用户的基本信息和权限列表',
        //     url: '/gateway/main/getUserInfo'
        // },
        // getEnable: {
        //     url: '/gateway/server/getEnable'
        // },
        getEnableList: {
          description: '获取所有服务',
          url: '/gateway/server/getEnableList',
        },
        getAppEnableConfig: {
          description: '获取服务的联通性',
          url: '/gateway/server/configConnect',
          method: 'get',
        },
        hello: {
          description: '测试gateway联通性,无需session',
          url: '/gateway/hello',
          method: 'get',
        },
        getVersionLevel: {
          description: '获取分版信息，需要session',
          url: '/user/main/editionInfos',
        },
        getLicenseDetail: {
          description: '获取license信息',
          url: '/base/license/getLicenseDetail',
        },
        // getServerConfig: {
        //     description: '获取各产品包含的微服务，无需session',
        //     url: '/gateway/server/config',
        //     method: 'get',
        // },
        // getAllRolesByProduct: {
        //     description: "根据微服务列表获取当前产品的权限列表,需要session",
        //     url: '/user/role/service',
        //     requestBody: ["DAM", "DOMAIN", "DDM", "METADATA", "BASE"],
        //     method: 'post',
        // },
        // health: {
        //     url: '/gateway/health',
        //     method: 'get'
        // }
      },
      cachedData: {},
      temporaryPromise: {},
      stablePromise: {},
    }
  },
  mounted() {
    this.setPromises()
    this.setTimeoutInterval()
    // this.test()
  },
  methods: {
    setTimeoutInterval() {
      setInterval((_) => {
        if (localStorage.getItem('hold-on')) {
          const lastTimestamp = parseInt(localStorage.getItem('hold-on'))
          if (
            this.cachedData?.getAbout?.maxInterval &&
            new Date().getTime() - lastTimestamp >
              this.cachedData.getAbout.maxInterval * 1000
          ) {
            fetch('/gateway/logout', {
              method: 'POST',
            }).then((_) => {
              window.location.reload()
            })
          }
        }
      }, 10000)
    },
    test() {
      Object.keys(this.stablePromise).forEach((promiseName) => {
        const promise = this.stablePromise[promiseName]
        promise()
          .then((data) => {
            console.log(promiseName, data)
          })
          .catch((e) => {
            console.error('=============')
            console.error(e)
          })
      })
    },
    setPromises() {
      Object.keys(this.urls).forEach((name) => {
        this.stablePromise[name] = () => {
          return new Promise((resolve, reject) => {
            if (this.cachedData[name]) {
              this.temporaryPromise[name] = null
              resolve(this.cachedData[name])
            } else {
              if (!this.temporaryPromise[name]) {
                this.temporaryPromise[name] = this.http[
                  this.urls[name].method ? this.urls[name].method : 'post'
                ](
                  this.urls[name].url,
                  this.urls[name].requestBody
                    ? this.urls[name].requestBody
                    : null
                )
              }
              this.temporaryPromise[name]
                .then((res) => {
                  this.cachedData[name] = res.data
                  resolve(this.cachedData[name])
                })
                .catch((e) => {
                  reject(e)
                })
            }
          })
        }
      })
      this.setServerConfig()
      this.setServersAndRolesOfCurrentProduct()
      this.setUserInfo()
      this.$emit('get-global-message', this.stablePromise)
    },
    setUserInfo() {
      const name = 'getUserInfo'
      this.stablePromise[name] = () => {
        return new Promise((resolve, reject) => {
          if (this.cachedData[name]) {
            this.temporaryPromise[name] = null
            resolve(this.cachedData[name])
          } else {
            this.stablePromise
              .getAllRolesOfCurrentProduct()
              .then((allRolesOfProduct) => {
                if (!this.temporaryPromise[name]) {
                  this.temporaryPromise[name] = this.http.post(
                    '/gateway/main/getUserInfo'
                  )
                }
                this.temporaryPromise[name]
                  .then((res) => {
                    const allRolesOfProductSet = new Set(allRolesOfProduct)
                    res.data.roles = res.data.roles.filter((i) => {
                      return allRolesOfProductSet.has(i)
                    })
                    this.cachedData[name] = res.data
                    resolve(this.cachedData[name])
                  })
                  .catch((e) => {
                    reject(e)
                  })
              })
          }
        })
      }
    },
    setServerConfig() {
      const name = 'getAllServersOfCurrentProduct'
      this.stablePromise[name] = () => {
        return new Promise((resolve, reject) => {
          // if (this.cachedData[name]) {
          //     this.temporaryPromise[name] = null
          //     resolve(this.cachedData[name])
          // } else {
          // if (!this.temporaryPromise[name]) {
          this.temporaryPromise[name] = this.http.get('/gateway/server/config')
          // }
          this.temporaryPromise[name]
            .then((res) => {
              let currentProduct;
              // 判断是否在iframe且父页面为ddm-app
              if (window.self !== window.top && document.referrer && document.referrer.includes('/ddm-app/')) {
                currentProduct = 'DDM';
              } else {
                currentProduct = localStorage.getItem('currentProduct')
                  ? localStorage.getItem('currentProduct').toUpperCase()
                  : 'DAM';
              }
              console.log(currentProduct, 'currentProduct', localStorage.getItem('currentProduct'))
              this.cachedData[name] = res.data[currentProduct]
              resolve(this.cachedData[name])
            })
            .catch((e) => {
              reject(e)
            })
          // }
        })
      }
    },
    setServersAndRolesOfCurrentProduct() {
      const name = 'getAllRolesOfCurrentProduct'
      this.stablePromise[name] = () => {
        return new Promise((resolve, reject) => {
          if (this.cachedData[name]) {
            this.temporaryPromise[name] = null
            resolve(this.cachedData[name])
          } else {
            this.stablePromise
              .getAllServersOfCurrentProduct()
              .then((ServerConfig) => {
                if (!this.temporaryPromise[name]) {
                  this.temporaryPromise[name] = this.http.post(
                    '/user/role/service',
                    ServerConfig
                  )
                }
                this.temporaryPromise[name]
                  .then((res) => {
                    this.cachedData[name] = res.data
                    resolve(this.cachedData[name])
                  })
                  .catch((e) => {
                    reject(e)
                  })
              })
          }
        })
      }
    },
  },
}
