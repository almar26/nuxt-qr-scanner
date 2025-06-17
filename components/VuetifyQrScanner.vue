<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" outlined elevation="4">
          <v-card-title class="headline font-weight-bold justify-center">
            QR Code Scanner
          </v-card-title>

          <v-card-text>

            <!-- Camera Overlay Spinner -->
            <v-overlay :value="isLoading" absolute>
              <v-progress-circular indeterminate color="primary" size="64" />
            </v-overlay>

            <!-- QR Scanner -->
            <v-responsive aspect-ratio="1">
              <qrcode-stream
                ref="scanner"
                class="rounded-lg overflow-hidden"
                :constraints="{ video: { facingMode: 'environment' } }"
                @decode="onDecode"
                @init="onInit"
              />
            </v-responsive>

            <!-- Flashlight Toggle -->
            <v-btn
              v-if="torchSupported"
              color="amber darken-2"
              dark
              block
              class="mt-4"
              @click="toggleTorch"
            >
              🔦 {{ torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight' }}
            </v-btn>

            <!-- Result -->
            <v-alert
              v-if="result"
              type="success"
              class="mt-4"
              dense
              text
            >
              ✅ Scanned: {{ result }}
            </v-alert>

            <!-- Error -->
            <v-alert
              v-if="error"
              type="error"
              class="mt-4"
              dense
              text
            >
              ⚠️ {{ error }}
            </v-alert>

            <!-- Scan History -->
            <v-divider class="my-4" />
            <h3 class="text-subtitle-1 font-weight-medium mb-2">📜 Scan History</h3>
            <v-list dense two-line>
              <v-list-item
                v-for="(item, index) in scanHistory"
                :key="index"
              >
                <v-list-item-content>
                  <v-list-item-title class="text-truncate">{{ item }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatTimestamp(index) }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="scanHistory.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="grey--text">No scans yet</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>

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
      error: null,
      isLoading: true,
      scanHistory: [],
      track: null,
      torchSupported: false,
      torchOn: false
    }
  },
  methods: {
    onDecode(result) {
      this.result = result
      if (!this.scanHistory.includes(result)) {
        this.scanHistory.unshift(result)
      }
    },
    async onInit(promise) {
      this.isLoading = true
      try {
        const stream = await promise
        this.error = null
        const videoTrack = stream.getVideoTracks()[0]
        this.track = videoTrack

        // Check if torch is supported
        const capabilities = videoTrack.getCapabilities()
        this.torchSupported = capabilities.torch || false
      } catch (err) {
        this.error = err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow it.'
          : err.message || 'Camera initialization failed.'
      } finally {
        this.isLoading = false
      }
    },
    toggleTorch() {
      if (!this.track) return
      const desired = !this.torchOn
      this.track.applyConstraints({
        advanced: [{ torch: desired }]
      }).then(() => {
        this.torchOn = desired
      }).catch(() => {
        this.error = 'Flashlight not supported or failed to toggle.'
      })
    },
    formatTimestamp(index) {
      const now = new Date()
      return now.toLocaleString()
    }
  }
}
</script>

<style scoped>
.qrcode-stream {
  width: 100%;
  height: 100%;
}
</style>
