/**
 * 分页契约。
 *
 * 后端 app/Http/Controllers/Controller.php 的 pageSize() 限定 page_size ∈ [1, 60]，
 * 超出会直接返回 422（「page size 必须介于 1 - 60 之间」）。
 * 所有请求都应从这里取页大小，避免再写出越界值。
 */
export const MAX_PAGE_SIZE = 60

/** 列表页可选的每页条数 */
export const PAGE_SIZES: readonly number[] = [24, 48, MAX_PAGE_SIZE]

/** 详情页曲目列表的默认页大小 */
export const DETAIL_SONG_PAGE_SIZE = 24
