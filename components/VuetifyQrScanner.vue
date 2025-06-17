<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" outlined elevation="4">
          <v-card-title class="headline font-weight-bold justify-center">
            QR Code Scanner
          </v-card-title>

          <v-card-text>
            <v-responsive aspect-ratio="1">
              <qrcode-stream
                class="rounded-lg overflow-hidden"
                :constraints="{ video: { facingMode: 'environment' } }"
                @decode="onDecode"
                @init="onInit"
              />
            </v-responsive>

            <v-alert
              v-if="result"
              type="success"
              class="mt-4"
              dense
              text
            >
              ✅ Scanned: {{ result }}
            </v-alert>

            <v-alert
              v-if="error"
              type="error"
              class="mt-4"
              dense
              text
            >
              ⚠️ {{ error }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      result: null,
      error: null
    }
  },
  methods: {
    onDecode(result) {
      this.result = result
    },
    onInit(promise) {
      promise.catch(err => {
        this.error = err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow it.'
          : err.message || 'Camera initialization failed.'
      })
    }
  }
}
</script>

<style scoped>
/* optional styling for smoother display */
.qrcode-stream {
  width: 100%;
  height: 100%;
}
</style>
