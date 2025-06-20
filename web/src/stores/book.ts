// src/stores/book.ts
import { defineStore } from 'pinia';
import { api } from '@/lib/api';

export const useBookStore = defineStore('book', {
  state: () => ({ cache: new Map<string, any>() }),

  actions: {
    async findByIsbn(isbn: string) {
      if (this.cache.has(isbn)) return this.cache.get(isbn);

      const { data } = await api.get(`/books/isbn/${isbn}`);
      this.cache.set(isbn, data);
      return data;
    },

    async getBookInfo(isbn: string) {
      const { data } = await api.get(`/books/isbn/${isbn}/info`);
      return data;
    },

    async register(book: any) {
      if (!book.author) book.author = 'Unknown';

      const { data } = await api.post('/books', book);
      this.cache.set(book.isbn13 ?? book.isbn10, data);
      return data;
    },

    async deleteBook(id: string) {
      await api.delete(`/books/${id}`);
      // Remove from cache if it exists
      for (const [key, value] of this.cache.entries()) {
        if (value.id === id) {
          this.cache.delete(key);
          break;
        }
      }
    }
  }
});
