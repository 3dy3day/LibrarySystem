import { defineStore } from 'pinia';
import { api } from '@/lib/api';

export const useBookStore = defineStore('book', {
  state: () => ({ 
    cache: new Map<string, any>(),
    books: [] as any[]
  }),

  actions: {
    async findByIsbn(isbn: string) {
      if (this.cache.has(isbn)) return this.cache.get(isbn);

      const { data } = await api.get(`/books/isbn/${isbn}`);
      this.cache.set(isbn, data);
      return data;
    },

    async list(query?: string, status?: string, author?: string) {
      const params: any = {};
      if (query) params.q = query;
      if (status) params.status = status;
      if (author) params.author = author;
      
      const { data } = await api.get('/books', { params });
      this.books = data;
      return data;
    },

    async get(id: string) {
      if (this.cache.has(id)) return this.cache.get(id);
      
      const { data } = await api.get(`/books/${id}`);
      this.cache.set(id, data);
      return data;
    },

    async register(book: any) {
      if (!book.author) book.author = 'Unknown';

      const { data } = await api.post('/books', book);
      this.cache.set(book.isbn13 ?? book.isbn10, data);
      this.books.push(data);
      return data;
    },

    async create(bookData: any) {
      const { data } = await api.post('/books', bookData);
      this.books.push(data);
      this.cache.set(data.id, data);
      return data;
    },

    async update(id: string, bookData: any) {
      const { data } = await api.patch(`/books/${id}`, bookData);
      this.cache.set(id, data);
      const index = this.books.findIndex(b => b.id === id);
      if (index !== -1) this.books[index] = data;
      return data;
    },

    async remove(id: string) {
      await api.delete(`/books/${id}`);
      this.cache.delete(id);
      this.books = this.books.filter(b => b.id !== id);
    },

    async setStatus(id: string, status: string) {
      const { data } = await api.patch(`/books/${id}/status`, { status });
      this.cache.set(id, data);
      const index = this.books.findIndex(b => b.id === id);
      if (index !== -1) this.books[index] = data;
      return data;
    }
  }
});
