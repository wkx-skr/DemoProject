/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosInstance,
  Axios
} from 'axios'
import { useUserStore } from '@/store/user/user'
import qs from 'qs'
import _ from 'lodash'
import cookies from 'js-cookie'
import router from '@/router'
import utils from '@/utils'
import { useMessage } from 'naive-ui'

const userStore = useUserStore()

/**
 * @description Log and display errors
 * @param {Error} error Error object
 */
const handleError = (res: AxiosResponse<any, any>) => {
  // Print to console
  if (import.meta.env.MODE === 'development') {
    utils.log.capsule('DolphinScheduler', 'UI')
    utils.log.error(res)
  }
  window.$message.error(res.data.msg)
}

const baseRequestConfig: AxiosRequestConfig = {
  baseURL: '/ddd',
  timeout: 15000,
  transformRequest: (params) => {
    if (_.isPlainObject(params)) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    } else {
      return params
    }
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
}
const ddmBaseRequestConfig: AxiosRequestConfig = {
  baseURL: '/ddm',
  timeout: 15000,
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
}
const dddBaseRequestConfig: AxiosRequestConfig = {
  baseURL: '/ddd',
  timeout: 15000,
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
}

const service = axios.create(baseRequestConfig)
const ddmService = axios.create(ddmBaseRequestConfig)
const dddService = axios.create(dddBaseRequestConfig)

class DdtService {
  public $showFailure: (e: any) => void
  private service: AxiosInstance

  constructor(service: AxiosInstance) {
    this.service = service
    this.$showFailure = (e: any) => {
      if (e && e.message === 'not show message') {
        return
      }
      let errorMessage = ''
      if (typeof e === 'string') {
        errorMessage = e
      }
      if (e.response && e.response.data && e.response.data.errorMessage) {
        errorMessage = e.response.data.errorMessage
      }
      if (!errorMessage && e && e.message) {
        try {
          errorMessage = JSON.parse(e.message).errorMessage
        } catch (err) {
          console.warn(err)
          errorMessage = e.message
        }
      }
      errorMessage && window.$message.error(errorMessage)
    }
  }
}

class DdmService {
  public $showFailure: (e: any) => void
  private ddmService: AxiosInstance

  constructor(ddmService: AxiosInstance) {
    this.ddmService = ddmService
    this.$showFailure = (e: any) => {
      if (e && e.message === 'not show message') {
        return
      }
      let errorMessage = ''
      if (typeof e === 'string') {
        errorMessage = e
      }
      if (e.response && e.response.data && e.response.data.errorMessage) {
        errorMessage = e.response.data.errorMessage
      }
      if (!errorMessage && e && e.message) {
        try {
          errorMessage = JSON.parse(e.message).errorMessage
        } catch (err) {
          console.warn(err)
          errorMessage = e.message
        }
      }
      errorMessage && window.$message.error(errorMessage)
    }
  }
}

class DddService {
  public $showFailure: (e: any) => void
  private dddService: AxiosInstance

  constructor(dddService: AxiosInstance) {
    this.dddService = dddService
    this.$showFailure = (e: any) => {
      if (e && e.message === 'not show message') {
        return
      }
      let errorMessage = ''
      if (typeof e === 'string') {
        errorMessage = e
      }
      if (e.response && e.response.data && e.response.data.errorMessage) {
        errorMessage = e.response.data.errorMessage
      }
      if (!errorMessage && e && e.message) {
        try {
          errorMessage = JSON.parse(e.message).errorMessage
        } catch (err) {
          console.warn(err)
          errorMessage = e.message
        }
      }
      errorMessage && window.$message.error(errorMessage)
    }
  }
}

const ddtService: DdtService = new DdtService(service)
const ddmApi: DdmService = new DdmService(ddmService)
const dddApi: DddService = new DddService(dddService)

const err = (err: AxiosError): Promise<AxiosError> => {
  if (err.response?.status === 401 || err.response?.status === 504) {
    userStore.setSessionId('')
    userStore.setSecurityConfigType('')
    userStore.setUserInfo({})
    router.push({ path: '/login' })
  }

  return Promise.reject(err)
}

service.interceptors.request.use((config: AxiosRequestConfig<any>) => {
  config.headers && (config.headers.sessionId = userStore.getSessionId)
  const language = cookies.get('language')
  config.headers = config.headers || {}
  if (language) config.headers.language = language

  return config
}, err)

// The response to intercept
service.interceptors.response.use((res: AxiosResponse) => {
  // No code will be processed
  if (res.data.code === undefined) {
    return res.data
  }

  switch (res.data.code) {
    case 0:
      return res.data.data
    default:
      handleError(res)
      throw new Error()
  }
}, err)

export {
  ddmApi,
  ddtService,
  dddApi,
  service as ddtAxios,
  ddmService as ddmAxios,
  dddService as dddAxios
}
