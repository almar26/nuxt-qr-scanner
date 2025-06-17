<template>
  <v-container>

    <v-card class="mx-auto" max-width="500">
      <v-card-title class="headline justify-center">QR Code Scanner</v-card-title>

      <!-- Scanner area -->
      <transition name="fade">
        <div v-if="isScanning">
          <div id="reader" style="width: 100%; " />
          <div v-if="!isLoading" class="text-center mt-4">
            <v-progress-circular indeterminate color="primary" size="24" />
            <div class="mt-2">Scanning...</div>
          </div>
          <div v-if="isLoading" class="d-flex align-center justify-center" style="height: 300px;">
            <v-progress-circular indeterminate color="primary" size="64" />
          </div>

        </div>

        <!-- When not scanning -->
        <div v-else class="text-center py-10 text-grey">
          <v-icon size="64">mdi-qrcode-scan</v-icon>
          <div class="mt-2">Scanner is not active</div>
        </div>
      </transition>

      <v-card-text>
        <v-btn block color="primary" @click="startScanner" v-if="!isScanning">
          <v-icon left>mdi-play</v-icon> Start Scanning
        </v-btn>
        <v-btn block color="error" @click="stopScanner" v-else>
          <v-icon left>mdi-stop</v-icon> Stop Scanning
        </v-btn>
        <v-btn v-if="torchSupported" :color="torchOn ? 'yellow darken-2' : 'grey'" class="ml-2" @click="toggleTorch">
          {{ torchOn ? 'Flashlight Off' : 'Flashlight On' }}
        </v-btn>


        <!-- Result -->

        <v-card outlined class="mt-4">
          <v-card-subtitle class="text-center">Scan Result:</v-card-subtitle>
          <v-card-text class="text-center">
            {{ result }}
          </v-card-text>

        </v-card>
      </v-card-text>


      <v-row>
        <v-col>
          <!-- Error -->
          <v-alert v-if="error" type="error" dense class="mt-4">
            {{ error }}
          </v-alert>

    

          <!-- Scan Result -->
          <!-- <v-alert v-if="result" type="success" dense class="mt-4">
            Scanned: {{ result }}
          </v-alert> -->

   


          <!-- History -->
          <v-divider></v-divider>
          <v-card-subtitle class="mt-4">Scan History</v-card-subtitle>

          <v-list dense two-line>
            <div v-for="(item, index) in history" :key="index">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="text-truncate">
                    {{ item.text }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatTimestamp(item.time) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </div>
            <v-list-item v-if="history.length === 0">
              <v-list-item-content>
                <v-list-item-title class="grey--text text-center">
                  No scans yet
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>


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
      snackbarError: false,
      snackbarResult: false,
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
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            this.onScanSuccess,
            this.onScanError
          );

        } catch (err) {
          console.error("Start error:", err);
          this.error = "Failed to start scanner: " + (err.message || err);
          this.isScanning = false;
        } finally {
          this.isLoading = false;
        }
      });
    },

    async stopScanner() {
      if (!this.html5QrCode) return;
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
      this.snackbarResult = true;
      this.history.unshift({
        text: decodedText,
        time: new Date()
      });

      // console.log("Success")
      this.stopScanner().then(() => {
        setTimeout(() => this.startScanner(), 1000);
      });
    },

    onScanError(error) {
      // Handle scan error (can be ignored for now)
    },

    formatTimestamp(date) {
      return new Date(date).toLocaleString();
    }
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

.fullscreen-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.75);
  z-index: 9999;
}
</style>
