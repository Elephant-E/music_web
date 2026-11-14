<script lang="ts" setup>
import { usePlayerStore } from '@/stores/player'
import { duration, qualities } from '@/utils/format'
import EntityCover from './EntityCover.vue'

const player = usePlayerStore()
</script>
<template>
  <aside
    v-if="player.available"
    :class="['player', { collapsed: player.collapsed }]"
    aria-label="试听播放器"
  >
    <EntityCover :item="player.song || undefined" />
    <div class="player-title">
      <strong>{{ player.song?.name }}</strong><span
        >{{ player.file && qualities[player.file.quality] }} ·
        {{ player.file?.codec.toUpperCase() }}</span
      >
    </div>
    <button
      :aria-label="player.playing ? '暂停' : '播放'"
      :title="player.playing ? '暂停' : '播放'"
      class="play-button"
      @click="player.toggle()"
    >
      <svg aria-hidden="true" class="ui-icon playback-icon" viewBox="0 0 24 24">
        <path :d="player.playing ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'm8 5 11 7-11 7Z'" />
      </svg></button
    ><template v-if="!player.collapsed"
      ><span class="time">{{ duration(player.time) }}</span
      ><input
        :max="player.length || 1"
        :value="player.time"
        aria-label="播放进度"
        class="seek"
        min="0"
        step="0.1"
        type="range"
        @input="player.seek(Number(($event.target as HTMLInputElement).value))" /><span
        class="time"
        >{{ duration(player.length) }}</span
      ><input
        :value="player.volume"
        aria-label="音量"
        class="volume"
        max="1"
        min="0"
        step=".01"
        type="range"
        @input="player.setVolume(Number(($event.target as HTMLInputElement).value))" /></template
    ><button
      :aria-expanded="!player.collapsed"
      :aria-label="player.collapsed ? '展开播放器' : '收起播放器'"
      :title="player.collapsed ? '展开播放器' : '收起播放器'"
      class="icon-button"
      @click="player.collapsed = !player.collapsed"
    >
      <svg aria-hidden="true" class="ui-icon" viewBox="0 0 24 24">
        <path :d="player.collapsed ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'" />
      </svg></button
    ><button aria-label="关闭播放器" class="icon-button" title="关闭播放器" @click="player.close()">
      <svg aria-hidden="true" class="ui-icon" viewBox="0 0 24 24">
        <path d="m6 6 12 12M6 18 18 6" />
      </svg>
    </button>
  </aside>
</template>

<style scoped>
.player {
  position: fixed;
  z-index: 32;
  left: calc(var(--sidebar-width) + 20px);
  right: 20px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 76px;
  padding: 14px 24px;
  background: #fffffff5;
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 8px 40px #29203514;
  backdrop-filter: blur(20px);
}
.player > .cover {
  width: 46px;
  flex-shrink: 0;
}
.player-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 180px;
  min-width: 0;
}
.player-title strong {
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.player-title span {
  font-size: 11px;
  color: var(--muted);
}
.play-button {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  color: #fff;
  background: var(--purple);
}
.seek {
  flex: 1;
  min-width: 60px;
  accent-color: var(--purple);
}
.volume {
  width: 75px;
  accent-color: var(--purple);
}
.time {
  color: var(--muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.player.collapsed {
  left: auto;
  right: 12px;
  bottom: 12px;
  width: min(350px, calc(100% - 24px));
  padding: 8px 12px;
  min-height: 54px;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 4px 16px #28233512;
}
.collapsed .player-title {
  flex: 1;
}
@media (max-width: 760px) {
  .player {
    left: 16px;
    right: 16px;
    padding-inline: 16px;
  }
}
@media (max-width: 540px) {
  .player {
    left: 10px;
    right: 10px;
    bottom: 10px;
    flex-wrap: wrap;
    gap: 7px;
  }
  .player-title {
    flex: 1;
    width: 100px;
  }
  .seek {
    order: 5;
    flex-basis: 100%;
    margin: 0;
  }
  .volume {
    display: none;
  }
  .time {
    display: none;
  }
}
</style>
