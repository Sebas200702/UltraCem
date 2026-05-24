class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channelData = input[0];
      if (channelData) {
        this.port.postMessage(channelData.slice());
      }
    }
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);