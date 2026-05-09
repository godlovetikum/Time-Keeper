import { NativeModules } from 'react-native';
const { TimerService } = NativeModules;

export default {
  start: (timersJson: string): Promise<boolean> => TimerService.start(timersJson),
  update: (timersJson: string): Promise<boolean> => TimerService.update(timersJson),
  stop: (): Promise<boolean> => TimerService.stop(),
};
