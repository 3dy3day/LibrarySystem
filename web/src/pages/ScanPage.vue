<script setup lang="ts">
import { BrowserQRCodeReader, BrowserCodeReader } from '@zxing/browser';
import {
  Result,
  Exception
} from '@zxing/library';

import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useBookStore } from '@/stores/book';
import { useRouter } from 'vue-router';
import { api } from '@/lib/api';

const isbn   = ref('');
const status = ref('↘️ Please scan an ISBN code');
const manualInput = ref('');

const bookStore = useBookStore();
const router = useRouter();
let reader: BrowserQRCodeReader;


async function handleIsbn(code: string) {
  try {
    status.value = '🔍 Searching...';
    let book = await bookStore.findByIsbn(code);

    if (!book) {
      book = await bookStore.register({ title: 'Unknown', isbn13: code, author: 'Unknown' });
    }

    await router.push(`/books/${book.id}`);
  } catch (e) {
    console.error(e);
    status.value = '⚠️ Error occurred';
  }
}


onMounted(async () => {
  try {
    const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
    
    if (videoInputDevices.length === 0) {
      status.value = '📷 No camera found. Please enter ISBN manually.';
      return;
    }

    const selectedDeviceId = videoInputDevices[0].deviceId;
    
    console.log(`Starting camera with device ID: ${selectedDeviceId}`);
    
    const codeReader = new BrowserQRCodeReader();
    reader = codeReader;

    const previewElem = document.getElementById('video') as HTMLVideoElement;
    
    const controls = await codeReader.decodeFromVideoDevice(
      selectedDeviceId,
      previewElem,
      (result: Result | undefined, error: Exception | undefined) => {
        if (result) {
          const code = result.getText();
          if (code !== isbn.value) {
            isbn.value = code;
            handleIsbn(code);
          }
        } else if (error && error.name !== 'NotFoundException') {
          console.error('Scanning error:', error);
        }
      }
    );

    (reader as any).controls = controls;
    
  } catch (error: any) {
    console.error('Camera initialization failed:', error);
    
    if (error.name === 'NotReadableError') {
      status.value = '📷 Camera is busy or unavailable. Please close other apps using the camera and refresh.';
    } else if (error.name === 'NotAllowedError') {
      status.value = '🔒 Camera permission denied. Please allow camera access and refresh.';
    } else if (error.name === 'NotFoundError') {
      status.value = '📷 No camera found. Please enter ISBN manually.';
    } else if (error.name === 'NotSupportedError') {
      status.value = '📷 Camera not supported in this browser. Please enter ISBN manually.';
    } else {
      status.value = '📷 Camera failed to start. Please enter ISBN manually or check camera permissions.';
    }
  }
});

onBeforeUnmount(() => {
  if (reader) {
    try {
      if ((reader as any).controls) {
        (reader as any).controls.stop();
      }
      (reader as any).reset();
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  }
});

function handleManualInput() {
  if (manualInput.value.trim()) {
    handleIsbn(manualInput.value.trim());
  }
}
</script>

<template>
  <video id="video" class="fixed inset-0 w-full h-full object-cover" />

  <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-8">
    <div class="w-60 h-60 border-4 border-blue-400/70 rounded-xl mb-4"></div>
    <div class="text-white text-center font-bold bg-black/60 px-3 py-1 rounded mb-4">
      {{ isbn || status }}
    </div>
    
    <!-- Manual input fallback -->
    <div class="pointer-events-auto bg-white/90 p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Enter ISBN manually:
      </label>
      <div class="flex gap-2">
        <input 
          v-model="manualInput"
          type="text" 
          placeholder="Enter ISBN code"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="handleManualInput"
        />
        <button 
          @click="handleManualInput"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
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
