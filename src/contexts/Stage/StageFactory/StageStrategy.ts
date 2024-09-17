import {
  LocalStageStream,
  StageAudioConfiguration,
  SubscribeType
} from 'amazon-ivs-web-broadcast';

import { StrategyMutators } from '../types';
import type Stage from './Stage';

const STAGE_MAX_AUDIO_BITRATE_KBPS = 128;

class StageStrategy {
  private shouldPublish = false;

  private mediaStreamToPublish?: MediaStream;

  private subscribeType = SubscribeType.AUDIO_ONLY;

  /**
   * Stage Strategy
   */

  stageStreamsToPublish(): LocalStageStream[] {
    const streams: LocalStageStream[] = [];

    const audioTrack = this.mediaStreamToPublish?.getAudioTracks()[0];
    const audioConfig: StageAudioConfiguration = {
      stereo: true,
      maxAudioBitrateKbps: STAGE_MAX_AUDIO_BITRATE_KBPS
    };
    if (audioTrack) {
      streams.push(new LocalStageStream(audioTrack, audioConfig));
    }

    return streams;
  }

  shouldPublishParticipant(): boolean {
    return this.shouldPublish;
  }

  shouldSubscribeToParticipant(): SubscribeType {
    /**
     * Only subscribe to participants that are audio only.
     */

    return this.subscribeType;
  }

  /**
   * Stage Strategy mutators
   */

  mutators(stage: Stage): StrategyMutators {
    /**
     * Calling 'mutators' with a Stage instance should replace that Stage's
     * strategy with the one for which the mutators will be generated.
     */
    stage.replaceStrategy(this);

    return {
      publish: this.publishMutator(stage),
      unpublish: this.unpublishMutator(stage),
      updateStreamsToPublish: this.updateStreamsMutator(stage)
    };
  }

  private publishMutator(stage: Stage) {
    /**
     * Invoking the `publish` method can optionally serve a dual purpose:
     *
     * 1. Sets the value of `shouldPublish` to `true` to attempt publishing
     *
     * 2. Optional: if `mediaStreamToPublish` is provided, then the streams
     *    to publish are updated as part of the same strategy refresh
     *
     * As such, `publish` can be invoked to seamlessly update an already published stream,
     * or to start publishing with a new or previously published stream, if one exists.
     */
    return (mediaStreamToPublish?: MediaStream) => {
      if (mediaStreamToPublish) {
        this.mediaStreamToPublish = mediaStreamToPublish;
      }

      this.shouldPublish = true;
      stage.refreshStrategy();
    };
  }

  private unpublishMutator(stage: Stage) {
    return () => {
      /**
       * Only update `shouldPublish` and leave `mediaStreamToPublish` as is
       * to allow for the currently media stream to be re-published later.
       */
      this.shouldPublish = false;
      stage.refreshStrategy();
    };
  }

  private updateStreamsMutator(stage: Stage) {
    return (mediaStreamToPublish: MediaStream) => {
      this.mediaStreamToPublish = mediaStreamToPublish;
      stage.refreshStrategy();
    };
  }
}

export default StageStrategy;
