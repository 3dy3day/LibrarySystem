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

/* ---------------- 画面状態 ---------------- */
const isbn   = ref('');       // 直近検出したコード
const status = ref('↘️ ISBN をかざしてください');   // 進捗/結果メッセージ

const bookStore = useBookStore();
const router = useRouter();
let reader: BrowserMultiFormatReader;

/* ---------------- コードを処理 ---------------- */
async function handleIsbn(code: string) {
  try {
    status.value = '🔍 検索中…';
    let book = await bookStore.findByIsbn(code);

    if (!book) {
      // 必要最低限だけ登録
      if (!book.author) book.author = 'Unknown';
      book = await bookStore.register({ title: 'Unknown', isbn13: code });
    }

    await router.push(`/books/${book.id}`);  // ← ここで遷移
  } catch (e) {
    console.error(e);
    status.value = '⚠️ エラーが発生';
  }
}

/* ---------------- マウント時に ZXing 初期化 ---------------- */
onMounted(() => {
  // 検出フォーマットを EAN-13 (ISBN13) のみにする
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);

  // 300 ms ごとにスキャン
  reader = new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 500
  });

  const isWide = window.innerWidth > 800;
  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: 'environment' },
      width:  { ideal: isWide ? 1280 : 640 },
      height: { ideal: isWide ? 720  : 480 },
      frameRate: { ideal: 30, max: 60 }   // ★ FPS 指定
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
  <!-- 全面ビデオ -->
  <video id="video" class="fixed inset-0 w-full h-full object-cover" />

  <!-- ガイド + メッセージ -->
  <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-8">
    <div class="w-60 h-60 border-4 border-blue-400/70 rounded-xl mb-4"></div>
    <div class="text-white text-center font-bold bg-black/60 px-3 py-1 rounded">
      {{ isbn || status }}
    </div>
  </div>
</template>

<style scoped>
/* iOS Safari でビデオが横向きになるのを防ぐ */
video {
  transform: scaleX(-1);
}
</style>
