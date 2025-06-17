// src/stores/book.ts
import { defineStore } from 'pinia';
import { api } from '@/lib/api';

export const useBookStore = defineStore('book', {
  state: () => ({ cache: new Map<string, any>() }),

  actions: {
    async findByIsbn(isbn: string) {
      if (this.cache.has(isbn)) return this.cache.get(isbn);

      const { data } = await api.get('/books', { params: { q: isbn } });
      const hit = data.find(
        (b: any) => b.isbn10 === isbn || b.isbn13 === isbn
      );
      if (hit) this.cache.set(isbn, hit);
      return hit;
    },

    async register(book: any) {
      if (!book.author) book.author = 'Unknown';

      const { data } = await api.post('/books', book);
      this.cache.set(book.isbn13 ?? book.isbn10, data);
      return data;
    }
  }
});
