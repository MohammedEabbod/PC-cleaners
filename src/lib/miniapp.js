export const miniapp = {
    // Check if running in Hylid/SuperQi environment
    isNative: () => {
        const isNative = typeof window !== 'undefined' && (window.my || window.m_y);
        // Uncomment below to debug on device if needed
        // if (!isNative) alert('Not Native Environment: window.my is undefined');
        return isNative;
    },

    // Authentication
    getAuthCode: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.getAuthCode({
                    scopes: ['auth_base', 'USER_ID'],
                    success: (res) => resolve(res),
                    fail: (err) => {
                        console.error('Auth Failed:', err);
                        reject(err);
                    },
                });
            } else {
                // If not native, REJECT so we know it's not working, instead of fake success
                console.warn('Not in Native SuperQi Environment');
                alert('عذراً، هذا التطبيق يعمل فقط داخل تطبيق Super Qi');
                reject(new Error('Not Native Environment'));
            }
        });
    },

    // Get Location
    getLocation: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.getLocation({
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                alert('خدمة الموقع غير متاحة في المتصفح');
                reject(new Error('Location not supported in browser'));
            }
        });
    },

    // Payment
    tradePay: (paymentUrl) => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.tradePay({
                    paymentUrl: paymentUrl,
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                alert('الدفع غير متاح في المتصفح');
                reject(new Error('Payment not supported in browser'));
            }
        });
    },

    // Scan
    scan: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.scan({
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                alert('الماسح الضوئي غير متاح');
                reject(new Error('Scan not supported'));
            }
        });
    },

    // Choose Image
    chooseImage: () => {
        return new Promise((resolve, reject) => {
            if (miniapp.isNative()) {
                window.my.chooseImage({
                    count: 1,
                    success: (res) => resolve(res),
                    fail: (err) => reject(err),
                });
            } else {
                // Mock for Browser
                // Simulate picking an image
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            resolve({ apFilePaths: [evt.target.result] });
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            }
        });
    },

    // Open Location in Native Map
    openLocation: (lat, lng, name, address) => {
        if (miniapp.isNative()) {
            window.my.openLocation({
                latitude: lat,
                longitude: lng,
                name: name || 'Location',
                address: address || '',
            });
        } else {
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(url, '_blank');
        }
    }
};
