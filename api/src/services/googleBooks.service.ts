interface GoogleBooksVolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: Array<{
    volumeInfo: GoogleBooksVolumeInfo;
  }>;
}

export const GoogleBooksService = {
  async fetchByIsbn(isbn: string) {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data: GoogleBooksResponse = await response.json();
      
      if (data.totalItems > 0 && data.items && data.items.length > 0) {
        const volumeInfo = data.items[0].volumeInfo;
        
        let isbn10 = '';
        let isbn13 = '';
        if (volumeInfo.industryIdentifiers) {
          for (const identifier of volumeInfo.industryIdentifiers) {
            if (identifier.type === 'ISBN_10') isbn10 = identifier.identifier;
            if (identifier.type === 'ISBN_13') isbn13 = identifier.identifier;
          }
        }
        
        return {
          title: volumeInfo.title || 'Unknown',
          author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown',
          publisher: volumeInfo.publisher,
          publishedAt: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : undefined,
          isbn10: isbn10 || undefined,
          isbn13: isbn13 || isbn,
          thumbnail: volumeInfo.imageLinks?.thumbnail
        };
      }
      return null;
    } catch (error) {
      console.error('Google Books API error:', error);
      return null;
    }
  }
};
