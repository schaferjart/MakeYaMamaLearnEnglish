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

// Mock localStorage
const localStorageMock = (function() {
    let store: { [key: string]: string } = {};
    return {
        getItem: function(key: string) {
            return store[key] || null;
        },
        setItem: function(key: string, value: string) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        },
        removeItem: function(key: string) {
            delete store[key];
        }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });
