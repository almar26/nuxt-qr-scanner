<template>
  <div>
<div>
    <h1>Nuxt 2 QR Code Scanner</h1>
    <button @click="loadScanner" v-if="!scannerLoaded">Load Scanner</button>
    <div v-if="scannerLoaded">
      <component :is="QrCodeScannerComponent" @result="handleQrCodeResult" @error="handleQrCodeError" />
    </div>
    <div v-if="scannedResult">
      <p>Scanned QR Code: {{ scannedResult }}</p>
    </div>
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scannerLoaded: false,
      QrCodeScannerComponent: null,
      scannedResult: null,
    };
  },
  methods: {
    async loadScanner() {
      // Dynamically import the component
      const { default: QrCodeScanner } = await import('~/components/QrCodeScanner.vue');
      this.QrCodeScannerComponent = QrCodeScanner;
      this.scannerLoaded = true;
    },
    handleQrCodeResult(decodedText) {
      this.scannedResult = decodedText;
      alert('QR Code Scanned: ' + decodedText);
    },
    handleQrCodeError(error) {
      console.error('Scanner error:', error);
    },
  },
};
</script>

