import type { CatalogType, Entity, Person } from '@/types/catalog'
import type { User } from '@/types/session'

export interface EditorProps {
  type: CatalogType
  item?: Entity
  tracks?: Entity[]
  album?: Entity
  libraryMode?: boolean
}

export interface AlbumEntry {
  album: Entity | NonNullable<Entity['albums']>[number]
  disc_number: number
  track_number: number
}

export function createEditorForm(props: EditorProps) {
  const e = props.item
  return {
    name: e?.name || '',
    description: e?.description || '',
    cover_id: e?.cover_id || null,
    release_date: e?.release_date || '',
    release_year: e?.release_year || null,
    edition: e?.edition || '',
    release_country: e?.release_country || '',
    label: e?.label || '',
    catalog_number: e?.catalog_number || '',
    musicbrainz_id: e?.musicbrainz_id || '',
    total_discs: e?.total_discs || null,
    total_tracks: e?.total_tracks || null,
    genre: e?.genre || '',
    recording_version: e?.recording_version || '',
    album_id: props.album?.id || null,
    library_id:
      e?.library_id ||
      (props.libraryMode && new Set(props.tracks?.map((song) => song.library_id)).size === 1
        ? props.tracks?.[0]?.library_id
        : '') ||
      '',
    is_public: e?.is_public ?? true,
  }
}

export type EditorForm = ReturnType<typeof createEditorForm>

interface EditorData {
  form: EditorForm
  artists: Person[]
  artwork: NonNullable<Entity['artwork']>
  members: User[]
  albumEntries: AlbumEntry[]
  recordingSongId: string
}

export function buildEntityPayload(type: CatalogType, data: EditorData, item?: Entity) {
  const { form, artists, artwork, members, albumEntries, recordingSongId } = data
  const body: Record<string, unknown> = {
    name: form.name,
    description: form.description,
    cover_id: form.cover_id,
  }
  if (type === 'playlists') {
    body.is_public = form.is_public
    body.collaborator_ids = members.map((m) => m.id)
  } else if (['songs', 'albums'].includes(type)) {
    Object.assign(body, {
      release_date: form.release_date || null,
      genre: form.genre,
      artist_ids: artists.map((a) => a.id),
    })
    if (type === 'albums')
      Object.assign(body, {
        artwork: artwork,
        release_year: form.release_year || null,
        edition: form.edition,
        release_country: form.release_country,
        label: form.label,
        catalog_number: form.catalog_number,
        musicbrainz_id: form.musicbrainz_id || null,
        total_discs: form.total_discs || null,
        total_tracks: form.total_tracks || null,
      })
    if (type === 'songs')
      Object.assign(body, {
        library_id: form.library_id,
        albums: albumEntries.map((entry) => ({
          album_id: entry.album.id,
          disc_number: entry.disc_number,
          track_number: entry.track_number,
        })),
        recording_version: form.recording_version,
        ...(recordingSongId ? { recording_song_id: recordingSongId } : {}),
      })
  }
  if (item && type !== 'playlists') body.version = item.version

  return body
}
