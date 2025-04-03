// Type definitions for YouTube Player API
interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
  
  declare namespace YT {
    class Player {
      constructor(elementId: string, options: PlayerOptions);
      
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getPlayerState(): number;
      getCurrentTime(): number;
      getDuration(): number;
      getVideoUrl(): string;
      getVideoEmbedCode(): string;
      getVideoData(): any;
      getAvailableQualityLevels(): string[];
      getPlaybackQuality(): string;
      setPlaybackQuality(suggestedQuality: string): void;
      getPlaybackRate(): number;
      setPlaybackRate(suggestedRate: number): void;
      getAvailablePlaybackRates(): number[];
      getVideoLoadedFraction(): number;
      getVolume(): number;
      setVolume(volume: number): void;
      mute(): void;
      unMute(): void;
      isMuted(): boolean;
      getIframe(): HTMLIFrameElement;
      destroy(): void;
    }
  
    interface PlayerEvent {
      target: Player;
      data: any;
    }
  
    interface OnStateChangeEvent {
      target: Player;
      data: number;
    }
  
    interface PlayerOptions {
      videoId?: string;
      width?: number | string;
      height?: number | string;
      playerVars?: {
        autoplay?: 0 | 1;
        cc_load_policy?: 0 | 1;
        color?: 'red' | 'white';
        controls?: 0 | 1 | 2;
        disablekb?: 0 | 1;
        enablejsapi?: 0 | 1;
        end?: number;
        fs?: 0 | 1;
        hl?: string;
        iv_load_policy?: 1 | 3;
        list?: string;
        listType?: 'playlist' | 'search' | 'user_uploads';
        loop?: 0 | 1;
        modestbranding?: 0 | 1;
        origin?: string;
        playlist?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        start?: number;
        widget_referrer?: string;
      };
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
        onPlaybackQualityChange?: (event: PlayerEvent) => void;
        onPlaybackRateChange?: (event: PlayerEvent) => void;
        onError?: (event: PlayerEvent) => void;
        onApiChange?: (event: PlayerEvent) => void;
      };
    }
  
    const PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  }
  