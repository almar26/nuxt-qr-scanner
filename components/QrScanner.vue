<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="headline justify-center">QR Code Scanner</v-card-title>

          <v-card-text>
            <!-- QR Scanner Target -->
            <div id="reader" class="rounded-lg overflow-hidden" style="width: 100%; height: auto;"></div>

            <!-- Flashlight toggle -->
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

            <!-- Scan result -->
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
      cameraId: null
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
            this.cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              facingMode: "environment"
            },
            this.onScanSuccess,
            this.onScanError
          );

          // Check flashlight support
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
      this.html5QrCode.stop().catch(() => {});
    },
    onScanError(errorMessage) {
      // silent or show error optionally
    },
    toggleTorch() {
      if (!this.html5QrCode) return;
      const track = this.html5QrCode.getRunningTrack();
      if (track) {
        this.torchOn = !this.torchOn;
        track.applyConstraints({
          advanced: [{ torch: this.torchOn }]
        }).catch(() => {
          this.error = "Flashlight toggle failed.";
        });
      }
    }
  },
  beforeDestroy() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().catch(() => {});
    }
  }
};
</script>
