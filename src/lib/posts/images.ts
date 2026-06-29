import type { UploadFile } from '../api/types'

export function getImageUrls(images: UploadFile[]) {
  return images.map((image) => image.url)
}
