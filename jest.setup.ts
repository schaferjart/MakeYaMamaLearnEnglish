if (typeof Blob.prototype.arrayBuffer === 'undefined') {
  Object.defineProperty(Blob.prototype, 'arrayBuffer', {
    value: function () {
      return new Promise((resolve) => {
        const fr = new FileReader();
        fr.onload = () => {
          resolve(fr.result as ArrayBuffer);
        };
        fr.readAsArrayBuffer(this);
      });
    },
  });
}
