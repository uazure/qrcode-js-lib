# qrcode-js-lib
JavaScript QR Code Generator Library.
Solely based on the original work by Andriy Syrovenko (@andriy-s)
https://github.com/andriy-s/qx-qrcode

## Basic usage
    // instantiate QRCode library. Specify canvasElement (required), string to encode and pixel scale
    var qr = new QRCodeLib(document.getElementById('canvas'), '', 8);
    qr.encode('Some text');

See usage example on demo page: http://uazure.github.io/qrcode-js-lib/demo/

## License:
This work is dual-licensed under the terms of either

    * GNU Lesser General Public License (LGPL) 2.1

or

    * Eclipse Public License (EPL)

