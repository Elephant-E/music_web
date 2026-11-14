import { createSHA256 } from 'hash-wasm'
import { parseBlob } from 'music-metadata'
import type { UploadDraftMetadata } from '@/types/uploads'

self.onmessage = async (event: MessageEvent<{ file: File; audio: boolean }>) => {
  const { file, audio } = event.data
  try {
    let metadata: UploadDraftMetadata = {}
    if (audio) {
      try {
        const parsed = await parseBlob(file, { skipCovers: true })
        metadata = {
          title: parsed.common.title,
          artist: parsed.common.artist || parsed.common.artists?.join(' / '),
          album: parsed.common.album,
          albumArtist: parsed.common.albumartist,
          year: parsed.common.year,
          label: parsed.common.label?.join(' / '),
          catalogNumber: parsed.common.catalognumber?.join(' / '),
          releaseCountry: parsed.common.releasecountry,
          musicbrainzId: parsed.common.musicbrainz_albumid,
          trackTotal: parsed.common.track.of || undefined,
          discTotal: parsed.common.disk.of || undefined,
          track: parsed.common.track.no || 1,
          disc: parsed.common.disk.no || 1,
          duration: parsed.format.duration,
          lyrics: parsed.common.lyrics,
        }
      } catch {
        // Local tags are a preview; the metadata service validates uploaded audio.
      }
    }
    self.postMessage({ type: 'metadata', metadata })
    const hasher = await createSHA256()
    hasher.init()
    const chunkSize = 4 * 1024 * 1024
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer()
      hasher.update(new Uint8Array(chunk))
      self.postMessage({
        type: 'progress',
        progress: Math.round((Math.min(file.size, offset + chunk.byteLength) / file.size) * 100),
      })
    }
    self.postMessage({ type: 'complete', sha256: hasher.digest('hex'), metadata })
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : '读取文件失败。',
    })
  }
}
