<template>
  <v-container class="fill-height d-flex flex-column justify-center align-center">
    <v-card>
      
    </v-card>
    <v-card class="pa-6 text-center" max-width="400">
      <v-card-title class="headline">Tap Entry</v-card-title>
      <v-card-text>
        <div class="mb-4">
          <v-avatar size="100" class="mx-auto mb-3">
            <v-icon size="80">mdi-account</v-icon>
          </v-avatar>
          <div class="subtitle-1 grey--text">{{ currentTime }}</div>
        </div>

        <!-- <v-text-field
          v-model="name"
          label="Enter Your Name"
          outlined
          hide-details
          @keyup.enter="handleTap"
        /> -->
        <v-text-field ref="nameInput" v-model="name" label="Enter Your Name" outlined hide-details
          @keyup.enter="handleTap" />

        <v-btn color="primary" large block @click="handleTap">
          <v-icon left>mdi-fingerprint</v-icon>
          Tap to Check In
        </v-btn>

        <v-btn text class="mt-3" @click="showScanner = !showScanner">
          {{ showScanner ? 'Hide' : 'Scan QR Instead' }}
        </v-btn>

        <div v-if="showScanner" class="mt-3">
          <qrcode-stream @decode="onDecode" @init="onInit" />
        </div>
      </v-card-text>
    </v-card>

    <!-- Log Table -->
    <v-card class="mt-6" max-width="700" outlined>
      <v-card-title class="subtitle-1 font-weight-bold">Log History</v-card-title>
      <v-data-table :headers="headers" :items="logs" dense disable-pagination hide-default-footer>
        <template v-slot:item.timestamp="{ item }">
          {{ new Date(item.timestamp).toLocaleString() }}
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar" color="success">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'

export default {
  middleware: ['auth'],
  components: {
    QrcodeStream
  },
  data() {
    return {
      name: '',
      snackbar: false,
      snackbarMessage: '',
      showScanner: false,
      currentTime: '',
      logs: [],
      headers: [
        { text: 'Name / QR', value: 'name' },
        { text: 'Timestamp', value: 'timestamp' }
      ]
    }
  },
  mounted() {
    this.updateClock()
    setInterval(this.updateClock, 1000)
  },
  methods: {
    updateClock() {
      this.currentTime = new Date().toLocaleTimeString()
    },
    handleTap() {
      if (!this.name) {
        this.snackbarMessage = 'Please enter your name'
        this.snackbar = true
        return
      }

      this.addLog(this.name)
      this.snackbarMessage = `Welcome, ${this.name}! Entry recorded.`
      this.snackbar = true
      this.name = ''

      this.$nextTick(() => {
        this.$refs.nameInput?.focus()
      })
    },
    onDecode(result) {
      this.addLog(result)
      this.snackbarMessage = `Scanned QR: ${result}`
      this.snackbar = true
    },
    addLog(name) {
      this.logs.unshift({
        name,
        timestamp: new Date().toISOString()
      })
    },
    onInit(promise) {
      promise.catch(err => {
        console.error('Failed to init QR scanner:', err)
      })
    }
  }
}
</script>
