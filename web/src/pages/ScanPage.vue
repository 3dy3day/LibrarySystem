<script setup lang="ts">
import { BrowserMultiFormatReader } from '@zxing/browser';
import {
  BarcodeFormat,
  DecodeHintType,
  Result,
  Exception
} from '@zxing/library';

import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useBookStore } from '@/stores/book';
import { useRouter } from 'vue-router';
import { api } from '@/lib/api';

const isbn   = ref('');
const status = ref('↘️ Please scan an ISBN code');

const bookStore = useBookStore();
const router = useRouter();
let reader: BrowserMultiFormatReader;


async function handleIsbn(code: string) {
  try {
    status.value = '🔍 Searching...';
    let book = await bookStore.findByIsbn(code);

    if (!book) {

      if (!book.author) book.author = 'Unknown';
      book = await bookStore.register({ title: 'Unknown', isbn13: code });
    }

    await router.push(`/books/${book.id}`);
  } catch (e) {
    console.error(e);
    status.value = '⚠️ Error occurred';
  }
}


onMounted(() => {

  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);


  reader = new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 500
  });

  const isWide = window.innerWidth > 800;
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: 'environment' },
      width:  { ideal: isWide ? 1280 : 640 },
      height: { ideal: isWide ? 720  : 480 },
      frameRate: { ideal: 30, max: 60 }
    }
  };

  reader.decodeFromConstraints(
    constraints,
    'video',
    (result: Result | undefined, err: Exception | undefined) => {
      if (result) {
        const code = result.getText();
        if (code !== isbn.value) {
          isbn.value = code;
          handleIsbn(code);
        }
      } else if (err && err.name !== 'NotFoundException') {
        console.error(err);
      }
    }
  );
});

onBeforeUnmount(() => {
  (reader as any).reset() 
});
</script>

<template>

  <video id="video" class="fixed inset-0 w-full h-full object-cover" />


  <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-8">
    <div class="w-60 h-60 border-4 border-blue-400/70 rounded-xl mb-4"></div>
    <div class="text-white text-center font-bold bg-black/60 px-3 py-1 rounded">
      {{ isbn || status }}
    </div>
  </div>
</template>

<style scoped>

video {
  transform: scaleX(-1);
}
</style>
