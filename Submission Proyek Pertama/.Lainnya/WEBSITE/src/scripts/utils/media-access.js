export async function getCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw error;
  }
}

export async function getMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw error;
  }
}
