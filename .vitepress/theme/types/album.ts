export interface Photo {
  id: string
  src: string
  alt: string
  date?: string
  description?: string
}

export interface Album {
  id: string
  title: string
  date: string
  description: string
  cover: string
  photos: Photo[]
}
