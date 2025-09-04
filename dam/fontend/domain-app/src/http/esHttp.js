import { fetchEventSource } from '@microsoft/fetch-event-source'

const esHttp = (url = '/aic/api/v1/chat/completions', text = '', callback) => {
  const ctrlAbout = new AbortController()
  const { signal } = ctrlAbout
  fetchEventSource(url, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      stream: true,
      detail: true,
      chatId: '87pxuelmy6aw',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text,
            },
          ],
        },
      ],
    }),
    onmessage(event) {
      if (event.data === '[DONE]') {
        console.log('ai done')
        ctrlAbout.abort()
        callback && callback()
      } else {
        callback && callback(JSON.parse(event.data))
      }
    },
    onclose(ee) {
      // 关闭流
    },
    onerror(error) {
      console.info(error)
      // 返回流报错
    },
  })
}
export default esHttp
