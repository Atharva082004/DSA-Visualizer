export function animateTransition(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export async function animateValue(from, to, duration, callback) {
  const startTime = Date.now();

  return new Promise((resolve) => {
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOut(progress);

      const value = from + (to - from) * easedProgress;
      callback(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    animate();
  });
}
