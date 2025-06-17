<template>
  <div>
    <qrcode-stream
      :constraints="{ video: {deviceId: {exact: 'f339900afe8c93e4eb755f9713833bb384beb9378ecfe6216f5bd7b3c4a56c83'} } }"
      @decode="onDecode"
      @init="onInit"
    />
    <p v-if="result">Scanned: {{ result }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return { result: null }
  },
  methods: {
    onDecode(content) {
      this.result = content
    },
    onInit(promise) {
      promise
        .then(() => console.log('Camera started'))
        .catch(error => {
          console.error('Camera init failed:', error.name, error.message)
        })
    }
  }
}
</script>
