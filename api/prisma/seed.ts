import { PrismaClient } from '@prisma/client'
import { GoogleBooksService } from '../src/services/googleBooks.service'

const prisma = new PrismaClient()

// ISBN codes for popular books
const isbns = [
  "9780061120084", // To Kill a Mockingbird
  "9780451524935", // 1984
  "9780141439518", // Pride and Prejudice
  "9780743273565", // The Great Gatsby
  "9780316769174", // The Catcher in the Rye
  "9780571056866", // Lord of the Flies
  "9780544003415", // The Lord of the Rings
  "9780747532699", // Harry Potter and the Philosopher's Stone
  "9780547928227", // The Hobbit
  "9781451673319", // Fahrenheit 451
  "9780141441146", // Jane Eyre
  "9780141439556", // Wuthering Heights
  "9780066238500", // The Chronicles of Narnia
  "9780060850524", // Brave New World
  "9780141439570", // The Picture of Dorian Gray
  "9780451526342", // Animal Farm
  "9780061122415", // The Alchemist
  "9780060883287", // One Hundred Years of Solitude
  "9781594631931", // The Kite Runner
  "9780375842207", // The Book Thief
  "9780156027328", // Life of Pi
  "9780385504201", // The Da Vinci Code
  "9780439023528", // The Hunger Games
  "9780307269751", // The Girl with the Dragon Tattoo
  "9780307588364", // Gone Girl
  "9780525478812", // The Fault in Our Stars
  "9780345803481", // Fifty Shades of Grey
  "9780399155345", // The Help
  "9781565125605", // Water for Elephants
  "9780156029438", // The Time Traveler's Wife
  "9780316666343", // The Lovely Bones
  "9780679781585", // Memoirs of a Geisha
  "9780142001745", // The Secret Life of Bees
  "9780060175405", // The Poisonwood Bible
  "9780385512107", // The Curious Incident of the Dog in the Night-Time
  "9780385618670", // Life After Life
  "9780316055437", // The Goldfinch
  "9781476746586", // All the Light We Cannot See
  "9780385490818", // The Handmaid's Tale
  "9780399167065", // Big Little Lies
  "9780735219090", // Where the Crawdads Sing
  "9780399590504", // Educated
  "9781524763138", // Becoming
  "9781501139239", // The Seven Husbands of Evelyn Hugo
  "9781984822178", // Normal People
  "9781250301697", // The Silent Patient
  "9780316556347", // Circe
  "9780525559474", // The Midnight Library
  "9780593135204", // Project Hail Mary
  "9780241425442"  // The Thursday Murder Club
]

async function main() {
  console.log('🌱 Starting seed with Google Books API...')

  // Clear existing books
  await prisma.book.deleteMany()
  console.log('🗑️  Cleared existing books')

  let createdCount = 0
  let failedCount = 0

  for (let i = 0; i < isbns.length; i++) {
    const isbn = isbns[i]
    try {
      console.log(`📚 Fetching book ${i + 1}/${isbns.length} (ISBN: ${isbn})...`)
      
      // Fetch book data from Google Books API
      const bookData = await GoogleBooksService.fetchByIsbn(isbn)
      
      if (bookData) {
        // Create book with complete information from Google Books API
        await prisma.book.create({
          data: {
            title: bookData.title,
            author: bookData.author,
            publisher: bookData.publisher,
            publishedAt: bookData.publishedAt,
            isbn10: bookData.isbn10,
            isbn13: bookData.isbn13,
            description: bookData.description,
            thumbnail: bookData.thumbnail
          }
        })
        createdCount++
        console.log(`✅ Created: "${bookData.title}" by ${bookData.author}`)
      } else {
        // Fallback: create with minimal data if Google Books API fails
        await prisma.book.create({
          data: {
            title: `Book with ISBN ${isbn}`,
            author: "Unknown",
            isbn13: isbn
          }
        })
        failedCount++
        console.log(`⚠️  Created fallback entry for ISBN: ${isbn}`)
      }

      // Add a small delay to be respectful to the Google Books API
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.log(`❌ Failed to create book with ISBN ${isbn}:`, error)
      failedCount++
    }
  }

  console.log(`\n📊 Seed Summary:`)
  console.log(`✅ Successfully created: ${createdCount} books with full details`)
  console.log(`⚠️  Fallback entries: ${failedCount} books`)
  console.log(`📚 Total books in database: ${createdCount + failedCount}`)
  console.log('🌱 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
