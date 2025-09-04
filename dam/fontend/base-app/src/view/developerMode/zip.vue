<template>
  <div></div>
</template>

<script>
import pako from 'pako'
export default {
  name: 'zip',
  mounted() {
    this.read()
  },
  methods: {
    read() {
      const source =
        'H4sIAAAAAAAAAF2PPQ+CMBRFd3/FHUEJwc1BTQh9AokUQ4uOBmMHE/mI6OC/txVRZOvruz33NKEsJMRcpjjV1aNVLdgEQC5iHsIStKVAQpXNtX4qdbycHbTFtbg9HZxVU9zuparu+hqbLE2+udYgDhFlNEqtsPBsCLNOOSzmDsh6KYaz/YFwJL4MImKQZsh3zJcEQRLMfTvrh/1pphGd39T15gYAMP0H/aDTsfo91lrF834lPJX/RTEXlMmRpNNX2R18729zEgb7FxpafJLj/uWqE3gB+rNpMoIBAAA='
      var encodedData = source
      var decodedData = window.atob(encodedData)

      var charData = decodedData.split('').map(function (x) {
        return x.charCodeAt(0)
      })
      var binData = new Uint8Array(charData)
      var data = pako.inflate(binData)
      decodedData = String.fromCharCode.apply(null, new Uint16Array(data))
      console.log(decodedData)
    },
  },
}
</script>

<style scoped></style>
