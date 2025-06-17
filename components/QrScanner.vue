<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="headline justify-center">QR Code Scanner</v-card-title>

          <v-card-text>

            <!-- Scanner Transition UI -->
            <transition name="fade">
              <!-- Scanner Active -->
              <div v-if="isScanning" key="scanner">
                <div id="reader" class="rounded-lg overflow-hidden" style="width: 100%; height: auto;"></div>
              </div>

              <!-- Scanner Inactive -->
              <div v-else key="placeholder" class="text-center py-10 grey lighten-4 rounded-lg">
                <v-icon size="48" color="grey darken-1">mdi-camera-off</v-icon>
                <div class="mt-4 text-subtitle-1 font-weight-medium">
                  Scanner is not active
                </div>
                <div class="text-body-2 grey--text mb-4">
                  Click the button below to start scanning QR codes.
                </div>
                <v-btn color="primary" @click="startScanner">▶️ Start Scanning</v-btn>
              </div>
            </transition>

            <!-- Flashlight Toggle -->
            <v-btn v-if="torchSupported" class="mt-4" color="amber darken-2" dark block @click="toggleTorch">
              🔦 {{ torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight' }}
            </v-btn>

            <!-- Start/Stop Buttons -->
            <v-btn class="mt-4" color="primary" block @click="startScanner" :disabled="isScanning">
              ▶️ Start Scanning
            </v-btn>

            <v-btn class="mt-2" color="red darken-1" block @click="stopScanner" :disabled="!isScanning">
              ⏹ Stop Scanning
            </v-btn>

            <!-- Scanned Result -->
            <v-alert v-if="result" type="success" class="mt-4" dense text>
              ✅ Scanned: {{ result }}
            </v-alert>

            <!-- Error Message -->
            <v-alert v-if="error" type="error" class="mt-2" dense text>
              ⚠️ {{ error }}
            </v-alert>

            <!-- Scan History -->
            <v-divider class="my-4" />
            <h3 class="text-subtitle-1 font-weight-medium mb-2">
              📜 Scan History
            </h3>
            <v-list dense two-line>
              <v-list-item v-for="(item, index) in scanHistory" :key="index">
                <v-list-item-content>
                  <v-list-item-title class="text-truncate">
                    {{ item.text }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatTimestamp(item.time) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="scanHistory.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="grey--text">
                    No scans yet
                  </v-list-item-title>
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
      scanHistory: [],
      isScanning: false
    };
  },
  mounted() {
    // if (process.client) {
    //   this.initScanner();
    // }
  },
  methods: {
    async initScanner() {
      // try {
      //   const cameras = await Html5Qrcode.getCameras();
      //   if (cameras && cameras.length) {
      //     this.cameraId = cameras[0].id;
      //     this.html5QrCode = new Html5Qrcode("reader");
      //   } else {
      //     this.error = "No camera found.";
      //   }
      // } catch (err) {
      //   this.error = err.message || "Failed to initialize scanner.";
      // }

      try {
        const devices = await Html5Qrcode.getCameras();

        if (!devices.length) {
          this.error = "No cameras found on this device.";
          return;
        }

        this.cameraId = devices[0].id;
        this.html5QrCode = new Html5Qrcode("reader");
        this.error = null; // clear any previous errors
      } catch (err) {
        this.error = "Failed to initialize scanner: " + (err.message || err);
        console.error("initScanner error:", err);
      }
    },
    async startScanner() {
      if (this.isScanning) return;

  this.result = null;
  this.error = null;
  this.isScanning = true;

  // Wait for DOM to render #reader
  this.$nextTick(async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        this.error = "No cameras found.";
        this.isScanning = false;
        return;
      }

      this.cameraId = cameras[0].id;
      this.html5QrCode = new Html5Qrcode("reader");

      await this.html5QrCode.start(
        //this.cameraId,
        {
          
          facingMode: "environment"
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          //rememberLastUsedCamera: true,
        },
        this.onScanSuccess,
        this.onScanError
      );

      // Torch support
      const track = this.html5QrCode.getRunningTrack();
      const capabilities = track.getCapabilities?.();
      if (capabilities && capabilities.torch) {
        this.torchSupported = true;
      }
    } catch (err) {
      this.error = "Failed to start scanner: " + (err.message || err);
      this.isScanning = false;
    }
  });
    },
    async stopScanner() {
      if (!this.html5QrCode || !this.isScanning) return;
      try {
        await this.html5QrCode.stop();
        this.isScanning = false;
        this.torchOn = false;
      } catch (err) {
        this.error = "Failed to stop scanner: " + (err.message || err);
      }
    },
    onScanSuccess(decodedText) {
      this.result = decodedText;
      this.scanHistory.unshift({
        text: decodedText,
        time: new Date()
      });

      // Restart scanner after short delay
      this.stopScanner().then(() => {
        setTimeout(() => this.startScanner(), 1000);
      });
    },
    onScanError(_) {
      // Silent error or log if needed
    },
    toggleTorch() {
      if (!this.html5QrCode || !this.isScanning) return;
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
    if (this.html5QrCode && this.isScanning) {
      this.html5QrCode.stop().catch(() => { });
    }
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
