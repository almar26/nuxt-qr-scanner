<template>
  <div>
    <div id="reader" style="width: 600px;"></div>
    <v-btn @click="startScan()">Start Scan</v-btn>
    <v-btn @click="stopScan()">Stop Scan</v-btn>
    <p v-if="scannedResult">Scanned: {{ scannedResult }}</p>
  </div>
</template>

<script>
import { Html5Qrcode } from 'html5-qrcode';
export default {
  data() {
    return {
      scannedResult: null,
      html5QrCode: null
    }
  },
  mounted() {
    // Import only on client-side
    // if (process.client) {
    //   const { Html5Qrcode } = require("html5-qrcode");
    //   this.html5QrCode = new Html5Qrcode("reader");
    //   const config = { fps: 10, qrbox: 150 };

    //   this.html5QrCode.start(
    //     { facingMode: "environment" }, // back camera
    //     config,
    //     qrCodeMessage => {
    //       this.scannedResult = qrCodeMessage;
    //       //this.html5QrCode.stop(); // Stop after scanning
    //     },
    //     errorMessage => {
    //       // console.log(`QR Code no match: ${errorMessage}`);
    //     }
    //   );
    // }
  },
  methods: {
    startScan() {
      console.log("Start Scanning...")
      // Import only on client-side
      if (process.client) {
        // const { Html5Qrcode } = require("html5-qrcode");
        this.html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: 250 };

        this.html5QrCode.start(
          { facingMode: "environment" }, // back camera
          config,
          qrCodeMessage => {
            this.scannedResult = qrCodeMessage;
            //this.html5QrCode.stop(); // Stop after scanning
          },
          errorMessage => {
            console.log(`QR Code no match: ${errorMessage}`);
          }
        );
      }

    },

    stopScan() {
      //  const { Html5Qrcode } = require("html5-qrcode")
      //  this.html5QrCode = new Html5Qrcode("reader");;
      this.html5QrCode.stop().then(() => {
        console.log("QR Code scanning is stopped")
      })
    }
  },
  beforeDestroy() {
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode.clear();
      });
    }
  }
}
</script>

<style scoped>
/* Optional: Add some styling for your reader container */
#reader {
  border: 1px solid #ccc;
  width: 100%;
  /* Adjust as needed */
  max-width: 600px;
  /* Adjust as needed */
  margin: auto;
}
</style>
