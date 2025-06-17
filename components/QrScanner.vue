<template>
  <v-container>
    <v-card class="mx-auto pa-4" max-width="500">
      <v-card-title>QR Scanner</v-card-title>

      <!-- Scanner area -->
      <transition name="fade">
        <div v-if="isScanning">
          <div id="reader" style="width: 100%; min-height: 300px;" />
          <v-progress-circular v-if="isLoading" indeterminate color="primary" class="ma-4" />
        </div>


        <!-- When not scanning -->

        <div v-else class="text-center py-10 text-grey">
          <v-icon size="64">mdi-qrcode-scan</v-icon>
          <div class="mt-2">Scanner is not active</div>
        </div>
      </transition>

      <!-- Action buttons -->
      <v-row justify="center" class="mt-4">
        <v-btn color="primary" @click="startScanner" v-if="!isScanning">
          Start Scanning
        </v-btn>
        <v-btn color="error" @click="stopScanner" v-else>
          Stop Scanning
        </v-btn>
        <v-btn v-if="torchSupported" :color="torchOn ? 'yellow darken-2' : 'grey'" class="ml-2" @click="toggleTorch">
          {{ torchOn ? 'Flashlight Off' : 'Flashlight On' }}
        </v-btn>
      </v-row>

      <!-- Error -->
      <v-alert v-if="error" type="error" dense class="mt-4">
        {{ error }}
      </v-alert>

      <!-- Scan Result -->
      <v-alert v-if="result" type="success" dense class="mt-4">
        Scanned: {{ result }}
      </v-alert>

      <!-- History -->
      <v-card-subtitle class="mt-4">Scan History</v-card-subtitle>
      <v-list dense>
        <v-list-item v-for="(item, index) in history" :key="index">
          <v-list-item-content>
            <v-list-item-title>{{ item }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import { Html5Qrcode } from "html5-qrcode";

export default {
  data() {
    return {
      html5QrCode: null,
      cameraId: null,
      isScanning: false,
      isLoading: false,
      result: null,
      error: null,
      history: [],
      torchOn: false,
      torchSupported: false,
    };
  },
  methods: {
    async startScanner() {
      this.isScanning = true;
      this.isLoading = true;
      this.result = null;
      this.error = null;

      this.$nextTick(async () => {
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (!cameras.length) throw new Error("No cameras found.");

          this.cameraId = cameras[0].id;
          this.html5QrCode = new Html5Qrcode("reader");

          await this.html5QrCode.start(
            //this.cameraId,
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            this.onScanSuccess,
            this.onScanError
          );

          // Torch support
          const track = this.html5QrCode.getRunningTrack();
          const capabilities = track?.getCapabilities?.();
          this.torchSupported = capabilities?.torch || false;
        } catch (err) {
          console.error("Start error:", err);
          this.error = "Failed to start scanner: " + (err.message || err);
          this.isScanning = false;
        } finally {
          this.isLoading = false;
        }
      });
    },

    stopScanner() {
      if (this.html5QrCode) {
        this.html5QrCode.stop().then(() => {
          this.html5QrCode.clear();
          this.html5QrCode = null;
        });
      }
      this.isScanning = false;
      this.torchOn = false;
    },

    async toggleTorch() {
      try {
        const track = this.html5QrCode?.getRunningTrack();
        const capabilities = track?.getCapabilities?.();
        if (!capabilities?.torch) {
          this.error = "Torch not supported on this device.";
          return;
        }

        this.torchOn = !this.torchOn;

        await track.applyConstraints({
          advanced: [{ torch: this.torchOn }],
        });
      } catch (err) {
        console.error("toggleTorch error:", err);
        this.error = "Failed to toggle flashlight.";
      }
    },

    onScanSuccess(decodedText) {
      this.result = decodedText;
      this.history.unshift(decodedText);
      this.stopScanner();
    },

    onScanError(error) {
      // Handle scan error (can be ignored for now)
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
