if (typeof Blob.prototype.arrayBuffer === 'undefined') {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result as ArrayBuffer);
      };
      fr.readAsArrayBuffer(this);
    });
  };
}
