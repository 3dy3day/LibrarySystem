<script setup lang="ts">
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  BarcodeFormat,
  DecodeHintType,
  Result,
  Exception
} from '@zxing/library';

import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const isbn = ref('');
const status = ref('📱 Position the barcode within the rectangle');
const isScanning = ref(true);
const isNavigating = ref(false);

const router = useRouter();
let reader: BrowserMultiFormatReader;
let navigationTimeout: NodeJS.Timeout | null = null;

function stopCamera() {
  if (reader) {
    try {
      // Stop all video streams
      const videoElement = document.getElementById('video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    } catch (error) {
      console.warn('Error stopping camera:', error);
    }
  }
}

function handleScanResult(code: string) {
  if (isNavigating.value) return; // Prevent multiple navigation attempts
  
  isbn.value = code;
  status.value = '✅ Barcode detected! Processing...';
  isScanning.value = false;
  
  // Stop the camera immediately
  stopCamera();
  
  // Navigate to confirmation page after a brief delay to show the success message
  navigationTimeout = setTimeout(() => {
    navigateToConfirmation(code);
  }, 1500);
}

function proceedToConfirmation() {
  if (isbn.value && !isNavigating.value) {
    // Clear any pending automatic navigation
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
      navigationTimeout = null;
    }
    
    navigateToConfirmation(isbn.value);
  }
}

function navigateToConfirmation(code: string) {
  if (isNavigating.value) return; // Prevent multiple navigation attempts
  
  isNavigating.value = true;
  stopCamera();
  
  router.push(`/scan/confirm/${code}`).catch(error => {
    console.error('Navigation error:', error);
    isNavigating.value = false;
  });
}

function startScanning() {
  const hints = new Map();
  // Support multiple barcode formats for better recognition
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39
  ]);
  
  // Improve accuracy with additional hints
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.ASSUME_GS1, true);

  reader = new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 200, // Faster scanning attempts
    delayBetweenScanSuccess: 500
  });

  const isWide = window.innerWidth > 800;
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: isWide ? 1920 : 1280 }, // Higher resolution for better recognition
      height: { ideal: isWide ? 1080 : 720 },
      frameRate: { ideal: 30, max: 60 },
    }
  };

  reader.decodeFromConstraints(
    constraints,
    'video',
    (result: Result | undefined, err: Exception | undefined) => {
      if (result) {
        const code = result.getText();
        handleScanResult(code);
      } else if (err && err.name !== 'NotFoundException') {
        console.error(err);
      }
    }
  );
}

onMounted(() => {
  startScanning();
});

onBeforeUnmount(() => {
  // Clear any pending navigation timeout
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
  }
  
  // Stop the camera
  stopCamera();
});
</script>

<template>
  <video id="video" class="fixed inset-0 w-full h-full object-cover" />

  <!-- Scanning overlay -->
  <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
    <!-- Centered scanning rectangle -->
    <div class="w-64 h-40 border-4 border-blue-400/70 rounded-xl mb-8 relative">
    </div>
    
    <!-- Status and controls -->
    <div class="pointer-events-auto flex flex-col items-center space-y-4">
      <div class="text-white text-center font-bold bg-black/80 px-4 py-2 rounded-lg max-w-xs">
        {{ status }}
      </div>
      
      <div v-if="isbn" class="text-white text-center bg-green-600/80 px-4 py-2 rounded-lg">
        Latest ISBN: {{ isbn }}
      </div>
      
      <div v-if="isbn">
        <button 
          @click="proceedToConfirmation"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Proceed
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

video {
  transform: scaleX(-1);
}
</style>
