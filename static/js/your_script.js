const { spawn } = require('child_process');

function sendInput(text, pythonProcess) {
  return new Promise((resolve, reject) => {
    pythonProcess.stdin.write(text + '\n');
    pythonProcess.stdin.end(); // End input stream
    resolve();
  });
}

function receiveOutput(pythonProcess) {
  return new Promise((resolve, reject) => {
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Python script exited with code ' + code));
        return;
      }

      resolve(output.trim()); // Resolve with the output
    });
  });
}

async function sendAndReceiveOutput(text) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['test_script.py']);

    sendInput(text, python)
      .then(() => receiveOutput(python))
      .then(resolve)
      .catch(reject);
  });
}