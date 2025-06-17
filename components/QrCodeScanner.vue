<template>
  <div id="reader" style="width: 500px"></div>
</template>

<script>
import { Html5QrcodeScanner } from 'html5-qrcode';

export default {
  name: 'QrCodeScanner',
  props: {
    qrbox: {
      type: Number,
      default: 250,
    },
    fps: {
      type: Number,
      default: 10,
    },
  },
  mounted() {
    // Ensure this runs only on the client side
    if (process.client) {
      const config = {
        fps: this.fps,
        qrbox: { width: this.qrbox, height: this.qrbox },
        // You can add more configurations here, like disableFlip, formatsToSupport, etc.
        // For more options, refer to the html5-qrcode documentation:
        // https://scanapp.org/html5-qrcode-docs/docs/getting-started/
      };

      const html5QrcodeScanner = new Html5QrcodeScanner('reader', config);

      html5QrcodeScanner.render(this.onScanSuccess, this.onScanError);
    }
  },
  methods: {
    onScanSuccess(decodedText, decodedResult) {
      // Handle the scanned QR code here
      console.log(`Code matched = ${decodedText}`, decodedResult);
      this.$emit('result', decodedText, decodedResult);
      // If you want to stop scanning after a successful scan:
      // html5QrcodeScanner.clear(); // You might need to store html5QrcodeScanner in data
    },
    onScanError(errorMessage) {
      // Handle scan errors (e.g., no camera, permission denied)
      console.error(`QR Code Scan Error: ${errorMessage}`);
      this.$emit('error', errorMessage);
    },
    stopScanner() {
      // If you stored html5QrcodeScanner in data, you can stop it here
      // if (this.html5QrcodeScanner) {
      //   this.html5QrcodeScanner.clear();
      // }
    }
  },
  beforeDestroy() {
    // Important: Clean up the scanner when the component is destroyed
    // This prevents memory leaks and camera access issues
    this.stopScanner();
  }
};
</script>

<style scoped>
/* Optional: Add some styling for your reader container */
#reader {
  border: 1px solid #ccc;
  width: 100%; /* Adjust as needed */
  max-width: 600px; /* Adjust as needed */
  margin: auto;
}
</style>