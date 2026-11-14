export const defaultHistoryCategory = 'without_uploads'
export const historyCategoryOptions = [
  { value: defaultHistoryCategory, label: '排除上传' },
  { value: 'all', label: '全部记录' },
  { value: 'upload', label: '上传与引用' },
  { value: 'create', label: '新建' },
  { value: 'update', label: '修改' },
  { value: 'organize', label: '整理与排序' },
  { value: 'delete', label: '删除' },
  { value: 'restore', label: '恢复' },
  { value: 'other', label: '其他操作' },
]

export const actions: Record<string, string> = {
  created: '创建了',
  updated: '修改了',
  published: '上传了',
  deleted: '删除了',
  merged: '合并了',
  restored: '恢复了',
  'metadata.updated': '补全了 todb 资料',
  'role.updated': '修改了用户角色',
}
export const fields: Record<string, string> = {
  name: '名称',
  description: '简介',
  recording_version: '录音版本',
  lyrics: '歌词',
  genre: '风格',
  library_name: '所属媒体库',
  albums: '专辑收录与曲序',
  release_date: '发行日期',
  is_public: '公开歌单',
  cover_id: '封面',
  collaborator_ids: '协作者',
  todb_id: 'todb 关联',
  is_default: '系统默认',
  deleted_at: '删除时间',
  track_number: '曲序',
  disc_number: '碟号',
  file_name: '文件名',
  quality: '音质',
  role: '角色',
}
export function formatValue(v: unknown) {
  if (v === null || v === undefined || v === '') return '未填写'
  if (typeof v === 'boolean') return v ? '是' : '否'
  if (Array.isArray(v))
    return (
      v
        .map((entry) =>
          typeof entry === 'object' && entry !== null && 'name' in entry
            ? 'album_id' in entry
              ? `${entry.name} · 第 ${entry.disc_number} 碟第 ${entry.track_number} 首`
              : 'content' in entry
                ? `${entry.name}${entry.is_default ? ' · 默认' : ''}（${entry.format} / ${entry.language} / ${entry.kind}）\n${entry.content}`
                : String(entry.name)
            : typeof entry === 'object' && entry !== null && 'album_id' in entry
              ? `专辑 ${entry.album_id} · 第 ${entry.disc_number} 碟第 ${entry.track_number} 首`
              : String(entry),
        )
        .join('\n\n')
        .slice(0, 1200) || '未填写'
    )
  return String(v).slice(0, 1200)
}
