import Vue from "vue";

if (process.client) {
  const { Html5QrcodeScanner, Html5Qrcode } = require("html5-qrcode");

  Vue.prototype.$html5QrcodeScanner = Html5QrcodeScanner;
  Vue.prototype.$html5Qrcode = Html5Qrcode;
}
