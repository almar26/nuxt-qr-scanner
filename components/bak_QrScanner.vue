<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4" outlined>
          <v-card-title class="headline justify-center">QR Code Scanner</v-card-title>

          <v-card-text>
            <!-- Spinner during camera init -->
            <v-overlay :value="isLoading" absolute>
              <v-progress-circular indeterminate color="primary" size="64" />
            </v-overlay>
            <!-- QR Scanner Area -->
            <!-- <v-responsive aspect-ratio="1">
              <div id="reader" v-show="isShow" class="rounded-lg overflow-hidden" style="width: 100%;"></div>
            </v-responsive> -->
            <!-- QR Scanner Area -->
            <div v-show="isScanning"  id="reader" class="rounded-lg overflow-hidden" style="width: 100%; height: auto;">
            </div>

            <!-- Idle Placeholder -->
            <div v-if="!isScanning" class="text-center py-10 grey lighten-4 rounded-lg">
              <v-icon size="48" color="grey darken-1">mdi-camera-off</v-icon>
              <div class="mt-4 text-subtitle-1 font-weight-medium">Scanner is not active</div>
              <div class="text-body-2 grey--text mb-4">Click the button below to start scanning QR codes.</div>
              <!-- <v-btn color="primary" @click="startScanner">▶️ Start Scanning</v-btn> -->
            </div>

            <!-- Scanner Control Buttons -->
            <v-btn class="mt-4" color="primary" block @click="startScanner" :disabled="isScanning">
              ▶️ Start Scanning
            </v-btn>

            <v-btn class="mt-2" color="red darken-1" block @click="stopScanner" :disabled="!isScanning">
              ⏹ Stop Scanning
            </v-btn>

            <!-- Current Result -->
            <v-alert v-if="result" type="success" class="mt-4" dense text>
              ✅ Scanned: {{ result }}
            </v-alert>

            <!-- Error -->
            <v-alert v-if="error" type="error" class="mt-2" dense text>
              ⚠️ {{ error }}
            </v-alert>

            <!-- Scan History -->
            <v-divider class="my-4" />
            <h3 class="text-subtitle-1 font-weight-medium mb-2">📜 Scan History</h3>
            <v-list dense two-line>
              <v-list-item v-for="(item, index) in scanHistory" :key="index">
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
      isLoading: true,
      result: null,
      error: null,
      torchSupported: false,
      torchOn: false,
      cameraId: null,
      scanHistory: [],
      isScanning: false,
      isShow: false
    };
  },
  mounted() {
    // if (process.client) {
    //   this.initScanner();
    // }
    this.initScanner()
  },
  methods: {
    async initScanner() {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          this.isLoading = false;
          this.html5QrCode = new Html5Qrcode("reader");
          const config = { fps: 10, qrbox: 250 };
          // await this.html5QrCode.start(
          //   //this.cameraId,
          //   { facingMode: "environment" },
          //   config,
          //   this.onScanSuccess,
          //   this.onScanError
          // );
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

      // Stop scanning, wait a moment, then restart
      this.isLoading = true;
      this.stopScanner().then(() => {
        setTimeout(() => this.startScanner(), 1000);
      });
      // this.html5QrCode
      //   .stop()
      //   .then(() => {
      //     setTimeout(() => {
      //       this.isLoading = false;
      //       this.html5QrCode
      //         .start(
      //           {

      //             //rememberLastUsedCamera: true,
      //             facingMode: "environment"
      //           },
      //           {
      //             fps: 10,
      //             qrbox: { width: 250, height: 250 },
      //           },
      //           this.onScanSuccess,
      //           this.onScanError
      //         )
      //         .catch(err => {
      //           this.error = "Restart failed: " + (err.message || err);
      //         });
      //     }, 1000); // 1 second delay before restart
      //   })
      //   .catch(err => {
      //     this.error = "Stop failed: " + (err.message || err);
      //   });
    },
    onScanError(_) {
      // silent or log error optionally
    },

    formatTimestamp(date) {
      return new Date(date).toLocaleString();
    },

    async startScanner() {
     
      if (!this.html5QrCode || this.isScanning) return;
      try {
    this.isLoading = true;
       // this.isShow = true;
       this.isScanning = true;
        await this.html5QrCode.start(
          //this.cameraId,
          {

            facingMode: "environment"
          },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          this.onScanSuccess,
          this.onScanError
        );
        this.isLoading = false;
         
        


      } catch (err) {
        this.error = "Failed to start scanner: " + (err.message || err);
      }
    },

    async stopScanner() {
      if (!this.html5QrCode || !this.isScanning) return;

      try {
        await this.html5QrCode.stop();
        this.isScanning = false;
      } catch (err) {
        this.error = "Failed to stop scanner: " + (err.message || err);
      }
    }
  },
  beforeDestroy() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().catch(() => { });
    }
  }
};
</script>
<style scoped>
#reader {
  min-height: 250px;
}
</style>
