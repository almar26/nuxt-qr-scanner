<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="headline justify-center">QR Code Scanner</v-card-title>

          <v-card-text>
            <!-- QR Scanner Area -->
            <div id="reader" class="rounded-lg overflow-hidden" style="width: 100%; height: auto;"></div>

            <!-- Flashlight Toggle -->
            <v-btn
              v-if="torchSupported"
              class="mt-4"
              color="amber darken-2"
              dark
              block
              @click="toggleTorch"
            >
              🔦 {{ torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight' }}
            </v-btn>

            <!-- Current Result -->
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
              class="mt-2"
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
                  <v-list-item-title class="text-truncate">{{ item.text }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatTimestamp(item.time) }}</v-list-item-subtitle>
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
import { Html5Qrcode } from "html5-qrcode";

export default {
  data() {
    return {
      html5QrCode: null,
      result: null,
      error: null,
      torchSupported: false,
      torchOn: false,
      cameraId: null,
      scanHistory: []
    };
  },
  mounted() {
    if (process.client) {
      this.initScanner();
    }
  },
  methods: {
    async initScanner() {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          this.cameraId = cameras[0].id;
          this.html5QrCode = new Html5Qrcode("reader");

          await this.html5QrCode.start(
            //this.cameraId,
            {
              //rememberLastUsedCamera: true,
              facingMode: "environment"
            },
            {
               fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            this.onScanSuccess,
            this.onScanError
          );

          const track = this.html5QrCode.getRunningTrack();
          const capabilities = track.getCapabilities?.();
          if (capabilities && capabilities.torch) {
            this.torchSupported = true;
          }
        } else {
          this.error = "No camera found.";
        }
      } catch (err) {
        this.error = err.message || "Failed to initialize scanner.";
      }
    },
    onScanSuccess(decodedText) {
      this.result = decodedText;

      // Add to history
      this.scanHistory.unshift({
        text: decodedText,
        time: new Date()
      });

      // Stop scanner after scan
      //this.html5QrCode.stop().catch(() => {});
    },
    onScanError(_) {
      // silent or log error optionally
    },
    toggleTorch() {
      if (!this.html5QrCode) return;
      const track = this.html5QrCode.getRunningTrack();
      if (track) {
        this.torchOn = !this.torchOn;
        track
          .applyConstraints({ advanced: [{ torch: this.torchOn }] })
          .catch(() => {
            this.error = "Flashlight toggle failed.";
          });
      }
    },
    formatTimestamp(date) {
      return new Date(date).toLocaleString();
    }
  },
  beforeDestroy() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().catch(() => {});
    }
  }
};
</script>
