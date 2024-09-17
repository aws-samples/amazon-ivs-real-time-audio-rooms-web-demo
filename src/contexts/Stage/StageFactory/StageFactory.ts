import { StageClientConfig } from '@Shared/types';

import Stage from './Stage';

class StageFactory {
  private static readonly stages = new Map<string, Stage>();

  static create(stageConfig: StageClientConfig) {
    let stage = StageFactory.stages.get(stageConfig.participantId);

    if (!stage) {
      stage = new Stage(stageConfig);

      StageFactory.stages.set(stageConfig.participantId, stage);

      // Attach the stages to the window for debugging purposes
      Object.assign(window, { stages: StageFactory.stages });
    }

    return stage;
  }

  private static destroyStage(stage: Stage) {
    stage.leave();
    stage.removeAllListeners();
    StageFactory.stages.delete(stage.localParticipantId);

    if (!StageFactory.stages.size) {
      delete (window as any).stages; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }

  static destroyStages() {
    StageFactory.stages.forEach(StageFactory.destroyStage);
  }

  static leaveStages() {
    StageFactory.stages.forEach((stage) => stage.leave());
  }
}

export default StageFactory;
